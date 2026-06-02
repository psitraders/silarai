using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;
using System.Text;
using System.Text.Json;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Public chatbot endpoint for external clients.
/// No auth required — protected by API key in the URL.
/// Uses AllowWidget CORS policy (any origin) because this is embedded on external websites.
/// </summary>
[ApiController]
[Route("api/v1/chatbot")]
[EnableCors("AllowWidget")]
public class ChatbotController(
    AppDbContext db,
    IAiProvider aiProvider,
    IConversationMemoryService chatMemory,
    IHttpClientFactory httpClientFactory,
    ILogger<ChatbotController> logger) : ControllerBase
{
    [HttpPost("{apiKey}/message")]
    public async Task<IActionResult> Chat(
        string apiKey,
        [FromBody] ChatbotMessageRequest request,
        CancellationToken ct)
    {
        // ── Resolve client by API key ─────────────────────────────────────────
        var client = await db.ChatbotClients
            .Where(c => c.ApiKey == apiKey && c.IsActive)
            .FirstOrDefaultAsync(ct);

        if (client == null)
            return NotFound(new { error = "Invalid or inactive API key." });

        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Message is required." });

        var sessionId = $"bot_{client.Id}_{request.SessionId?.Trim() ?? Guid.NewGuid().ToString()}";

        // ── Load products ─────────────────────────────────────────────────────
        var products = await db.ChatbotProducts
            .Where(p => p.ClientId == client.Id && p.IsAvailable)
            .OrderBy(p => p.Category).ThenBy(p => p.Title)
            .ToListAsync(ct);

        // ── Build system prompt ───────────────────────────────────────────────
        var systemPrompt = BuildSystemPrompt(client, products);

        // ── Get conversation history ──────────────────────────────────────────
        var history = chatMemory.GetHistory(sessionId);

        // ── Call AI ───────────────────────────────────────────────────────────
        var aiReply = await aiProvider.HandleConversationAsync(
            new ConversationRequest(systemPrompt, history, request.Message), ct);

        var replyText = aiReply.ReplyText;

        // ── Handle order_ready state ──────────────────────────────────────────
        object? orderData = null;
        if (aiReply.StateSignal?.ToLower() == "order_ready"
            && !string.IsNullOrWhiteSpace(aiReply.ExtractedCartJson))
        {
            List<ChatbotCartItem>? cart = null;
            try
            {
                cart = JsonSerializer.Deserialize<List<ChatbotCartItem>>(
                    aiReply.ExtractedCartJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch { /* ignore malformed */ }

            if (cart != null && cart.Count > 0)
            {
                orderData = new
                {
                    customerName    = aiReply.ExtractedName,
                    customerPhone   = aiReply.ExtractedPhone,
                    deliveryAddress = aiReply.ExtractedAddress,
                    paymentMethod   = aiReply.ExtractedPaymentMethod ?? "cod",
                    items           = cart.Select(i => new
                    {
                        title     = i.Title,
                        qty       = i.Qty,
                        unitPrice = i.UnitPrice,
                        variant   = i.VariantInfo,
                    }).ToList(),
                    total = cart.Sum(i => i.Qty * i.UnitPrice),
                };

                // ── Fire webhook to client's system if configured ─────────────
                if (!string.IsNullOrWhiteSpace(client.WebhookUrl))
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var http = httpClientFactory.CreateClient();
                            var payload = JsonSerializer.Serialize(new
                            {
                                clientId  = client.Id,
                                sessionId = request.SessionId,
                                order     = orderData,
                            });
                            await http.PostAsync(client.WebhookUrl,
                                new StringContent(payload, Encoding.UTF8, "application/json"));
                        }
                        catch (Exception ex)
                        {
                            logger.LogWarning(ex, "Chatbot webhook delivery failed for client {Id}", client.Id);
                        }
                    }, CancellationToken.None);
                }
            }
        }

        // ── Always return relevant product cards ──────────────────────────────
        // Strategy: keyword-match user message against category + title.
        // Fall back to a spread across all categories so cards ALWAYS appear.
        var msgLower = request.Message.ToLowerInvariant();
        var allWords = msgLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        // Score every product against the user's message
        var scored = products.Select(p =>
        {
            var searchable = ((p.Category ?? "") + " " + p.Title + " " + (p.Description ?? "")).ToLowerInvariant();
            var score = allWords.Count(w => w.Length >= 3 && searchable.Contains(w));
            return (product: p, score);
        }).ToList();

        var topMatches = scored.Where(x => x.score > 0)
                               .OrderByDescending(x => x.score)
                               .Take(6)
                               .Select(x => x.product)
                               .ToList();

        // If nothing matched, return a spread across categories (always show cards)
        if (topMatches.Count == 0 && products.Count > 0)
        {
            topMatches = products
                .GroupBy(p => p.Category ?? "Other")
                .OrderBy(g => g.Key)
                .SelectMany(g => g.Take(1))   // 1 per category
                .Take(6)
                .ToList();
        }

        // NOTE: do NOT cast to (object) — System.Text.Json loses all properties on object-typed lists
        var mentionedProducts = topMatches.Select(p => new {
            p.Id, p.Title, p.Description, p.Price, p.SalePrice,
            p.Variants, p.ImageUrl, p.Category,
        }).ToList();

        // ── Save to memory ────────────────────────────────────────────────────
        chatMemory.AddMessages(sessionId,
            new ConversationMessage("user",      request.Message),
            new ConversationMessage("assistant", replyText));

        return Ok(new
        {
            sessionId        = request.SessionId,
            reply            = replyText,
            mentionedProducts,
            orderData,
            isOrderReady     = orderData != null,
        });
    }

    // ── Widget info endpoint (for embed script) ───────────────────────────────
    [HttpGet("{apiKey}/config")]
    public async Task<IActionResult> GetConfig(string apiKey, CancellationToken ct)
    {
        // Check existence separately from active status for better diagnostics
        var row = await db.ChatbotClients
            .Where(c => c.ApiKey == apiKey)
            .Select(c => new { c.Name, c.LogoUrl, c.WelcomeMessage, c.Currency, c.Language, c.IsActive })
            .FirstOrDefaultAsync(ct);

        if (row == null)
        {
            logger.LogWarning("Chatbot config 404: no client found for apiKey={ApiKey}", apiKey);
            return NotFound(new { error = "API key not found." });
        }
        if (!row.IsActive)
        {
            logger.LogWarning("Chatbot config 403: client is inactive for apiKey={ApiKey}", apiKey);
            return StatusCode(403, new { error = "This chatbot is currently inactive." });
        }

        var clientId = await db.ChatbotClients
            .Where(c => c.ApiKey == apiKey)
            .Select(c => c.Id)
            .FirstOrDefaultAsync(ct);

        var products = await db.ChatbotProducts
            .Where(p => p.ClientId == clientId && p.IsAvailable)
            .OrderBy(p => p.Category).ThenBy(p => p.Title)
            .Select(p => new { p.Id, p.Title, p.Description, p.Price, p.SalePrice, p.Variants, p.ImageUrl, p.Category })
            .ToListAsync(ct);

        return Ok(new
        {
            row.Name,
            row.LogoUrl,
            WelcomeMessage = row.WelcomeMessage ?? $"Hi! Welcome to {row.Name}. How can I help you today?",
            row.Currency,
            row.Language,
            Products = products,
        });
    }

    // ── All products for widget (client-side filtering) ──────────────────────
    [HttpGet("{apiKey}/products")]
    public async Task<IActionResult> GetProducts(string apiKey, CancellationToken ct)
    {
        var client = await db.ChatbotClients
            .Where(c => c.ApiKey == apiKey && c.IsActive)
            .FirstOrDefaultAsync(ct);

        if (client == null) return NotFound(new { error = "Invalid API key." });

        var products = await db.ChatbotProducts
            .Where(p => p.ClientId == client.Id && p.IsAvailable)
            .OrderBy(p => p.Category).ThenBy(p => p.Title)
            .Select(p => new {
                p.Id, p.Title, p.Description, p.Price, p.SalePrice,
                p.Variants, p.ImageUrl, p.Category,
            })
            .ToListAsync(ct);

        return Ok(products);
    }

    // ── System prompt builder ─────────────────────────────────────────────────
    private static string BuildSystemPrompt(
        Domain.Chatbot.ChatbotClient client,
        List<Domain.Chatbot.ChatbotProduct> products)
    {
        var sb = new StringBuilder();

        sb.AppendLine($"You are a smart sales assistant for {client.Name}.");
        if (!string.IsNullOrWhiteSpace(client.BusinessDesc))
            sb.AppendLine($"About the business: {client.BusinessDesc}");
        sb.AppendLine($"Currency: {client.Currency}");
        sb.AppendLine();

        sb.AppendLine("=== PRODUCT CATALOGUE ===");
        if (products.Count == 0)
        {
            sb.AppendLine("(No products available at this time.)");
        }
        else
        {
            foreach (var p in products)
            {
                var priceStr = p.SalePrice.HasValue
                    ? $"{p.Price:F0} (sale: {p.SalePrice.Value:F0})"
                    : $"{p.Price:F0}";
                var cat = string.IsNullOrWhiteSpace(p.Category) ? "" : $"[{p.Category}] ";
                sb.Append($"• {cat}{p.Title} — {client.Currency} {priceStr}");
                if (!string.IsNullOrWhiteSpace(p.Description))
                    sb.Append($" | {p.Description.Replace("\n", " ")}");
                sb.AppendLine();
                if (!string.IsNullOrWhiteSpace(p.Variants))
                    sb.AppendLine($"  Variants: {p.Variants}");
            }
        }

        // List distinct categories so the AI can mention them
        var categories = products.Select(p => p.Category).Where(c => !string.IsNullOrWhiteSpace(c)).Distinct().ToList();
        if (categories.Count > 0)
            sb.AppendLine($"Categories available: {string.Join(", ", categories)}");

        sb.AppendLine();
        sb.AppendLine("=== RULES ===");
        sb.AppendLine("• Keep every reply to 1-2 short sentences. Be warm and helpful.");
        sb.AppendLine("• NEVER use markdown — no **bold**, no *italic*, no - bullet lists. Plain text only.");
        sb.AppendLine("• On first message / greeting: welcome the customer and list the categories available. Ask which they are interested in.");
        sb.AppendLine("• When customer picks a category or mentions a product type: name 2-3 specific products with prices.");
        sb.AppendLine("• NEVER say 'I can't show' — just describe products in plain text.");
        sb.AppendLine("• When customer wants to order: ask for size/variant, then name, phone, delivery address.");
        sb.AppendLine("• Ask payment: Cash on Delivery or Online Payment?");
        sb.AppendLine("• Once confirmed, output ONLY this JSON:");
        sb.AppendLine("  {\"reply\":\"Order confirmed!\",\"state\":\"order_ready\",\"name\":\"<n>\",\"phone\":\"<p>\",\"address\":\"<a>\",\"payment_method\":\"cod\",\"cart\":[{\"title\":\"<t>\",\"qty\":1,\"unit_price\":100,\"variant_info\":\"<size>\"}]}");
        sb.AppendLine("• payment_method = 'online' for UPI/card, 'cod' for cash.");

        return sb.ToString();
    }
}

public record ChatbotMessageRequest(string? SessionId, string Message);

public class ChatbotCartItem
{
    public string  Title       { get; set; } = string.Empty;
    public int     Qty         { get; set; } = 1;
    public decimal UnitPrice   { get; set; }
    public string? VariantInfo { get; set; }
}
