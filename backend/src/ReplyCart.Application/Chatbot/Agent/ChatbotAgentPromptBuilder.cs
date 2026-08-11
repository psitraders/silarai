using System.Text;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Chatbot.Agent;

/// <summary>Everything the agent prompt needs. Assembled by the caller; no I/O in here.</summary>
public sealed record ChatbotAgentPromptInput(
    string                            ClientName,
    string?                           BusinessDesc,
    string                            Currency,
    bool                              CodEnabled,
    bool                              OnlineEnabled,
    /// <summary>Full catalogue. Used for the index only — individual products are never dumped.</summary>
    IReadOnlyList<ChatbotCatalogItem> Catalogue,
    ChatCart                          Cart,
    ChatProfile                       Profile,
    ChatbotCatalogItem?               Focused        = null,
    string?                           KnowledgeBase  = null,
    string                            Channel        = "web",
    /// <summary>
    /// False on WhatsApp / Messenger / Instagram, which reply only and have no order
    /// step. The place_order tool is withheld and the model is told to hand off.
    /// </summary>
    bool                              CanPlaceOrders = true);

/// <summary>
/// System prompt for the tool-calling agent.
///
/// The prompt is split into two parts, and the split is the whole point:
///
///   STATIC PREFIX  — identity, catalogue index, rules. Byte-identical for a given
///                    client on every turn, so the provider's automatic prompt cache
///                    hits and this section is billed at a discount with a much lower
///                    time-to-first-token.
///   DYNAMIC SUFFIX — cart, collected fields, knowledge-base passages, focused product.
///                    Changes per turn, so it MUST come last. Moving any of it above
///                    the prefix silently destroys the cache hit on every turn.
///
/// The catalogue itself is never inlined. The model gets a category index — what
/// exists, how many, and the price band — and reaches for search_catalog for the rest.
/// That keeps prompt cost flat as a client's catalogue grows from 50 to 2,000 products.
/// </summary>
public static class ChatbotAgentPromptBuilder
{
    private const int DescriptionClamp = 220;

    public static string Build(ChatbotAgentPromptInput input)
    {
        var sb = new StringBuilder();

        AppendStaticPrefix(sb, input);
        AppendDynamicSuffix(sb, input);

        return sb.ToString();
    }

    // ── Static, cacheable ─────────────────────────────────────────────────────
    private static void AppendStaticPrefix(StringBuilder sb, ChatbotAgentPromptInput input)
    {
        sb.AppendLine($"You are a smart sales assistant for {input.ClientName}.");
        if (!string.IsNullOrWhiteSpace(input.BusinessDesc))
            sb.AppendLine($"About the business: {input.BusinessDesc}");
        sb.AppendLine($"Currency: {input.Currency}");
        sb.AppendLine();

        if (input.Focused == null)
            AppendCatalogueIndex(sb, input);

        AppendRules(sb, input);
    }

    /// <summary>
    /// The table of contents: every category with its product count and price band.
    /// ~40 lines even for a 2,000-product catalogue, so the model always knows what
    /// the store carries without a single product being inlined.
    /// </summary>
    private static void AppendCatalogueIndex(StringBuilder sb, ChatbotAgentPromptInput input)
    {
        sb.AppendLine("=== CATALOGUE INDEX ===");
        sb.AppendLine($"Total products: {input.Catalogue.Count}");

        var groups = input.Catalogue
            .GroupBy(p => string.IsNullOrWhiteSpace(p.Category) ? "Other" : p.Category!.Trim())
            .OrderBy(g => g.Key, StringComparer.OrdinalIgnoreCase);

        foreach (var g in groups)
        {
            var lo = g.Min(p => p.EffectivePrice);
            var hi = g.Max(p => p.EffectivePrice);
            var band = lo == hi
                ? $"{input.Currency} {lo:F0}"
                : $"{input.Currency} {lo:F0}–{hi:F0}";

            var n = g.Count();
            sb.AppendLine($"• {g.Key} — {n} {(n == 1 ? "product" : "products")}, {band}");
        }

        sb.AppendLine();
        sb.AppendLine("This index lists CATEGORIES, not individual products. To name, price or");
        sb.AppendLine("recommend any specific product you MUST call search_catalog first.");
        sb.AppendLine();
    }

