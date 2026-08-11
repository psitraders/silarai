using System.Text;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Chatbot;

/// <summary>Everything the prompt needs. Assembled by the caller, no I/O in here.</summary>
public sealed record ChatbotPromptInput(
    string                            ClientName,
    string?                           BusinessDesc,
    string                            Currency,
    bool                              CodEnabled,
    bool                              OnlineEnabled,
    /// <summary>Full catalogue — used only for the total count and category list.</summary>
    IReadOnlyList<ChatbotCatalogItem> Catalogue,
    /// <summary>
    /// The products described in full in the prompt, chosen by ChatbotCatalogSelector.
    /// These are the only ids the model can legitimately cite in cart_ops, so the
    /// caller must persist them as ChatProfile.LastShownProductIds.
    /// </summary>
    IReadOnlyList<ChatbotCatalogItem> Shortlist,
    ChatCart                          Cart,
    ChatProfile                       Profile,
    ChatbotCatalogItem?               Focused        = null,
    string?                           KnowledgeBase  = null,
    string                            Channel        = "web",
    /// <summary>
    /// True when the buyer named something the catalogue does not carry. The model is
    /// told to acknowledge it and ask what they are interested in, rather than
    /// improvising a product or flatly saying no.
    /// </summary>
    bool                              UnmatchedRequest = false,
    /// <summary>
    /// False for the WhatsApp / Messenger / Instagram paths, which currently reply
    /// only and have no order-placement step. When false the model is told to hand
    /// off to the team instead of telling the buyer their order is confirmed.
    /// </summary>
    bool                              CanPlaceOrders = true);

/// <summary>
/// Single system-prompt builder for the whole Chatbot-as-a-Service module.
///
/// Replaces the two divergent builders that previously existed (ChatbotController
/// had knowledge-base + focused-product support and order capture; the channel
/// webhook helper had none of it, so WhatsApp buyers got a materially worse bot).
///
/// Two deliberate properties:
///  - The catalogue is SUMMARISED, not dumped. Prompt cost no longer scales with
///    catalogue size. See ChatbotCatalogSelector.
///  - The cart is rendered from server state, so the model reads it instead of
///    having to remember it across 40 messages.
/// </summary>
public static class ChatbotPromptBuilder
{
    private const int DescriptionClamp = 160;

    public static string Build(ChatbotPromptInput input)
    {
        var sb = new StringBuilder();

        // ── Identity ──────────────────────────────────────────────────────────
        sb.AppendLine($"You are a smart sales assistant for {input.ClientName}.");
        if (!string.IsNullOrWhiteSpace(input.BusinessDesc))
            sb.AppendLine($"About the business: {input.BusinessDesc}");
        sb.AppendLine($"Currency: {input.Currency}");
        sb.AppendLine();

        var pays = PaymentOptions(input);

        // ── Products ──────────────────────────────────────────────────────────
        if (input.Focused != null)
        {
            sb.AppendLine("=== THE CUSTOMER IS VIEWING THIS SPECIFIC PRODUCT ===");
            AppendProduct(sb, input.Focused, input.Currency);
            sb.AppendLine();
        }
        else
        {
            AppendCatalogue(sb, input);
        }

        // ── Cart (server-authoritative) ───────────────────────────────────────
        AppendCart(sb, input);

        // ── What we already know about the buyer ──────────────────────────────
        AppendCollected(sb, input.Profile);

        // ── Knowledge base ────────────────────────────────────────────────────
        if (!string.IsNullOrWhiteSpace(input.KnowledgeBase))
        {
            sb.AppendLine("=== KNOWLEDGE BASE (store policies & documents) ===");
            sb.AppendLine("Answer policy, privacy, shipping, returns, warranty and compliance questions ONLY from the passages below. If the answer is not here, say you will connect them with the team — never invent policy details.");
            sb.AppendLine(input.KnowledgeBase);
            sb.AppendLine();
        }

        // ── Conversation rules ────────────────────────────────────────────────
        AppendRules(sb, input, pays);

        // ── Machine-readable output contract ──────────────────────────────────
        AppendOutputContract(sb, input, pays);

        return sb.ToString();
    }

