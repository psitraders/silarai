using ReplyCart.Application.Chatbot;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Chatbot;
using ReplyCart.Infrastructure.Persistence;
using System.Text;
using System.Text.Json;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Shared logic: receive a message from any channel (WhatsApp / Messenger / Instagram),
/// run it through the external client's AI chatbot, send the reply back.
///
/// Uses the same <see cref="IChatSessionStore"/>, <see cref="IChatbotContextCache"/> and
/// <see cref="ChatbotPromptBuilder"/> as the web widget. Previously this file carried its
/// own, much weaker prompt builder — no knowledge base, no product ids, no cart — so a
/// WhatsApp buyer got a materially worse bot than a widget buyer.
///
/// KNOWN GAP (pre-existing, deliberately NOT changed here): these channels reply only,
/// there is no order-placement step. CanPlaceOrders is therefore false, so the prompt
/// hands off to the team instead of telling the buyer an order is confirmed — previously
/// the model was told to emit order_ready and the reply was discarded, meaning buyers
/// were told "order confirmed" when nothing had been created.
/// </summary>
public static class ChatbotClientWebhookHelper
{
    /// <summary>How many products get described in full inside the system prompt.</summary>
    private const int PromptCatalogueBudget = 12;

    /// <summary>Everything the channel handlers need, bundled so call sites stay short.</summary>
    public sealed record Deps(
        AppDbContext         Db,
        IAiProvider          Ai,
        IChatSessionStore    Sessions,
        IChatbotContextCache Context,
        IHttpClientFactory   HttpClientFactory,
        ILogger              Logger);

    // ── WhatsApp ──────────────────────────────────────────────────────────────
    public static async Task HandleWhatsAppAsync(
        ChatbotClient client, string fromPhone, string messageText, Deps deps, CancellationToken ct)
    {
        var reply = await GetAiReply(client, fromPhone, messageText, "whatsapp", deps, ct);

        if (string.IsNullOrWhiteSpace(client.WaPhoneNumberId) ||
            string.IsNullOrWhiteSpace(client.WaAccessToken)) return;

        try
        {
            var http = deps.HttpClientFactory.CreateClient();
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
            req.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", client.WaAccessToken);

            var resp = await http.SendAsync(req, ct);
            if (!resp.IsSuccessStatusCode)
                deps.Logger.LogWarning("WA reply failed for client {Id}: {Status}", client.Id, resp.StatusCode);
        }
        catch (Exception ex)
        {
            deps.Logger.LogError(ex, "WA reply error for client {Id}", client.Id);
        }
    }

    // ── Facebook Messenger ────────────────────────────────────────────────────
    public static async Task HandleFacebookAsync(
        ChatbotClient client, string senderId, string messageText, Deps deps, CancellationToken ct)
    {
        var reply = await GetAiReply(client, senderId, messageText, "facebook", deps, ct);

        if (string.IsNullOrWhiteSpace(client.FbPageId) ||
            string.IsNullOrWhiteSpace(client.FbPageAccessToken)) return;

        await SendGraphMessageAsync(
            $"https://graph.facebook.com/v19.0/me/messages?access_token={client.FbPageAccessToken}",
            senderId, reply, client.Id, "FB", deps, ct);
    }

    // ── Instagram ─────────────────────────────────────────────────────────────
    public static async Task HandleInstagramAsync(
        ChatbotClient client, string senderId, string messageText, Deps deps, CancellationToken ct)
    {
        var reply = await GetAiReply(client, senderId, messageText, "instagram", deps, ct);

        if (string.IsNullOrWhiteSpace(client.IgAccountId) ||
            string.IsNullOrWhiteSpace(client.IgAccessToken)) return;

        await SendGraphMessageAsync(
            $"https://graph.facebook.com/v19.0/me/messages?access_token={client.IgAccessToken}",
            senderId, reply, client.Id, "IG", deps, ct);
    }