    private static void AppendRules(StringBuilder sb, ChatbotAgentPromptInput input)
    {
        var isChat = input.Channel is "whatsapp" or "facebook" or "instagram";
        var pays   = PaymentOptions(input);

        sb.AppendLine("=== RULES ===");
        sb.AppendLine("• Keep every reply to 1-2 short sentences. Be warm and helpful.");
        sb.AppendLine("• NEVER use markdown — no **bold**, no *italic*, no bullet lists, no headings. Plain text only.");
        sb.AppendLine("• NEVER invent a product, a price, a stock level or a delivery date.");
        sb.AppendLine("• NEVER state a price you did not get back from a tool this conversation.");
        sb.AppendLine("• NEVER show a product id to the customer. Ids are for tool arguments only.");
        sb.AppendLine("• Search before you answer any availability question. Do not guess from the category index.");
        sb.AppendLine("• If a search returns nothing, say plainly that you don't carry it, then ask ONE short");
        sb.AppendLine("  follow-up (occasion, style, budget, or which category appeals). Do not offer an");
        sb.AppendLine("  unrelated product as though it were what they asked for.");

        if (input.Focused != null)
        {
            sb.AppendLine("• ONLY discuss the product shown below. Do not mention or suggest any other product.");
            sb.AppendLine("• If the customer asks for something else, tell them they can tap 'Browse all products'.");
        }
        else
        {
            sb.AppendLine("• On a greeting: welcome the customer, name a few categories, ask which interests them.");
            sb.AppendLine("• When they name a category or product type: search, then suggest 2-3 specific");
            sb.AppendLine("  products with prices. Never dump the whole catalogue.");
        }

        if (isChat)
            sb.AppendLine("• This is a messaging app. Keep it conversational and short — no long paragraphs.");

        sb.AppendLine("• To take an order: confirm size/variant, then collect name, phone and delivery address.");
        sb.AppendLine($"• Available payment options: {string.Join(", ", pays)}. Ask which they prefer.");
        sb.AppendLine("• Record details with save_customer_details the moment you learn them.");
        sb.AppendLine("• The cart shown below is the truth. Never recite a different total.");

        if (!input.CanPlaceOrders)
        {
            sb.AppendLine("• You CANNOT place orders on this channel. Once you have their items and details,");
            sb.AppendLine("  say the team will confirm shortly. Never say an order is confirmed, and never");
            sb.AppendLine("  invent an order number.");
        }
        else
        {
            sb.AppendLine("• Call place_order only after the cart has items and the customer has confirmed.");
            sb.AppendLine("  The server generates the order number and states the total — you must not.");
        }

        sb.AppendLine();
    }

    // ── Dynamic, per-turn — must stay AFTER the static prefix ─────────────────
    private static void AppendDynamicSuffix(StringBuilder sb, ChatbotAgentPromptInput input)
    {
        if (input.Focused != null)
        {
            sb.AppendLine("=== THE CUSTOMER IS VIEWING THIS SPECIFIC PRODUCT ===");
            AppendProduct(sb, input.Focused, input.Currency);
            sb.AppendLine();
        }

        sb.AppendLine("=== CURRENT CART (authoritative — maintained by the system, not by you) ===");
        sb.AppendLine(ChatbotAgentTools.RenderCart(input.Cart, input.Currency, "(empty)"));
        sb.AppendLine();

        AppendCollected(sb, input.Profile);

        if (!string.IsNullOrWhiteSpace(input.KnowledgeBase))
        {
            sb.AppendLine("=== KNOWLEDGE BASE (store policies & documents) ===");
            sb.AppendLine("Answer policy, privacy, shipping, returns, warranty and compliance questions ONLY " +
                          "from the passages below. If the answer is not here, say you will connect them with " +
                          "the team — never invent policy details.");
            sb.AppendLine(input.KnowledgeBase);
            sb.AppendLine();
        }
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

    private static void AppendProduct(StringBuilder sb, ChatbotCatalogItem p, string currency)
    {
        var price = p.SalePrice.HasValue
            ? $"{p.Price:F0} (sale: {p.SalePrice.Value:F0})"
            : $"{p.Price:F0}";

        sb.AppendLine($"• {p.Title} — {currency} {price} — id:{p.Id:N}");

        if (!string.IsNullOrWhiteSpace(p.Description))
        {
            var desc = p.Description!.Replace("\n", " ");
            sb.AppendLine($"  {(desc.Length <= DescriptionClamp ? desc : desc[..DescriptionClamp].TrimEnd() + "…")}");
        }

        if (!string.IsNullOrWhiteSpace(p.Variants))
            sb.AppendLine($"  Variants: {p.Variants}");
    }

    private static List<string> PaymentOptions(ChatbotAgentPromptInput input)
    {
        var pays = new List<string>();
        if (input.CodEnabled)    pays.Add("Cash on Delivery");
        if (input.OnlineEnabled) pays.Add("Online Payment");
        if (pays.Count == 0)     pays.Add("Cash on Delivery");
        return pays;
    }
}
