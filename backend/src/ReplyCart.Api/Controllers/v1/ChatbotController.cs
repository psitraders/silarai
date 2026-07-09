using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Chatbot;
using ReplyCart.Infrastructure.Persistence;
using System.Security.Cryptography;
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

        // ── Resolve focused product (single-product conversation mode) ────────
        ChatbotProduct? focused = null;
        if (request.FocusedProductId is Guid fid)
            focused = products.FirstOrDefault(p => p.Id == fid);

        // ── Knowledge base (uploaded policy / compliance / FAQ docs) ──────────
        var docs = await db.ChatbotDocuments
            .Where(d => d.ClientId == client.Id)
            .Select(d => new { d.FileName, d.ExtractedText })
            .ToListAsync(ct);
        var knowledge = BuildKnowledgeContext(
            docs.Select(d => (d.FileName, d.ExtractedText)).ToList(), request.Message);

        // ── Build system prompt (focused or full catalogue) ───────────────────
        var systemPrompt = BuildSystemPrompt(client, products, focused, knowledge);

        // ── Get conversation history ──────────────────────────────────────────
        var history = chatMemory.GetHistory(sessionId);

        // ── Call AI ───────────────────────────────────────────────────────────
        var aiReply = await aiProvider.HandleConversationAsync(
            new ConversationRequest(systemPrompt, history, request.Message), ct);

        var replyText = aiReply.ReplyText;

        // ── Record token consumption (tenant + admin usage reports) ───────────
        if (aiReply.PromptTokens > 0 || aiReply.CompletionTokens > 0)
        {
            db.ChatbotTokenUsages.Add(new ChatbotTokenUsage
            {
                Id               = Guid.NewGuid(),
                ClientId         = client.Id,
                TenantId         = client.TenantId,
                Channel          = "web",
                PromptTokens     = aiReply.PromptTokens,
                CompletionTokens = aiReply.CompletionTokens,
                CreatedAt        = DateTime.UtcNow,
            });
            await db.SaveChangesAsync(ct);
        }

        // ── Handle order_ready state → persist order + payment ────────────────
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
                // Resolve real price + image from OUR catalogue — never trust the AI's unit_price.
                ChatbotProduct? ResolveProduct(string? title)
                {
                    if (focused != null) return focused;          // single-product mode
                    var t = (title ?? "").Trim();
                    if (t.Length == 0) return null;
                    return products.FirstOrDefault(p => string.Equals(p.Title, t, StringComparison.OrdinalIgnoreCase))
                        ?? products.FirstOrDefault(p =>
                               p.Title.Contains(t, StringComparison.OrdinalIgnoreCase)
                            || t.Contains(p.Title, StringComparison.OrdinalIgnoreCase));
                }

                var lineItems = cart.Select(i =>
                {
                    var prod = ResolveProduct(i.Title);
                    var unit = prod != null ? (prod.SalePrice ?? prod.Price)
                             : (i.UnitPrice > 0 ? i.UnitPrice : 0);
                    return new
                    {
                        title     = prod?.Title ?? i.Title,
                        qty       = i.Qty < 1 ? 1 : i.Qty,
                        unitPrice = unit,
                        variant   = i.VariantInfo,
                        imageUrl  = prod?.ImageUrl,
                    };
                }).ToList();

                var total = lineItems.Sum(i => i.qty * i.unitPrice);

                // Decide payment method — honour what's actually enabled for the client.
                var wantsOnline = (aiReply.ExtractedPaymentMethod ?? "cod").ToLower() == "online";
                var canOnline   = wantsOnline && client.OnlineEnabled
                                  && !string.IsNullOrWhiteSpace(client.RazorpayKeyId)
                                  && !string.IsNullOrWhiteSpace(client.RazorpayKeySecret);
                var method = canOnline ? "online" : "cod";

                var order = new ChatbotOrder
                {
                    Id              = Guid.NewGuid(),
                    ClientId        = client.Id,
                    OrderNumber     = GenerateOrderNumber(),
                    SessionId       = request.SessionId,
                    CustomerName    = aiReply.ExtractedName,
                    CustomerPhone   = aiReply.ExtractedPhone,
                    DeliveryAddress = aiReply.ExtractedAddress,
                    ItemsJson       = JsonSerializer.Serialize(lineItems),
                    Total           = total,
                    Currency        = client.Currency,
                    PaymentMethod   = method,
                    PaymentStatus   = "pending",
                    OrderStatus     = "placed",
                    CreatedAt       = DateTime.UtcNow,
                };

                // ── Create Razorpay order for online payment ──────────────────
                object? razorpay = null;
                if (method == "online")
                {
                    var rzpOrderId = await CreateRazorpayOrderAsync(client, total, order.OrderNumber, ct);
                    if (rzpOrderId != null)
                    {
                        order.RazorpayOrderId = rzpOrderId;
                        razorpay = new
                        {
                            keyId    = client.RazorpayKeyId,
                            orderId  = rzpOrderId,
                            amount   = (long)Math.Round(total * 100), // paise
                            currency = client.Currency,
                        };
                        replyText = $"Almost there! Please complete the secure payment of {client.Currency} {total:F0} to confirm your order.";
                    }
                    else
                    {
                        // Razorpay failed → gracefully fall back to COD
                        order.PaymentMethod = method = "cod";
                        replyText = $"Order placed! Your order ID is {order.OrderNumber}. (Online payment is temporarily unavailable, so this is set to Cash on Delivery.)";
                    }
                }

                if (method == "cod")
                    replyText = $"Order confirmed! Your order ID is {order.OrderNumber}. We'll deliver it and collect {client.Currency} {total:F0} as Cash on Delivery.";

                db.ChatbotOrders.Add(order);
                await db.SaveChangesAsync(ct);

                orderData = new
                {
                    id            = order.Id,
                    orderNumber   = order.OrderNumber,
                    customerName  = order.CustomerName,
                    customerPhone = order.CustomerPhone,
                    deliveryAddress = order.DeliveryAddress,
                    paymentMethod = order.PaymentMethod,
                    paymentStatus = order.PaymentStatus,
                    currency      = order.Currency,
                    total,
                    items         = lineItems,
                    razorpay,
                };

                // ── Fire webhook to client's system if configured ─────────────
                if (!string.IsNullOrWhiteSpace(client.WebhookUrl))
                {
                    var webhookUrl = client.WebhookUrl;
                    var capturedOrder = orderData;
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var http = httpClientFactory.CreateClient();
                            var payload = JsonSerializer.Serialize(new
                            {
                                clientId  = client.Id,
                                sessionId = request.SessionId,
                                order     = capturedOrder,
                            });
                            await http.PostAsync(webhookUrl,
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

        // ── Product cards to return ───────────────────────────────────────────
        // In focused mode: only ever return the focused product.
        List<ChatbotProduct> topMatches;
        if (focused != null)
        {
            topMatches = [focused];
        }
        else
        {
            var msgLower = request.Message.ToLowerInvariant();
            var allWords = msgLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            var scored = products.Select(p =>
            {
                var searchable = ((p.Category ?? "") + " " + p.Title + " " + (p.Description ?? "")).ToLowerInvariant();
                var score = allWords.Count(w => w.Length >= 3 && searchable.Contains(w));
                return (product: p, score);
            }).ToList();

            topMatches = scored.Where(x => x.score > 0)
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

    // ── Verify Razorpay payment (called by widget after checkout success) ─────
    [HttpPost("{apiKey}/orders/{orderId:guid}/verify-payment")]
    public async Task<IActionResult> VerifyPayment(
        string apiKey, Guid orderId,
        [FromBody] VerifyChatbotPaymentRequest req,
        CancellationToken ct)
    {
        var client = await db.ChatbotClients
            .Where(c => c.ApiKey == apiKey && c.IsActive)
            .FirstOrDefaultAsync(ct);
        if (client == null) return NotFound(new { error = "Invalid API key." });

        var order = await db.ChatbotOrders
            .FirstOrDefaultAsync(o => o.Id == orderId && o.ClientId == client.Id, ct);
        if (order == null) return NotFound(new { error = "Order not found." });

        if (string.IsNullOrWhiteSpace(client.RazorpayKeySecret))
            return BadRequest(new { error = "Online payments not configured." });

        // Razorpay signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
        var expected = HmacSha256Hex(
            $"{req.RazorpayOrderId}|{req.RazorpayPaymentId}", client.RazorpayKeySecret);

        if (!string.Equals(expected, req.RazorpaySignature, StringComparison.OrdinalIgnoreCase))
        {
            order.PaymentStatus = "failed";
            await db.SaveChangesAsync(ct);
            return BadRequest(new { error = "Payment verification failed.", success = false });
        }

        order.PaymentStatus     = "paid";
        order.OrderStatus       = "confirmed";
        order.RazorpayPaymentId = req.RazorpayPaymentId;
        await db.SaveChangesAsync(ct);

        return Ok(new { success = true, orderNumber = order.OrderNumber });
    }

    // ── Widget info endpoint (for embed script) ───────────────────────────────
    [HttpGet("{apiKey}/config")]
    public async Task<IActionResult> GetConfig(string apiKey, CancellationToken ct)
    {
        var row = await db.ChatbotClients
            .Where(c => c.ApiKey == apiKey)
            .Select(c => new
            {
                c.Id, c.Name, c.LogoUrl, c.WelcomeMessage, c.Currency, c.Language, c.IsActive,
                c.CodEnabled, c.OnlineEnabled, c.RazorpayKeyId,
            })
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

        var products = await db.ChatbotProducts
            .Where(p => p.ClientId == row.Id && p.IsAvailable)
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
            Payment = new
            {
                codEnabled    = row.CodEnabled,
                onlineEnabled = row.OnlineEnabled && !string.IsNullOrWhiteSpace(row.RazorpayKeyId),
                razorpayKeyId = row.OnlineEnabled ? row.RazorpayKeyId : null,
            },
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

    // ── Razorpay order creation ───────────────────────────────────────────────
    private async Task<string?> CreateRazorpayOrderAsync(
        Domain.Chatbot.ChatbotClient client, decimal total, string receipt, CancellationToken ct)
    {
        try
        {
            var http = httpClientFactory.CreateClient();
            var auth = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{client.RazorpayKeyId}:{client.RazorpayKeySecret}"));
            var msg = new HttpRequestMessage(HttpMethod.Post, "https://api.razorpay.com/v1/orders");
            msg.Headers.Add("Authorization", $"Basic {auth}");
            var body = JsonSerializer.Serialize(new
            {
                amount   = (long)Math.Round(total * 100), // paise
                currency = client.Currency,
                receipt,
            });
            msg.Content = new StringContent(body, Encoding.UTF8, "application/json");

            var resp = await http.SendAsync(msg, ct);
            var json = await resp.Content.ReadAsStringAsync(ct);
            if (!resp.IsSuccessStatusCode)
            {
                logger.LogWarning("Razorpay order create failed ({Status}): {Body}", resp.StatusCode, json);
                return null;
            }
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Razorpay order creation error for client {Id}", client.Id);
            return null;
        }
    }

    private static string HmacSha256Hex(string payload, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string GenerateOrderNumber()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var suffix = new char[4];
        for (var i = 0; i < suffix.Length; i++)
            suffix[i] = chars[RandomNumberGenerator.GetInt32(chars.Length)];
        return $"RC-{DateTime.UtcNow:yyMMdd}-{new string(suffix)}";
    }

    // ── Knowledge-base retrieval (keyword-ranked passages) ────────────────────
    private static string? BuildKnowledgeContext(
        List<(string FileName, string Text)> docs, string message, int maxChars = 3000)
    {
        if (docs == null || docs.Count == 0) return null;

        var chunks = new List<(string Doc, string Text)>();
        foreach (var (file, text) in docs)
        {
            if (string.IsNullOrWhiteSpace(text)) continue;
            for (int i = 0; i < text.Length; i += 600)
                chunks.Add((file, text.Substring(i, Math.Min(600, text.Length - i))));
        }
        if (chunks.Count == 0) return null;

        var words = message.ToLowerInvariant()
            .Split([' ', ',', '.', '?', '!', '\n', '\t', ';', ':'], StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 3).Distinct().ToList();

        var scored = chunks
            .Select(c => (chunk: c, score: words.Count(w => c.Text.ToLowerInvariant().Contains(w))))
            .ToList();

        var picked = scored.Any(x => x.score > 0)
            ? scored.Where(x => x.score > 0).OrderByDescending(x => x.score).Select(x => x.chunk)
            : chunks.Take(6);   // no keyword hit → include the opening passages

        var sb = new StringBuilder();
        int used = 0;
        foreach (var (doc, text) in picked)
        {
            var t = text.Trim();
            if (used + t.Length > maxChars) break;
            sb.AppendLine($"[{doc}] {t}");
            used += t.Length;
        }
        return sb.Length > 0 ? sb.ToString() : null;
    }

    // ── System prompt builder ─────────────────────────────────────────────────
    private static string BuildSystemPrompt(
        Domain.Chatbot.ChatbotClient client,
        List<Domain.Chatbot.ChatbotProduct> products,
        Domain.Chatbot.ChatbotProduct? focused,
        string? knowledgeBase = null)
    {
        var sb = new StringBuilder();

        sb.AppendLine($"You are a smart sales assistant for {client.Name}.");
        if (!string.IsNullOrWhiteSpace(client.BusinessDesc))
            sb.AppendLine($"About the business: {client.BusinessDesc}");
        sb.AppendLine($"Currency: {client.Currency}");
        sb.AppendLine();

        // Which payment options are actually available
        var pays = new List<string>();
        if (client.CodEnabled) pays.Add("Cash on Delivery");
        if (client.OnlineEnabled && !string.IsNullOrWhiteSpace(client.RazorpayKeyId)) pays.Add("Online Payment");
        if (pays.Count == 0) pays.Add("Cash on Delivery");

        if (focused != null)
        {
            // ── Single-product focused conversation ───────────────────────────
            var priceStr = focused.SalePrice.HasValue
                ? $"{focused.Price:F0} (sale: {focused.SalePrice.Value:F0})"
                : $"{focused.Price:F0}";
            sb.AppendLine("=== THE CUSTOMER IS VIEWING THIS SPECIFIC PRODUCT ===");
            sb.AppendLine($"• {focused.Title} — {client.Currency} {priceStr}");
            if (!string.IsNullOrWhiteSpace(focused.Category))   sb.AppendLine($"  Category: {focused.Category}");
            if (!string.IsNullOrWhiteSpace(focused.Description)) sb.AppendLine($"  Details: {focused.Description.Replace("\n", " ")}");
            if (!string.IsNullOrWhiteSpace(focused.Variants))   sb.AppendLine($"  Variants: {focused.Variants}");
            sb.AppendLine();
            sb.AppendLine("=== RULES ===");
            sb.AppendLine("• Keep every reply to 1-2 short sentences. Be warm and helpful.");
            sb.AppendLine("• NEVER use markdown — plain text only.");
            sb.AppendLine("• ONLY discuss the product above. Do NOT mention, suggest, or list any other products.");
            sb.AppendLine("• If the customer asks for something else, tell them they can tap 'Browse all products' to see more.");
            sb.AppendLine("• To order: confirm variant/size, then collect name, phone, delivery address.");
            sb.AppendLine($"• Available payment options: {string.Join(", ", pays)}. Ask which they prefer.");
        }
        else
        {
            // ── Full catalogue conversation ───────────────────────────────────
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
            sb.AppendLine($"• Available payment options: {string.Join(", ", pays)}. Ask which they prefer.");
        }

        if (!string.IsNullOrWhiteSpace(knowledgeBase))
        {
            sb.AppendLine();
            sb.AppendLine("=== KNOWLEDGE BASE (store policies & documents) ===");
            sb.AppendLine("Use the passages below to answer questions about policies, privacy, shipping, returns, warranty, compliance, etc. Answer faithfully from this content. If the answer isn't here, say you'll connect them with the team — do NOT invent policy details.");
            sb.AppendLine(knowledgeBase);
            sb.AppendLine();
        }

        sb.AppendLine("• Once confirmed, output ONLY this JSON:");
        sb.AppendLine("  {\"reply\":\"Order confirmed!\",\"state\":\"order_ready\",\"name\":\"<n>\",\"phone\":\"<p>\",\"address\":\"<a>\",\"payment_method\":\"cod\",\"cart\":[{\"title\":\"<t>\",\"qty\":1,\"unit_price\":100,\"variant_info\":\"<size>\"}]}");
        sb.AppendLine("• payment_method = 'online' for UPI/card, 'cod' for cash.");

        return sb.ToString();
    }
}

public record ChatbotMessageRequest(string? SessionId, string Message, Guid? FocusedProductId = null);

public record VerifyChatbotPaymentRequest(
    string RazorpayOrderId,
    string RazorpayPaymentId,
    string RazorpaySignature);

public class ChatbotCartItem
{
    public string  Title       { get; set; } = string.Empty;
    public int     Qty         { get; set; } = 1;
    public decimal UnitPrice   { get; set; }
    public string? VariantInfo { get; set; }
}