    private static async Task SendGraphMessageAsync(
        string url, string recipientId, string reply, Guid clientId, string label, Deps deps, CancellationToken ct)
    {
        try
        {
            var http = deps.HttpClientFactory.CreateClient();
            var body = JsonSerializer.Serialize(new
            {
                recipient = new { id = recipientId },
                message   = new { text = reply },
            });
            await http.PostAsync(url, new StringContent(body, Encoding.UTF8, "application/json"), ct);
        }
        catch (Exception ex)
        {
            deps.Logger.LogError(ex, "{Label} reply error for client {Id}", label, clientId);
        }
    }

    // ── Core AI reply ─────────────────────────────────────────────────────────
    private static async Task<string> GetAiReply(
        ChatbotClient client,
        string        senderKey,
        string        messageText,
        string        channel,
        Deps          deps,
        CancellationToken ct)
    {
        var key = new ChatSessionKey(client.Id, senderKey, channel);

        var catalogue = await deps.Context.GetCatalogAsync(client.Id, ct);
        var knowledge = ChatbotKnowledgeSelector.Select(
            await deps.Context.GetKnowledgeAsync(client.Id, ct), messageText);

        var snapshot = await deps.Sessions.GetAsync(key, ct);
        var cart     = ChatbotCartResolver.Reprice(snapshot.Cart, catalogue);

        var intent = ChatbotCardPolicy.Classify(catalogue, messageText);

        var pinned = cart.Lines
            .Where(l => l.ProductId.HasValue)
            .Select(l => l.ProductId!.Value)
            .Concat(snapshot.Profile.ShownProducts);

        var shortlist = ChatbotCatalogSelector.BuildPromptSet(
            catalogue, messageText, pinned, PromptCatalogueBudget);

        var prompt = ChatbotPromptBuilder.Build(new ChatbotPromptInput(
            ClientName:      client.Name,
            BusinessDesc:    client.BusinessDesc,
            Currency:        client.Currency,
            CodEnabled:      client.CodEnabled,
            OnlineEnabled:   client.OnlineEnabled && !string.IsNullOrWhiteSpace(client.RazorpayKeyId),
            Catalogue:       catalogue,
            Shortlist:       shortlist,
            Cart:            cart,
            Profile:         snapshot.Profile,
            KnowledgeBase:   knowledge,
            Channel:         channel,
            UnmatchedRequest: intent.Kind == ChatbotQueryKind.UnmatchedRequest,
            CanPlaceOrders:  false));

        var aiReply = await deps.Ai.HandleConversationAsync(
            new ConversationRequest(prompt, snapshot.History, messageText), ct);

        // Record token consumption for tenant + admin usage reports
        if (aiReply.PromptTokens > 0 || aiReply.CompletionTokens > 0)
        {
            deps.Db.ChatbotTokenUsages.Add(new ChatbotTokenUsage
            {
                Id               = Guid.NewGuid(),
                ClientId         = client.Id,
                TenantId         = client.TenantId,
                Channel          = channel,
                PromptTokens     = aiReply.PromptTokens,
                CompletionTokens = aiReply.CompletionTokens,
                CreatedAt        = DateTime.UtcNow,
            });
            await deps.Db.SaveChangesAsync(ct);
        }

        // Server-authoritative cart — the AI proposes, the live catalogue prices.
        var ops = ChatbotCartResolver.ParseOps(aiReply.ExtractedCartOpsJson);
        if (ops.Count > 0)
        {
            cart = ChatbotCartResolver.Apply(cart, ops, catalogue);
            await deps.Sessions.SetCartAsync(key, cart, ct);
        }

        // LastShownProductIds tracks the prompt shortlist — the ids the model was given
        // and may cite in cart_ops next turn.
        await deps.Sessions.PatchProfileAsync(key, new ChatProfilePatch(
            Name:                Blank(aiReply.ExtractedName),
            Phone:               Blank(aiReply.ExtractedPhone),
            Address:             Blank(aiReply.ExtractedAddress),
            State:               Blank(aiReply.StateSignal),
            PaymentMethod:       Blank(aiReply.ExtractedPaymentMethod),
            LastShownProductIds: shortlist.Select(p => p.Id).ToList()), ct);

        await deps.Sessions.AppendMessagesAsync(key,
            new ConversationMessage("user",      messageText),
            new ConversationMessage("assistant", aiReply.ReplyText), ct);

        return aiReply.ReplyText;
    }

    private static string? Blank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