    // ──────────────────────────────────────────────────────────────────────────
    private static List<string> PaymentOptions(ChatbotPromptInput input)
    {
        var pays = new List<string>();
        if (input.CodEnabled)    pays.Add("Cash on Delivery");
        if (input.OnlineEnabled) pays.Add("Online Payment");
        if (pays.Count == 0)     pays.Add("Cash on Delivery");
        return pays;
    }

    private static void AppendCatalogue(StringBuilder sb, ChatbotPromptInput input)
    {
        var categories = ChatbotCatalogSelector.Categories(input.Catalogue);

        sb.AppendLine("=== STORE CATALOGUE ===");
        sb.AppendLine($"Total products available: {input.Catalogue.Count}");
        if (categories.Count > 0)
            sb.AppendLine($"Categories: {string.Join(", ", categories)}");
        sb.AppendLine();

        var shortlist = input.Shortlist;

        if (shortlist.Count == 0)
        {
            sb.AppendLine("(No products available at this time.)");
            sb.AppendLine();
            return;
        }

        sb.AppendLine("=== PRODUCTS RELEVANT RIGHT NOW ===");
        foreach (var p in shortlist)
            AppendProduct(sb, p, input.Currency);

        if (input.Catalogue.Count > shortlist.Count)
        {
            sb.AppendLine($"({input.Catalogue.Count - shortlist.Count} more products exist in other categories. " +
                          "If the customer asks for something not listed above, ask which category interests them " +
                          "instead of claiming it is unavailable.)");
        }

        sb.AppendLine();
    }

    private static void AppendProduct(StringBuilder sb, ChatbotCatalogItem p, string currency)
    {
        var price = p.SalePrice.HasValue
            ? $"{p.Price:F0} (sale: {p.SalePrice.Value:F0})"
            : $"{p.Price:F0}";
        var cat = string.IsNullOrWhiteSpace(p.Category) ? "" : $"[{p.Category}] ";

        sb.AppendLine($"• {cat}{p.Title} — {currency} {price} — id:{p.Id:N}");

        if (!string.IsNullOrWhiteSpace(p.Description))
            sb.AppendLine($"  {Clamp(p.Description!.Replace("\n", " "), DescriptionClamp)}");

        if (!string.IsNullOrWhiteSpace(p.Variants))
            sb.AppendLine($"  Variants: {p.Variants}");
    }

    private static void AppendCart(StringBuilder sb, ChatbotPromptInput input)
    {
        sb.AppendLine("=== CURRENT CART (authoritative — maintained by the system, not by you) ===");

        if (input.Cart.IsEmpty)
        {
            sb.AppendLine("(empty)");
        }
        else
        {
            foreach (var l in input.Cart.Lines)
            {
                var variant = string.IsNullOrWhiteSpace(l.Variant) ? "" : $" ({l.Variant})";
                sb.AppendLine($"• {l.Title}{variant} x{l.Qty} — {input.Currency} {l.Qty * l.UnitPrice:F0}");
            }
            sb.AppendLine($"Cart total: {input.Currency} {input.Cart.Total:F0}");
        }

        sb.AppendLine();
    }

    private static void AppendCollected(StringBuilder sb, ChatProfile profile)
    {
        var known = new List<string>();
        if (!string.IsNullOrWhiteSpace(profile.Name))          known.Add($"name = {profile.Name}");
        if (!string.IsNullOrWhiteSpace(profile.Phone))         known.Add($"phone = {profile.Phone}");
        if (!string.IsNullOrWhiteSpace(profile.Address))       known.Add($"address = {profile.Address}");
        if (!string.IsNullOrWhiteSpace(profile.PaymentMethod)) known.Add($"payment = {profile.PaymentMethod}");

        if (known.Count == 0) return;

        sb.AppendLine("=== ALREADY COLLECTED (do NOT ask for these again) ===");
        foreach (var k in known) sb.AppendLine($"• {k}");
        sb.AppendLine();
    }

