using System.Text.Json;
using System.Text.Json.Serialization;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Chatbot;

/// <summary>One cart mutation emitted by the AI. The AI may propose; only the server disposes.</summary>
public sealed class ChatbotCartOp
{
    /// <summary>add | set | remove | clear</summary>
    [JsonPropertyName("op")]         public string? Op        { get; set; }
    [JsonPropertyName("product_id")] public string? ProductId { get; set; }
    [JsonPropertyName("title")]      public string? Title     { get; set; }
    [JsonPropertyName("qty")]        public int?    Qty       { get; set; }
    [JsonPropertyName("variant")]    public string? Variant   { get; set; }

    /// <summary>Legacy field name used by the pre-cart_ops prompt. Read-only fallback.</summary>
    [JsonPropertyName("variant_info")] public string? VariantInfo { get; set; }

    public string? AnyVariant => string.IsNullOrWhiteSpace(Variant) ? VariantInfo : Variant;
}

/// <summary>
/// Applies AI-proposed cart operations to the authoritative server-side cart.
///
/// Rules that must not be weakened:
///  1. Every line is resolved to a real ChatbotProduct before it enters the cart.
///     Unresolvable lines are DROPPED, never guessed.
///  2. UnitPrice always comes from the live catalogue (SalePrice ?? Price).
///     Any price the AI states is ignored entirely.
///  3. Resolution prefers product_id, and a product_id is only honoured if it is
///     in the client's catalogue. Title matching is a last-resort fallback for
///     models that omit the id, and requires an unambiguous match.
/// </summary>
public static class ChatbotCartResolver
{
    private const int MaxLines   = 20;
    private const int MaxQtyLine = 99;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    /// <summary>Parses the raw cart_ops / cart JSON emitted by the AI. Never throws.</summary>
    public static List<ChatbotCartOp> ParseOps(string? rawJson)
    {
        if (string.IsNullOrWhiteSpace(rawJson)) return [];

        try
        {
            var ops = JsonSerializer.Deserialize<List<ChatbotCartOp>>(rawJson, JsonOpts);
            return ops?.Where(o => o != null).ToList() ?? [];
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// Applies <paramref name="ops"/> to <paramref name="current"/> against the given catalogue.
    /// </summary>
    /// <param name="focused">
    /// When the buyer is in single-product mode, every op resolves to this product
    /// regardless of what the AI named.
    /// </param>
    public static ChatCart Apply(
        ChatCart                          current,
        IReadOnlyList<ChatbotCartOp>      ops,
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        ChatbotCatalogItem?               focused = null)
    {
        if (ops.Count == 0) return Reprice(current, catalogue, focused);

        var lines = current.Lines.ToList();

        foreach (var op in ops)
        {
            var verb = (op.Op ?? "add").Trim().ToLowerInvariant();

            if (verb == "clear")
            {
                lines.Clear();
                continue;
            }

            var product = Resolve(op, catalogue, focused);
            if (product == null) continue;   // rule 1 — drop, never guess

            var variant = string.IsNullOrWhiteSpace(op.AnyVariant) ? null : op.AnyVariant!.Trim();
            var idx     = lines.FindIndex(l =>
                l.ProductId == product.Id &&
                string.Equals(l.Variant ?? "", variant ?? "", StringComparison.OrdinalIgnoreCase));

            switch (verb)
            {
                case "remove":
                    if (idx >= 0) lines.RemoveAt(idx);
                    break;

                case "set":
                {
                    var qty = Clamp(op.Qty ?? 1);
                    if (qty <= 0) { if (idx >= 0) lines.RemoveAt(idx); break; }
                    var line = NewLine(product, qty, variant);
                    if (idx >= 0) lines[idx] = line; else lines.Add(line);
                    break;
                }

                default: // "add"
                {
                    var qty = Clamp(op.Qty ?? 1);
                    if (qty <= 0) break;
                    if (idx >= 0)
                        lines[idx] = lines[idx] with { Qty = Clamp(lines[idx].Qty + qty), UnitPrice = product.EffectivePrice };
                    else
                        lines.Add(NewLine(product, qty, variant));
                    break;
                }
            }

            if (lines.Count > MaxLines)
                lines = lines.Take(MaxLines).ToList();
        }

        return new ChatCart(lines);
    }

    /// <summary>
    /// Re-resolves every stored line against the live catalogue: refreshes prices and
    /// drops lines whose product has since been deleted or marked unavailable.
    /// Runs on every turn, so a session that sat idle across a price change is corrected.
    /// </summary>
    public static ChatCart Reprice(
        ChatCart                          cart,
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        ChatbotCatalogItem?               focused = null)
    {
        if (cart.IsEmpty) return cart;

        var byId  = catalogue.ToDictionary(p => p.Id);
        var fresh = new List<ChatCartLine>(cart.Lines.Count);

        foreach (var line in cart.Lines)
        {
            ChatbotCatalogItem? product = null;

            if (line.ProductId is Guid pid && byId.TryGetValue(pid, out var hit)) product = hit;
            else if (focused != null && focused.Id == line.ProductId)             product = focused;

            if (product == null) continue;   // delisted → silently drop

            fresh.Add(line with
            {
                Title     = product.Title,
                UnitPrice = product.EffectivePrice,
                ImageUrl  = product.ImageUrl,
            });
        }

        return fresh.Count == cart.Lines.Count && fresh.SequenceEqual(cart.Lines)
            ? cart
            : new ChatCart(fresh);
    }

    // ── Resolution ────────────────────────────────────────────────────────────
    private static ChatbotCatalogItem? Resolve(
        ChatbotCartOp                     op,
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        ChatbotCatalogItem?               focused)
    {
        // Single-product mode: there is only one legal answer.
        if (focused != null) return focused;

        // Preferred path — explicit id, validated against this client's catalogue.
        if (Guid.TryParse(op.ProductId, out var id))
        {
            var byId = catalogue.FirstOrDefault(p => p.Id == id);
            if (byId != null) return byId;
        }

        // Fallback — exact (case-insensitive) title. Ambiguity is treated as failure.
        var title = op.Title?.Trim();
        if (string.IsNullOrEmpty(title)) return null;

        var exact = catalogue.Where(p => string.Equals(p.Title, title, StringComparison.OrdinalIgnoreCase)).ToList();
        if (exact.Count == 1) return exact[0];
        if (exact.Count > 1)  return null;      // ambiguous — refuse rather than pick

        var contains = catalogue
            .Where(p => p.Title.Contains(title, StringComparison.OrdinalIgnoreCase))
            .ToList();

        return contains.Count == 1 ? contains[0] : null;
    }

    private static ChatCartLine NewLine(ChatbotCatalogItem p, int qty, string? variant) =>
        new(p.Id, p.Title, qty, p.EffectivePrice, variant, p.ImageUrl);

    private static int Clamp(int qty) => qty < 0 ? 0 : Math.Min(qty, MaxQtyLine);
}
