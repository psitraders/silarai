using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Chatbot;
using System.Text;
using System.Text.Json;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Shared logic: receive message from any channel (WA / FB / IG),
/// run it through the external client's AI chatbot, send reply back.
/// </summary>
public static class ChatbotClientWebhookHelper
{
    // ── WhatsApp ──────────────────────────────────────────────────────────────
    public static async Task HandleWhatsAppAsync(
        ChatbotClient client,
        string fromPhone,
        string messageText,
        IAiProvider ai,
        IConversationMemoryService memory,
        IHttpClientFactory httpClientFactory,
        ILogger logger,
        CancellationToken ct)
    {
        var reply = await GetAiReply(client, fromPhone, messageText, ai, memory, ct);

        // Send reply via WhatsApp Cloud API using client's own token
        if (!string.IsNullOrWhiteSpace(client.WaPhoneNumberId) &&
            !string.IsNullOrWhiteSpace(client.WaAccessToken))
        {
            try
            {
                var http = httpClientFactory.CreateClient();
                var url  = $"https://graph.facebook.com/v19.0/{client.WaPhoneNumberId}/messages";
                var body = JsonSerializer.Serialize(new
                {
                    messaging_product = "whatsapp",
                    to                = fromPhone,
                    type              = "text",
                    text              = new { body = reply },
                });
                var req = new HttpRequestMessage(HttpMethod.Post, url)
                {
                    Content = new StringContent(body, Encoding.UTF8, "application/json"),
                };
                req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", client.WaAccessToken);
                var resp = await http.SendAsync(req, ct);
                if (!resp.IsSuccessStatusCode)
                    logger.LogWarning("WA reply failed for client {Id}: {Status}", client.Id, resp.StatusCode);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "WA reply error for client {Id}", client.Id);
            }
        }
    }

    // ── Facebook Messenger ────────────────────────────────────────────────────
    public static async Task HandleFacebookAsync(
        ChatbotClient client,
        string senderId,
        string messageText,
        IAiProvider ai,
        IConversationMemoryService memory,
        IHttpClientFactory httpClientFactory,
        ILogger logger,
        CancellationToken ct)
    {
        var reply = await GetAiReply(client, senderId, messageText, ai, memory, ct);

        if (!string.IsNullOrWhiteSpace(client.FbPageId) &&
            !string.IsNullOrWhiteSpace(client.FbPageAccessToken))
        {
            try
            {
                var http = httpClientFactory.CreateClient();
                var url  = $"https://graph.facebook.com/v19.0/me/messages?access_token={client.FbPageAccessToken}";
                var body = JsonSerializer.Serialize(new
                {
                    recipient = new { id = senderId },
                    message   = new { text = reply },
                });
                await http.PostAsync(url, new StringContent(body, Encoding.UTF8, "application/json"), ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "FB reply error for client {Id}", client.Id);
            }
        }
    }

    // ── Instagram ─────────────────────────────────────────────────────────────
    public static async Task HandleInstagramAsync(
        ChatbotClient client,
        string senderId,
        string messageText,
        IAiProvider ai,
        IConversationMemoryService memory,
        IHttpClientFactory httpClientFactory,
        ILogger logger,
        CancellationToken ct)
    {
        var reply = await GetAiReply(client, senderId, messageText, ai, memory, ct);

        if (!string.IsNullOrWhiteSpace(client.IgAccountId) &&
            !string.IsNullOrWhiteSpace(client.IgAccessToken))
        {
            try
            {
                var http = httpClientFactory.CreateClient();
                var url  = $"https://graph.facebook.com/v19.0/me/messages?access_token={client.IgAccessToken}";
                var body = JsonSerializer.Serialize(new
                {
                    recipient = new { id = senderId },
                    message   = new { text = reply },
                });
                await http.PostAsync(url, new StringContent(body, Encoding.UTF8, "application/json"), ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "IG reply error for client {Id}", client.Id);
            }
        }
    }

    // ── Core AI reply ─────────────────────────────────────────────────────────
    private static async Task<string> GetAiReply(
        ChatbotClient client,
        string sessionKey,
        string messageText,
        IAiProvider ai,
        IConversationMemoryService memory,
        CancellationToken ct)
    {
        var sessionId = $"ext_{client.Id}_{sessionKey}";
        var history   = memory.GetHistory(sessionId);
        var prompt    = BuildPrompt(client);

        var aiReply = await ai.HandleConversationAsync(
            new ConversationRequest(prompt, history, messageText), ct);

        memory.AddMessages(sessionId,
            new ConversationMessage("user",      messageText),
            new ConversationMessage("assistant", aiReply.ReplyText));

        return aiReply.ReplyText;
    }

    // ── System prompt ─────────────────────────────────────────────────────────
    private static string BuildPrompt(ChatbotClient client)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"You are a smart sales assistant for {client.Name}.");
        if (!string.IsNullOrWhiteSpace(client.BusinessDesc))
            sb.AppendLine($"About: {client.BusinessDesc}");
        sb.AppendLine($"Currency: {client.Currency}");
        sb.AppendLine();
        sb.AppendLine("=== PRODUCTS ===");

        if (client.Products.Any())
        {
            foreach (var p in client.Products.Where(p => p.IsAvailable))
            {
                var price = p.SalePrice.HasValue
                    ? $"{p.Price:F0} (sale: {p.SalePrice:F0})"
                    : $"{p.Price:F0}";
                var cat = string.IsNullOrWhiteSpace(p.Category) ? "" : $"[{p.Category}] ";
                sb.Append($"• {cat}{p.Title} — {client.Currency} {price}");
                if (!string.IsNullOrWhiteSpace(p.Description))
                    sb.Append($" | {p.Description.Replace("\n", " ")}");
                sb.AppendLine();
                if (!string.IsNullOrWhiteSpace(p.Variants))
                    sb.AppendLine($"  Variants: {p.Variants}");
            }
        }
        else
        {
            sb.AppendLine("(No products listed — help customer and collect their inquiry)");
        }

        sb.AppendLine();
        sb.AppendLine("=== RULES ===");
        sb.AppendLine("• You are a friendly WhatsApp sales assistant. Keep replies SHORT and conversational.");
        sb.AppendLine("• NEVER dump the full product list unless asked. Suggest 2-3 relevant items max per reply.");
        sb.AppendLine("• NEVER use markdown: no **bold**, no *italic*, no - bullet points, no # headings.");
        sb.AppendLine("• Use plain sentences only. Separate items with commas or short line breaks.");
        sb.AppendLine("• Ask follow-up questions to understand what customer wants (category, size, budget).");
        sb.AppendLine("• When customer shows interest: mention product name, price, and variants naturally.");
        sb.AppendLine("• When customer is ready to order: collect name, phone, delivery address.");
        sb.AppendLine("• Ask payment preference: Cash on Delivery (COD) or Online Payment.");
        sb.AppendLine("• Once all details confirmed, output JSON: {\"reply\":\"Great! Your order is confirmed.\",\"state\":\"order_ready\",\"name\":\"<n>\",\"phone\":\"<p>\",\"address\":\"<a>\",\"payment_method\":\"cod\",\"cart\":[{\"title\":\"<t>\",\"qty\":1,\"unit_price\":100}]}");
        sb.AppendLine("• CRITICAL: payment_method = 'online' for UPI/GPay/card, 'cod' for cash.");
        sb.AppendLine("• Example good reply: 'We have the Classic White T-Shirt for ₹499 and the Navy Polo for ₹649. Which one interests you?'");
        sb.AppendLine("• For all other turns: plain conversational text only — no JSON, no markdown.");

        return sb.ToString();
    }
}


