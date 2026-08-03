using System.Globalization;
using System.Text;
using System.Text.Json;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Chatbot.Agent;

/// <summary>
/// The tool surface the Chatbot-as-a-Service agent exposes to the model, plus the
/// server-side execution of each tool.
///
/// Two properties that must not be weakened:
///
///  1. The model never sees a price it can restate freely and never writes to the cart
///     directly. It names product ids; the server resolves them against the live
///     catalogue and prices them. This is the same authority rule as the pre-agent
///     design, moved from a hand-parsed JSON envelope onto schema-validated tools.
///
///  2. place_order is TERMINAL and is not executed here. The loop stops and hands the
///     collected details back to the caller, which owns order creation (order number,
///     Razorpay, webhook). A model can therefore never invent an order number or
///     confirm an order that the server did not actually create.
/// </summary>
public static class ChatbotAgentTools
{
    public const string SearchCatalog       = "search_catalog";
    public const string GetProductDetails   = "get_product_details";
    public const string UpdateCart          = "update_cart";
    public const string SaveCustomerDetails = "save_customer_details";
    public const string PlaceOrder          = "place_order";

    /// <summary>Max products returned by one search_catalog call.</summary>
    public const int SearchLimit = 8;

    /// <summary>Max ids honoured by one get_product_details call.</summary>
    private const int DetailLimit = 6;

    private const int DescriptionClamp = 220;

