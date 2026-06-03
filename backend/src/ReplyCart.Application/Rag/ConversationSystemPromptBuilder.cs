using ReplyCart.Domain.Conversation;
using System.Text;

namespace ReplyCart.Application.Rag;

/// <summary>
/// Converts a <see cref="RagContext"/> into a rich system prompt for the AI.
/// The prompt injects product catalogue, store policies, customer history, and
/// conversation rules so the model can handle the full customer journey autonomously.
/// </summary>
public static class ConversationSystemPromptBuilder
{
    public static string Build(RagContext ctx)
    {
        var sb = new StringBuilder();

        // ── Identity & tone ───────────────────────────────────────────────────
        var biz  = ctx.Business;
        var name = biz?.Name ?? "our store";
        var tone = biz?.Tone ?? "Friendly";

        sb.AppendLine($"You are an autonomous AI sales assistant for *{name}*.");
        sb.AppendLine($"Tone: {tone}. Be warm, concise, and action-oriented.");
        sb.AppendLine("Always reply in the same language the customer uses (Hindi/Hinglish/English).");
        sb.AppendLine("Never say you are an AI unless the customer directly asks.");
        sb.AppendLine();

        // ── Store policies ────────────────────────────────────────────────────
        sb.AppendLine("## Store Information");
        if (!string.IsNullOrWhiteSpace(biz?.DeliveryInfo))
            sb.AppendLine($"Delivery: {biz.DeliveryInfo}");
        if (!string.IsNullOrWhiteSpace(biz?.BusinessHours))
            sb.AppendLine($"Business hours: {biz.BusinessHours}");
        if (!string.IsNullOrWhiteSpace(biz?.WhatsAppNumber))
            sb.AppendLine($"WhatsApp contact: {biz.WhatsAppNumber}");
        if (!string.IsNullOrWhiteSpace(biz?.StoreContext))
        {
            sb.AppendLine("Store policies & FAQ:");
            sb.AppendLine(biz.StoreContext);
        }
        sb.AppendLine();

        // ── Product catalogue ─────────────────────────────────────────────────
        if (ctx.Products.Count > 0)
        {
            sb.AppendLine("## Available Products");
            foreach (var p in ctx.Products)
            {
                var currency = biz?.Currency ?? "INR";
                var priceStr = $"{currency} {p.Price:N0}";
                var stockStr = p.Stock is null or > 0 ? "In stock" : "Out of stock";
                sb.AppendLine($"- **{p.Title}** | Price: {priceStr} | {stockStr}" +
                              (p.Category != null ? $" | Category: {p.Category}" : "") +
                              (p.Description != null ? $"\n  {TruncateToWords(p.Description, 25)}" : ""));
            }
            sb.AppendLine();
        }

        // ── Customer history ──────────────────────────────────────────────────
        if (ctx.RecentOrders.Count > 0)
        {
            sb.AppendLine("## Customer's Recent Orders");
            foreach (var o in ctx.RecentOrders)
                sb.AppendLine($"- Order #{o.OrderNumber} | Status: {o.Status} | Amount: {o.Total:N0} | Date: {o.PlacedAt:dd MMM yyyy}");
            sb.AppendLine();
        }

        // ── Conversation state context ─────────────────────────────────────────
        var session = ctx.Session;
        if (!string.IsNullOrWhiteSpace(session.CollectedName))
            sb.AppendLine($"Customer name collected: {session.CollectedName}");
        if (!string.IsNullOrWhiteSpace(session.CollectedPhone))
            sb.AppendLine($"Phone collected: {session.CollectedPhone}");
        if (!string.IsNullOrWhiteSpace(session.CollectedAddress))
            sb.AppendLine($"Delivery address collected: {session.CollectedAddress}");
        if (!string.IsNullOrWhiteSpace(session.CollectedEmail))
            sb.AppendLine($"Email collected: {session.CollectedEmail}");
        if (session.CartJson != "[]" && session.CartJson.Length > 2)
            sb.AppendLine($"Cart items: {session.CartJson}");
        sb.AppendLine();

        // ── Conversation rules ─────────────────────────────────────────────────
        sb.AppendLine("## Rules");
        sb.AppendLine("1. Guide the customer through: Greeting → Browse products → Collect name/address/phone → Confirm order → Thank them.");
        sb.AppendLine("2. Only recommend products from the catalogue above. Never make up products or prices.");
        sb.AppendLine("3. If a customer is ready to order, collect: full name, delivery address, phone number.");
        sb.AppendLine("4. Once you have all order details, summarise the order and ask for confirmation.");
        sb.AppendLine("5. If a question is outside your knowledge (e.g., very specific stock query), say you'll check and get back to them.");
        sb.AppendLine("6. If a customer is angry or wants to speak to a human, signal escalation immediately.");
        sb.AppendLine();
        sb.AppendLine("7. IMPORTANT — Product display rule: When showing multiple products or featured products, write only a short 1-sentence intro (e.g. \"Here are our featured products! 👇\" or \"Check these out:\"). Do NOT list each product's name, price, or description in your text reply — product cards are automatically shown to the customer below your message. Listing them again in text creates a cluttered, unreadable experience.");
        sb.AppendLine("8. After an order is successfully placed, always end with a friendly question asking if the customer would like to buy anything else from the store.");
        sb.AppendLine();
        sb.AppendLine("Optionally, you may wrap your reply in JSON: { \"reply\": \"...\", \"state\": \"discovery|interested|collecting_info|confirming|ordered|escalate\" }");
        sb.AppendLine("If you don't need to signal a state change, just reply with plain text.");

        return sb.ToString();
    }

    private static string TruncateToWords(string text, int wordCount)
    {
        var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return words.Length <= wordCount
            ? text
            : string.Join(' ', words[..wordCount]) + "...";
    }
}