    private static void AppendRules(StringBuilder sb, ChatbotPromptInput input, List<string> pays)
    {
        var isChat = input.Channel is "whatsapp" or "facebook" or "instagram";

        sb.AppendLine("=== RULES ===");
        sb.AppendLine("• Keep every reply to 1-2 short sentences. Be warm and helpful.");
        sb.AppendLine("• NEVER use markdown — no **bold**, no *italic*, no bullet lists, no headings. Plain text only.");
        sb.AppendLine("• NEVER state a price that is not shown above, and never invent products.");
        sb.AppendLine("• NEVER show a product id to the customer. Ids are for your JSON output only.");

        if (input.Focused != null)
        {
            sb.AppendLine("• ONLY discuss the product above. Do not mention, suggest or list any other product.");
            sb.AppendLine("• If the customer asks for something else, tell them they can tap 'Browse all products'.");
        }
        else
        {
            sb.AppendLine("• On a greeting: welcome the customer, name the categories, and ask which interests them.");
            sb.AppendLine("• When the customer names a category or product type: suggest 2-3 specific products with prices.");
            sb.AppendLine("• Never dump the whole catalogue. Never say 'I can't show' — just describe products in words.");
        }

        if (input.UnmatchedRequest)
        {
            sb.AppendLine();
            sb.AppendLine("=== THIS TURN ===");
            sb.AppendLine("The customer asked for something that is NOT in the catalogue above.");
            sb.AppendLine("• Say plainly that you don't carry it — do not invent it, and do not offer a substitute as if it were what they asked for.");
            sb.AppendLine("• Then ask ONE short follow-up about what they're after (occasion, style, budget, or which of the categories above appeals).");
            sb.AppendLine("• Do not list unrelated products in this reply.");
        }

        if (isChat)
            sb.AppendLine("• This is a messaging app. Keep it conversational and short — no long paragraphs.");

        sb.AppendLine("• To take an order: confirm size/variant, then collect name, phone and delivery address.");
        sb.AppendLine($"• Available payment options: {string.Join(", ", pays)}. Ask which they prefer.");
        sb.AppendLine("• The cart shown above is the truth. Never recite a different total.");
        sb.AppendLine();
    }

    private static void AppendOutputContract(StringBuilder sb, ChatbotPromptInput input, List<string> pays)
    {
        var payHint = input.OnlineEnabled
            ? "'online' for UPI/card/netbanking, 'cod' for cash on delivery"
            : "always 'cod'";

        sb.AppendLine("=== OUTPUT FORMAT ===");
        sb.AppendLine("Default: reply with plain conversational text and nothing else.");
        sb.AppendLine();
        sb.AppendLine("When the customer adds, changes or removes items, respond with ONLY this JSON:");
        sb.AppendLine("  {\"reply\":\"<your short reply>\",\"cart_ops\":[{\"op\":\"add\",\"product_id\":\"<id from the list above>\",\"qty\":1,\"variant\":\"<size>\"}]}");
        sb.AppendLine("  op is one of: add | set | remove | clear.  Always send product_id, copied exactly from an id: value above.");
        sb.AppendLine("  Do NOT send prices — the system prices every item from the live catalogue.");
        sb.AppendLine();

        if (input.CanPlaceOrders)
        {
            sb.AppendLine("When the customer has confirmed the order AND you have name, phone and address, respond with ONLY this JSON:");
            sb.AppendLine("  {\"reply\":\"Order confirmed!\",\"state\":\"order_ready\",\"name\":\"<n>\",\"phone\":\"<p>\",\"address\":\"<a>\",\"payment_method\":\"cod\"}");
            sb.AppendLine($"  payment_method = {payHint}.");
            sb.AppendLine("  Do NOT include a cart in this message — the system already holds it.");
            sb.AppendLine("  Never send order_ready while the cart above is empty.");
        }
        else
        {
            // This channel cannot actually create an order, so the model must not
            // tell the buyer it has been confirmed.
            sb.AppendLine("You CANNOT place orders on this channel. Once you have the customer's name, phone,");
            sb.AppendLine("address and chosen items, tell them the team will confirm the order shortly — never");
            sb.AppendLine("say the order is confirmed or invent an order number. Respond with ONLY this JSON:");
            sb.AppendLine("  {\"reply\":\"Thanks! Our team will confirm your order shortly.\",\"state\":\"collecting_info\",\"name\":\"<n>\",\"phone\":\"<p>\",\"address\":\"<a>\"}");
        }
    }

    private static string Clamp(string text, int max) =>
        text.Length <= max ? text : text[..max].TrimEnd() + "…";
}