    // ──────────────────────────────────────────────────────────────────────────
    // Schemas
    // ──────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Builds the tool list for this turn.
    /// In focused (single-product) mode the catalogue tools are withheld entirely so
    /// the model cannot wander off the product the buyer is looking at — the rule is
    /// enforced by absence rather than by prompt instruction.
    /// </summary>
    public static IReadOnlyList<AgentTool> For(bool focusedMode, bool canPlaceOrders)
    {
        var tools = new List<AgentTool>();

        if (!focusedMode)
        {
            tools.Add(new AgentTool(
                SearchCatalog,
                "Search the store catalogue for products matching what the customer wants. " +
                "Call this BEFORE saying whether an item is available — never assume. " +
                "Rewrite vague requests into concrete product keywords " +
                "(e.g. \"something elegant for a wedding\" -> query \"bridal kundan necklace\"). " +
                "Returns matching products with their ids and prices.",
                """
                {
                  "type": "object",
                  "properties": {
                    "query":     { "type": "string",  "description": "Product keywords. Empty string lists items in the given category." },
                    "category":  { "type": "string",  "description": "Restrict to one category from the catalogue index." },
                    "min_price": { "type": "number",  "description": "Lowest acceptable price." },
                    "max_price": { "type": "number",  "description": "Highest acceptable price." }
                  },
                  "required": ["query"]
                }
                """));

            tools.Add(new AgentTool(
                GetProductDetails,
                "Fetch the full description and variants for products the customer is asking about in detail. " +
                "Only call this with ids returned by search_catalog.",
                """
                {
                  "type": "object",
                  "properties": {
                    "product_ids": {
                      "type": "array",
                      "items": { "type": "string" },
                      "description": "Product ids copied exactly from search_catalog results."
                    }
                  },
                  "required": ["product_ids"]
                }
                """));
        }

        tools.Add(new AgentTool(
            UpdateCart,
            "Add, change or remove items in the customer's cart. The server prices every item " +
            "from the live catalogue — never send a price. Returns the updated cart.",
            """
            {
              "type": "object",
              "properties": {
                "ops": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "op":         { "type": "string", "enum": ["add", "set", "remove", "clear"] },
                      "product_id": { "type": "string", "description": "Id copied exactly from a search result." },
                      "qty":        { "type": "integer" },
                      "variant":    { "type": "string", "description": "Chosen size or variant, if any." }
                    },
                    "required": ["op"]
                  }
                }
              },
              "required": ["ops"]
            }
            """));

        tools.Add(new AgentTool(
            SaveCustomerDetails,
            "Record delivery details as soon as the customer gives them, so they are never asked twice. " +
            "Send only the fields you actually learned this turn.",
            """
            {
              "type": "object",
              "properties": {
                "name":           { "type": "string" },
                "phone":          { "type": "string" },
                "address":        { "type": "string" },
                "payment_method": { "type": "string", "enum": ["cod", "online"] }
              }
            }
            """));

        if (canPlaceOrders)
        {
            tools.Add(new AgentTool(
                PlaceOrder,
                "Place the order. Only call this once the cart has items AND the customer has " +
                "confirmed, and you have their name, phone and delivery address. " +
                "The server creates the order and tells the customer the order number — " +
                "do not invent one and do not state a total.",
                """
                {
                  "type": "object",
                  "properties": {
                    "name":           { "type": "string" },
                    "phone":          { "type": "string" },
                    "address":        { "type": "string" },
                    "payment_method": { "type": "string", "enum": ["cod", "online"] }
                  },
                  "required": ["name", "phone", "address"]
                }
                """));
        }

        return tools;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Thinking one-liners
    // ──────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// The short status shown in the chat while this tool runs.
    ///
    /// Derived from the tool call itself rather than asked of the model: it costs no
    /// tokens, adds no latency, and cannot be silently skipped when the model is under
    /// instruction pressure.
    /// </summary>
    public static string Describe(AgentToolCall call, string currency)
    {
        var args = Parse(call.ArgumentsJson);

        switch (call.Name)
        {
            case SearchCatalog:
            {
                var query    = Str(args, "query");
                var category = Str(args, "category");
                var min      = Num(args, "min_price");
                var max      = Num(args, "max_price");

                var subject = !string.IsNullOrWhiteSpace(query) ? query!
                            : !string.IsNullOrWhiteSpace(category) ? category!.ToLowerInvariant()
                            : "products";

                var sb = new StringBuilder($"Searching for {subject}");

                if (!string.IsNullOrWhiteSpace(category) && !string.IsNullOrWhiteSpace(query))
                    sb.Append($" in {category}");

                if (min.HasValue && max.HasValue) sb.Append($" between {currency} {min:N0} and {currency} {max:N0}");
                else if (max.HasValue)            sb.Append($" under {currency} {max:N0}");
                else if (min.HasValue)            sb.Append($" above {currency} {min:N0}");

                return sb.Append('…').ToString();
            }

            case GetProductDetails:
                return "Checking the details…";

            case UpdateCart:
            {
                var ops = args is not null && args.TryGetValue("ops", out var o) && o.ValueKind == JsonValueKind.Array
                    ? o.EnumerateArray()
                        .Select(e => e.TryGetProperty("op", out var v) ? v.GetString() : null)
                        .Where(v => v != null)
                        .ToList()
                    : [];

                if (ops.Count > 0 && ops.All(v => v == "clear"))  return "Emptying your cart…";
                if (ops.Count > 0 && ops.All(v => v == "remove")) return "Removing that from your cart…";
                if (ops.Count > 0 && ops.All(v => v == "add"))    return "Adding to your cart…";
                return "Updating your cart…";
            }

            case SaveCustomerDetails:
                return "Saving your details…";

            case PlaceOrder:
                return "Placing your order…";

            default:
                return "Working on it…";
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Execution
    // ──────────────────────────────────────────────────────────────────────────

    /// <summary>Result of running one non-terminal tool.</summary>
    public sealed record ToolOutcome(
        string                            Content,
        ChatCart?                         Cart      = null,
        IReadOnlyList<ChatbotCatalogItem>? Surfaced = null,
        ChatProfilePatch?                 Patch     = null);

    public static ToolOutcome ExecuteSearch(
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        string                            argumentsJson,
        string                            currency)
    {
        var args     = Parse(argumentsJson);
        var query    = Str(args, "query")    ?? "";
        var category = Str(args, "category");
        var min      = Num(args, "min_price");
        var max      = Num(args, "max_price");

        IEnumerable<ChatbotCatalogItem> pool = catalogue;

        if (!string.IsNullOrWhiteSpace(category))
        {
            var scoped = pool.Where(p =>
                string.Equals(p.Category, category, StringComparison.OrdinalIgnoreCase)).ToList();

            // An unknown category name is a model mistake, not an empty store — fall
            // back to the full catalogue rather than reporting "nothing found".
            if (scoped.Count > 0) pool = scoped;
        }

        if (min.HasValue) pool = pool.Where(p => p.EffectivePrice >= (decimal)min.Value);
        if (max.HasValue) pool = pool.Where(p => p.EffectivePrice <= (decimal)max.Value);

        var filtered = pool.ToList();

        var matches = string.IsNullOrWhiteSpace(query)
            ? filtered.Take(SearchLimit).ToList()
            : ChatbotCatalogSelector.Rank(filtered, query, SearchLimit);

        // Keyword ranking found nothing but the filters left stock on the shelf —
        // show that stock rather than reporting the store is empty.
        if (matches.Count == 0 && filtered.Count > 0 && (category != null || min.HasValue || max.HasValue))
            matches = filtered.Take(SearchLimit).ToList();

        if (matches.Count == 0)
        {
            return new ToolOutcome(
                $"No products matched. The store has {catalogue.Count} products across these categories: " +
                $"{string.Join(", ", ChatbotCatalogSelector.Categories(catalogue))}. " +
                "Tell the customer you don't carry it and ask one short follow-up question.",
                Surfaced: Array.Empty<ChatbotCatalogItem>());
        }

        var sb = new StringBuilder();
        sb.AppendLine($"{matches.Count} match(es) of {filtered.Count} in scope:");
        foreach (var p in matches) AppendLine(sb, p, currency, withDescription: false);

        return new ToolOutcome(sb.ToString(), Surfaced: matches);
    }

    public static ToolOutcome ExecuteDetails(
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        string                            argumentsJson,
        string                            currency)
    {
        var args = Parse(argumentsJson);
        var ids  = args is not null && args.TryGetValue("product_ids", out var el) && el.ValueKind == JsonValueKind.Array
            ? el.EnumerateArray().Select(e => e.GetString()).Where(s => s != null).Take(DetailLimit).ToList()
            : [];

        var found = new List<ChatbotCatalogItem>();
        foreach (var raw in ids)
        {
            if (!Guid.TryParse(raw, out var id)) continue;
            var hit = catalogue.FirstOrDefault(p => p.Id == id);
            if (hit != null) found.Add(hit);
        }

        if (found.Count == 0)
            return new ToolOutcome("None of those ids exist in this catalogue. Use search_catalog to find valid products.");

        var sb = new StringBuilder();
        foreach (var p in found) AppendLine(sb, p, currency, withDescription: true);

        return new ToolOutcome(sb.ToString(), Surfaced: found);
    }

    public static ToolOutcome ExecuteCartUpdate(
        ChatCart                          cart,
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        ChatbotCatalogItem?               focused,
        string                            argumentsJson,
        string                            currency)
    {
        var args = Parse(argumentsJson);
        var ops  = args is not null && args.TryGetValue("ops", out var el)
            ? ChatbotCartResolver.ParseOps(el.ToString())
            : [];

        if (ops.Count == 0)
            return new ToolOutcome("No valid cart operations were supplied. The cart is unchanged.", Cart: cart);

        var before  = cart;
        var updated = ChatbotCartResolver.Apply(cart, ops, catalogue, focused);

        // The resolver silently DROPS any op whose product_id is not in this client's
        // catalogue — that is the price-authority rule and it stays. But silence here
        // means the model cheerfully tells the buyer something was added when it wasn't,
        // so an unchanged cart after a mutating op is reported back as a failure.
        var mutating = ops.Any(o => !string.Equals(o.Op, "clear", StringComparison.OrdinalIgnoreCase));
        var unchanged = updated.Lines.Count == before.Lines.Count
                     && updated.Lines.SequenceEqual(before.Lines);

        var note = mutating && unchanged
            ? "Warning: nothing changed — the product id(s) did not match this catalogue. " +
              "Call search_catalog and use an id exactly as returned.\n"
            : "";

        return new ToolOutcome(note + RenderCart(updated, currency), Cart: updated);
    }

    public static ToolOutcome ExecuteSaveDetails(string argumentsJson)
    {
        var args    = Parse(argumentsJson);
        var name    = Str(args, "name");
        var phone   = Str(args, "phone");
        var address = Str(args, "address");
        var payment = Str(args, "payment_method");

        var saved = new List<string>();
        if (!string.IsNullOrWhiteSpace(name))    saved.Add("name");
        if (!string.IsNullOrWhiteSpace(phone))   saved.Add("phone");
        if (!string.IsNullOrWhiteSpace(address)) saved.Add("address");
        if (!string.IsNullOrWhiteSpace(payment)) saved.Add("payment method");

        if (saved.Count == 0)
            return new ToolOutcome("Nothing to save — no fields were supplied.");

        return new ToolOutcome(
            $"Saved: {string.Join(", ", saved)}. Do not ask for these again.",
            Patch: new ChatProfilePatch(
                Name:          name,
                Phone:         phone,
                Address:       address,
                PaymentMethod: payment,
                State:         "collecting_info"));
    }

    /// <summary>Reads the place_order arguments. Execution belongs to the caller.</summary>
    public static ChatbotOrderIntent ReadOrderIntent(string argumentsJson)
    {
        var args = Parse(argumentsJson);
        return new ChatbotOrderIntent(
            Str(args, "name"),
            Str(args, "phone"),
            Str(args, "address"),
            Str(args, "payment_method"));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Rendering
    // ──────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Shared by the prompt's CURRENT CART block and the update_cart tool result, so the
    /// model reads the cart in one format only. <paramref name="emptyText"/> differs
    /// between the two: "now empty" states an outcome, which would be a lie in a prompt
    /// where nothing was changed this turn.
    /// </summary>
    public static string RenderCart(ChatCart cart, string currency, string emptyText = "Cart is now empty.")
    {
        if (cart.IsEmpty) return emptyText;

        var sb = new StringBuilder("Cart now contains:\n");
        foreach (var l in cart.Lines)
        {
            var variant = string.IsNullOrWhiteSpace(l.Variant) ? "" : $" ({l.Variant})";
            sb.AppendLine($"• {l.Title}{variant} x{l.Qty} — {currency} {l.Qty * l.UnitPrice:F0}");
        }
        sb.Append($"Total: {currency} {cart.Total:F0}");
        return sb.ToString();
    }

    private static void AppendLine(StringBuilder sb, ChatbotCatalogItem p, string currency, bool withDescription)
    {
        var price = p.SalePrice.HasValue
            ? $"{p.Price:F0} (sale: {p.SalePrice.Value:F0})"
            : $"{p.Price:F0}";
        var cat = string.IsNullOrWhiteSpace(p.Category) ? "" : $"[{p.Category}] ";

        sb.AppendLine($"• {cat}{p.Title} — {currency} {price} — id:{p.Id:N}");

        if (!string.IsNullOrWhiteSpace(p.Variants))
            sb.AppendLine($"  Variants: {p.Variants}");

        if (withDescription && !string.IsNullOrWhiteSpace(p.Description))
            sb.AppendLine($"  {Clamp(p.Description!.Replace("\n", " "), DescriptionClamp)}");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Argument parsing — never throws; a malformed argument blob reads as "absent".
    // ──────────────────────────────────────────────────────────────────────────

    private static Dictionary<string, JsonElement>? Parse(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);
        }
        catch
        {
            return null;
        }
    }

    private static string? Str(Dictionary<string, JsonElement>? args, string key)
    {
        if (args is null || !args.TryGetValue(key, out var el)) return null;
        var value = el.ValueKind == JsonValueKind.String ? el.GetString() : el.ToString();
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static double? Num(Dictionary<string, JsonElement>? args, string key)
    {
        if (args is null || !args.TryGetValue(key, out var el)) return null;

        return el.ValueKind switch
        {
            JsonValueKind.Number => el.GetDouble(),
            JsonValueKind.String => double.TryParse(el.GetString(), NumberStyles.Any,
                                        CultureInfo.InvariantCulture, out var d) ? d : null,
            _ => null,
        };
    }

    private static string Clamp(string text, int max) =>
        text.Length <= max ? text : text[..max].TrimEnd() + "…";
}

/// <summary>
/// Order details the model collected. The agent stops when this appears; the caller
/// creates the order, so the order number and total are always server-generated.
/// </summary>
public sealed record ChatbotOrderIntent(
    string? Name,
    string? Phone,
    string? Address,
    string? PaymentMethod);
