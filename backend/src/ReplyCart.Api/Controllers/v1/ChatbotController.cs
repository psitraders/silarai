using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Chatbot;
using ReplyCart.Application.Chatbot.Agent;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Chatbot;
using ReplyCart.Infrastructure.Persistence;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Public chatbot endpoint for external clients.
/// No auth required — protected by API key in the URL.
/// Uses AllowWidget CORS policy (any origin) because this is embedded on external websites.
///
/// Session state (history, cart, collected fields) lives in <see cref="IChatSessionStore"/>
/// — Redis-backed, so it survives restarts, deploys and scale-out. The catalogue and
/// knowledge base come from <see cref="IChatbotContextCache"/> rather than being re-read
/// and re-chunked out of SQL on every turn.
/// </summary>
[ApiController]
[Route("api/v1/chatbot")]
[EnableCors("AllowWidget")]
public class ChatbotController(
    AppDbContext          db,
    ChatbotAgent          agent,
    IChatSessionStore     sessions,
    IChatbotContextCache  context,
    IHttpClientFactory    httpClientFactory,
    ILogger<ChatbotController> logger) : ControllerBase
{
    /// <summary>Content type that opts a caller into streamed thinking events.</summary>
    private const string NdJson = "application/x-ndjson";

    /// <summary>
    /// One buyer turn, run through the tool-calling agent.
    ///
    /// TWO RESPONSE SHAPES, chosen by the Accept header:
    ///
    ///   Accept: application/x-ndjson  → newline-delimited events. A {"type":"thinking"}
    ///                                   line per tool call as it runs, then one
    ///                                   {"type":"final"} line carrying the same payload
    ///                                   the non-streaming shape returns.
    ///   anything else                 → the exact single JSON object this endpoint has
    ///                                   always returned.
    ///
    /// The fallback is not politeness: chatbot-widget.js is loaded directly by third-party
    /// sites with no bundler hash, so older copies stay cached in the wild indefinitely.
    /// They must keep working untouched after this deploys.
    /// </summary>
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

        // Mint a session id when the caller did not supply one, and ALWAYS echo back
        // the id we actually used. Previously a caller that omitted sessionId got a
        // fresh GUID minted per request, so its conversation could never accumulate.
        var sessionId = string.IsNullOrWhiteSpace(request.SessionId)
            ? $"s_{Guid.NewGuid():N}"
            : request.SessionId.Trim();

        if (sessionId.Length > 128) sessionId = sessionId[..128];

        var streaming = Request.Headers.Accept.Any(
            v => v != null && v.Contains(NdJson, StringComparison.OrdinalIgnoreCase));

        if (!streaming)
            return Ok(await RunTurnAsync(client, sessionId, request, null, ct));

        // Streamed: headers must be flushed before the first thinking line, or the
        // widget sees nothing until the whole turn completes.
        Response.StatusCode  = StatusCodes.Status200OK;
        Response.ContentType = NdJson;
        Response.Headers.CacheControl = "no-cache";
        await Response.Body.FlushAsync(ct);

        async Task EmitThinking(string text, CancellationToken token) =>
            await WriteEventAsync(new { type = "thinking", text }, token);

        try
        {
            var payload = await RunTurnAsync(client, sessionId, request, EmitThinking, ct);
            await WriteEventAsync(new { type = "final", payload }, ct);
        }
        catch (OperationCanceledException)
        {
            // Buyer closed the tab mid-turn. Nothing to report.
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Chatbot streamed turn failed for client {ClientId}", client.Id);
            await WriteEventAsync(new { type = "error", message = "Something went wrong. Please try again." }, ct);
        }

        return new EmptyResult();
    }

    /// <summary>
    /// MUST mirror the MVC pipeline's JSON settings (see Program.cs AddJsonOptions).
    ///
    /// The streamed path serialises by hand instead of going through <c>Ok(...)</c>, and
    /// <see cref="JsonSerializer"/>'s defaults are PascalCase where MVC's are camelCase.
    /// Getting this wrong ships `Title`/`ImageUrl` to a widget reading `title`/`imageUrl`,
    /// which renders a carousel of "undefined" — the two shapes must stay identical.
    /// </summary>
    private static readonly JsonSerializerOptions StreamJson = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    private async Task WriteEventAsync(object payload, CancellationToken ct)
    {
        await Response.WriteAsync(JsonSerializer.Serialize(payload, StreamJson) + "\n", ct);
        await Response.Body.FlushAsync(ct);
    }

    /// <summary>
    /// The turn itself. Transport-agnostic: <paramref name="onThinking"/> is null for the
    /// legacy single-JSON path and set for the streamed one, and nothing else differs.
    /// </summary>
    private async Task<object> RunTurnAsync(
        ChatbotClient                          client,
        string                                 sessionId,
        ChatbotMessageRequest                  request,
        Func<string, CancellationToken, Task>? onThinking,
        CancellationToken                      ct)
    {
        var key = new ChatSessionKey(client.Id, sessionId, "web");

        // ── Cached per-client context ─────────────────────────────────────────
        var catalogue = await context.GetCatalogAsync(client.Id, ct);

        var focused = request.FocusedProductId is Guid fid
            ? catalogue.FirstOrDefault(p => p.Id == fid)
            : null;

        var knowledgeChunks = await context.GetKnowledgeAsync(client.Id, ct);
        var knowledge       = ChatbotKnowledgeSelector.Select(knowledgeChunks, request.Message);

        // ── Session state (history + cart + collected fields) ─────────────────
        var snapshot = await sessions.GetAsync(key, ct);

        // Re-price the stored cart against the live catalogue every turn, so a price
        // change or a delisted product can never be carried into an order.
        var cart = ChatbotCartResolver.Reprice(snapshot.Cart, catalogue, focused);

        // ── Prompt: static cacheable prefix + per-turn suffix ─────────────────
        var systemPrompt = ChatbotAgentPromptBuilder.Build(new ChatbotAgentPromptInput(
            ClientName:    client.Name,
            BusinessDesc:  client.BusinessDesc,
            Currency:      client.Currency,
            CodEnabled:    client.CodEnabled,
            OnlineEnabled: client.OnlineEnabled && !string.IsNullOrWhiteSpace(client.RazorpayKeyId),
            Catalogue:     catalogue,
            Cart:          cart,
            Profile:       snapshot.Profile,
            Focused:       focused,
            KnowledgeBase: knowledge,
            Channel:       "web",
            CanPlaceOrders: true));

        // ── Agent loop ────────────────────────────────────────────────────────
        var result = await agent.RunAsync(
            systemPrompt,
            new ChatbotAgentRequest(
                UserMessage:    request.Message,
                History:        snapshot.History,
                Catalogue:      catalogue,
                Cart:           cart,
                Profile:        snapshot.Profile,
                Currency:       client.Currency,
                Focused:        focused,
                CanPlaceOrders: true),
            onThinking,
            ct);

        cart = result.Cart;
        var replyText = result.ReplyText;

        await RecordTokenUsageAsync(client, result.PromptTokens, result.CompletionTokens, "web", ct);

        if (!ReferenceEquals(cart, snapshot.Cart))
            await sessions.SetCartAsync(key, cart, ct);

        logger.LogDebug("Chatbot turn {Client}/{Session}: {Cards} card(s), {Tools} tool call(s), state={State}",
            client.Id, sessionId, result.Cards.Count, result.ThinkingLines.Count, result.StateSignal);

        // ── Persist what the agent collected ──────────────────────────────────
        // LastShownProductIds is kept ONLY so a follow-up like "add the second one" can
        // still resolve an id. It is deliberately never fed back into prompt selection —
        // doing so is what previously starved each turn of its own search results.
        var patch = result.ProfilePatch ?? new ChatProfilePatch();
        await sessions.PatchProfileAsync(key, patch with
        {
            State               = result.StateSignal,
            FocusedProductId    = focused?.Id,
            LastShownProductIds = result.Cards.Count > 0 ? result.Cards.Select(p => p.Id).ToList() : null,
        }, ct);

        // ── Order ─────────────────────────────────────────────────────────────
        // The agent only ever reports INTENT. Order creation, the order number and the
        // total all happen here, from the server-side cart.
        object? orderData = null;

        if (result.OrderIntent is { } intent)
        {
            if (cart.IsEmpty)
            {
                logger.LogWarning("Chatbot client {ClientId} called place_order with an empty cart (session {Session}).",
                    client.Id, sessionId);
                replyText = "I don't have anything in your cart yet — which product would you like to order?";
            }
            else
            {
                (orderData, replyText) = await PlaceOrderAsync(
                    client, sessionId, cart,
                    Blank(intent.Name)          ?? snapshot.Profile.Name,
                    Blank(intent.Phone)         ?? snapshot.Profile.Phone,
                    Blank(intent.Address)       ?? snapshot.Profile.Address,
                    Blank(intent.PaymentMethod) ?? snapshot.Profile.PaymentMethod,
                    ct);

                // Order closed — drop the cart so a follow-up message doesn't re-order it.
                cart = ChatCart.Empty;
                await sessions.SetCartAsync(key, cart, ct);
                await sessions.PatchProfileAsync(key, new ChatProfilePatch(State: "ordered"), ct);
            }
        }

        // ── Save the turn ─────────────────────────────────────────────────────
        await sessions.AppendMessagesAsync(key,
            new ConversationMessage("user",      request.Message),
            new ConversationMessage("assistant", replyText), ct);

        return new
        {
            sessionId,
            reply             = replyText,
            mentionedProducts = result.Cards,
            cart              = CartDto(cart, client.Currency),
            orderData,
            isOrderReady      = orderData != null,
            thinking          = result.ThinkingLines,
        };
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

        var products = await context.GetCatalogAsync(row.Id, ct);

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
        var clientId = await db.ChatbotClients
            .Where(c => c.ApiKey == apiKey && c.IsActive)
            .Select(c => (Guid?)c.Id)
            .FirstOrDefaultAsync(ct);

        if (clientId == null) return NotFound(new { error = "Invalid API key." });

        return Ok(await context.GetCatalogAsync(clientId.Value, ct));
    }

    // ── Current cart for a session (widget rehydrates on page load) ───────────
    [HttpGet("{apiKey}/cart")]
    public async Task<IActionResult> GetCart(string apiKey, [FromQuery] string sessionId, CancellationToken ct)
    {
        var client = await db.ChatbotClients
            .Where(c => c.ApiKey == apiKey && c.IsActive)
            .Select(c => new { c.Id, c.Currency })
            .FirstOrDefaultAsync(ct);

        if (client == null) return NotFound(new { error = "Invalid API key." });
        if (string.IsNullOrWhiteSpace(sessionId)) return Ok(CartDto(ChatCart.Empty, client.Currency));

        var snapshot  = await sessions.GetAsync(new ChatSessionKey(client.Id, sessionId.Trim(), "web"), ct);
        var catalogue = await context.GetCatalogAsync(client.Id, ct);

        // Re-price on read too — a cart shown to the buyer is never a stale price.
        return Ok(CartDto(ChatbotCartResolver.Reprice(snapshot.Cart, catalogue), client.Currency));
    }

    /// <summary>
    /// Direct cart mutation from the widget's own controls ("Add to cart", qty +/-).
    ///
    /// Deliberately does NOT go through the AI: a button press is unambiguous, so
    /// spending an AI round-trip (and the buyer's tokens) to interpret it would be
    /// both slower and less reliable. The same resolver runs either way, so prices
    /// still come from the live catalogue and never from the client.
    /// </summary>
    [HttpPost("{apiKey}/cart")]
    public async Task<IActionResult> UpdateCart(
        string apiKey,
        [FromBody] ChatbotCartUpdateRequest request,
        CancellationToken ct)
    {
        var client = await db.ChatbotClients
            .Where(c => c.ApiKey == apiKey && c.IsActive)
            .Select(c => new { c.Id, c.Currency })
            .FirstOrDefaultAsync(ct);

        if (client == null) return NotFound(new { error = "Invalid API key." });
        if (string.IsNullOrWhiteSpace(request.SessionId))
            return BadRequest(new { error = "sessionId is required." });
        if (request.Ops == null || request.Ops.Count == 0)
            return BadRequest(new { error = "At least one cart operation is required." });

        var key       = new ChatSessionKey(client.Id, request.SessionId.Trim(), "web");
        var catalogue = await context.GetCatalogAsync(client.Id, ct);
        var snapshot  = await sessions.GetAsync(key, ct);

        var cart = ChatbotCartResolver.Apply(
            ChatbotCartResolver.Reprice(snapshot.Cart, catalogue), request.Ops, catalogue);

        await sessions.SetCartAsync(key, cart, ct);

        return Ok(CartDto(cart, client.Currency));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Order placement
    // ──────────────────────────────────────────────────────────────────────────
    private async Task<(object OrderData, string Reply)> PlaceOrderAsync(
        ChatbotClient client,
        string        sessionId,
        ChatCart      cart,
        string?       name,
        string?       phone,
        string?       address,
        string?       paymentMethod,
        CancellationToken ct)
    {
        // Totals come from the server-side cart, which was priced from the live
        // catalogue. Nothing the AI stated about price reaches this point.
        var total = cart.Total;

        var wantsOnline = string.Equals(paymentMethod, "online", StringComparison.OrdinalIgnoreCase);
        var canOnline   = wantsOnline && client.OnlineEnabled
                          && !string.IsNullOrWhiteSpace(client.RazorpayKeyId)
                          && !string.IsNullOrWhiteSpace(client.RazorpayKeySecret);
        var method = canOnline ? "online" : "cod";

        var lineItems = cart.Lines.Select(l => new
        {
            productId = l.ProductId,
            title     = l.Title,
            qty       = l.Qty,
            unitPrice = l.UnitPrice,
            variant   = l.Variant,
            imageUrl  = l.ImageUrl,
        }).ToList();

        var order = new ChatbotOrder
        {
            Id              = Guid.NewGuid(),
            ClientId        = client.Id,
            OrderNumber     = GenerateOrderNumber(),
            SessionId       = sessionId,
            CustomerName    = name,
            CustomerPhone   = phone,
            DeliveryAddress = address,
            ItemsJson       = JsonSerializer.Serialize(lineItems),
            Total           = total,
            Currency        = client.Currency,
            PaymentMethod   = method,
            PaymentStatus   = "pending",
            OrderStatus     = "placed",
            CreatedAt       = DateTime.UtcNow,
        };

        string reply;
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
                reply = $"Almost there! Please complete the secure payment of {client.Currency} {total:F0} to confirm your order.";
            }
            else
            {
                // Razorpay failed → gracefully fall back to COD
                order.PaymentMethod = method = "cod";
                reply = $"Order placed! Your order ID is {order.OrderNumber}. (Online payment is temporarily unavailable, so this is set to Cash on Delivery.)";
            }
        }
        else
        {
            reply = $"Order confirmed! Your order ID is {order.OrderNumber}. We'll deliver it and collect {client.Currency} {total:F0} as Cash on Delivery.";
        }

        db.ChatbotOrders.Add(order);
        await db.SaveChangesAsync(ct);

        var orderData = new
        {
            id              = order.Id,
            orderNumber     = order.OrderNumber,
            customerName    = order.CustomerName,
            customerPhone   = order.CustomerPhone,
            deliveryAddress = order.DeliveryAddress,
            paymentMethod   = order.PaymentMethod,
            paymentStatus   = order.PaymentStatus,
            currency        = order.Currency,
            total,
            items           = lineItems,
            razorpay,
        };

        FireWebhook(client, sessionId, orderData);

        return (orderData, reply);
    }

    private void FireWebhook(ChatbotClient client, string sessionId, object orderData)
    {
        if (string.IsNullOrWhiteSpace(client.WebhookUrl)) return;

        var webhookUrl = client.WebhookUrl;
        var clientId   = client.Id;

        _ = Task.Run(async () =>
        {
            try
            {
                var http    = httpClientFactory.CreateClient();
                var payload = JsonSerializer.Serialize(new { clientId, sessionId, order = orderData });
                await http.PostAsync(webhookUrl, new StringContent(payload, Encoding.UTF8, "application/json"));
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Chatbot webhook delivery failed for client {Id}", clientId);
            }
        }, CancellationToken.None);
    }

    /// <summary>
    /// Logs one row per TURN, not per model call — the agent may make several calls
    /// internally, and the client is billed for the turn.
    /// </summary>
    private async Task RecordTokenUsageAsync(
        ChatbotClient client, int promptTokens, int completionTokens, string channel, CancellationToken ct)
    {
        if (promptTokens <= 0 && completionTokens <= 0) return;

        db.ChatbotTokenUsages.Add(new ChatbotTokenUsage
        {
            Id               = Guid.NewGuid(),
            ClientId         = client.Id,
            TenantId         = client.TenantId,
            Channel          = channel,
            PromptTokens     = promptTokens,
            CompletionTokens = completionTokens,
            CreatedAt        = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    private static object CartDto(ChatCart cart, string currency) => new
    {
        items = cart.Lines.Select(l => new
        {
            productId = l.ProductId,
            title     = l.Title,
            qty       = l.Qty,
            unitPrice = l.UnitPrice,
            variant   = l.Variant,
            imageUrl  = l.ImageUrl,
            lineTotal = l.Qty * l.UnitPrice,
        }),
        total = cart.Total,
        count = cart.Count,
        currency,
    };

    private static string? Blank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    // ── Razorpay order creation ───────────────────────────────────────────────
    private async Task<string?> CreateRazorpayOrderAsync(
        ChatbotClient client, decimal total, string receipt, CancellationToken ct)
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
}

public record ChatbotMessageRequest(string? SessionId, string Message, Guid? FocusedProductId = null);

public record VerifyChatbotPaymentRequest(
    string RazorpayOrderId,
    string RazorpayPaymentId,
    string RazorpaySignature);

/// <summary>Widget-initiated cart change. Ops are validated and priced server-side.</summary>
public record ChatbotCartUpdateRequest(string? SessionId, List<ChatbotCartOp> Ops);
