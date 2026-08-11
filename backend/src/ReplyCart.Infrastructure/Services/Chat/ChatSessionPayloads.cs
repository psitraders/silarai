using System.Text.Json;
using System.Text.Json.Serialization;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services.Chat;

/// <summary>
/// Wire format for everything persisted to Redis / SQL.
///
/// Every payload carries a version (<c>v</c>). A payload written by a newer or
/// unrecognised version is treated as a cold miss rather than throwing, so a deploy
/// that changes the shape degrades to "buyer starts a fresh conversation" instead of
/// 500-ing every in-flight session.
/// </summary>
internal static class ChatSessionPayloads
{
    public const int CurrentVersion = 1;

    public static readonly JsonSerializerOptions Json = new()
    {
        PropertyNamingPolicy    = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition  = JsonIgnoreCondition.WhenWritingNull,
    };

    // ── Messages ──────────────────────────────────────────────────────────────
    internal sealed record MessageDto(
        [property: JsonPropertyName("v")] int    Version,
        [property: JsonPropertyName("r")] string Role,
        [property: JsonPropertyName("c")] string Content);

    public static string SerializeMessage(ConversationMessage m) =>
        JsonSerializer.Serialize(new MessageDto(CurrentVersion, m.Role, m.Content), Json);

    public static ConversationMessage? DeserializeMessage(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        try
        {
            var dto = JsonSerializer.Deserialize<MessageDto>(raw, Json);
            if (dto == null || dto.Version > CurrentVersion) return null;
            return new ConversationMessage(dto.Role, dto.Content);
        }
        catch { return null; }
    }

    // ── Cart ──────────────────────────────────────────────────────────────────
    internal sealed record CartDto(int V, List<CartLineDto> Lines);
    internal sealed record CartLineDto(Guid? ProductId, string Title, int Qty, decimal UnitPrice, string? Variant, string? ImageUrl);

    public static string SerializeCart(ChatCart cart) =>
        JsonSerializer.Serialize(
            new CartDto(CurrentVersion,
                cart.Lines.Select(l => new CartLineDto(l.ProductId, l.Title, l.Qty, l.UnitPrice, l.Variant, l.ImageUrl)).ToList()),
            Json);

    public static ChatCart DeserializeCart(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return ChatCart.Empty;
        try
        {
            var dto = JsonSerializer.Deserialize<CartDto>(raw, Json);
            if (dto?.Lines == null || dto.V > CurrentVersion) return ChatCart.Empty;
            return new ChatCart(dto.Lines
                .Select(l => new ChatCartLine(l.ProductId, l.Title, l.Qty, l.UnitPrice, l.Variant, l.ImageUrl))
                .ToList());
        }
        catch { return ChatCart.Empty; }
    }

    // ── Profile field names (Redis hash keys / SQL columns) ───────────────────
    public const string FName    = "name";
    public const string FPhone   = "phone";
    public const string FAddress = "address";
    public const string FState   = "state";
    public const string FPayment = "payment";
    public const string FFocused = "focused";
    public const string FShown   = "shown";

    public static string SerializeShown(IReadOnlyList<Guid>? ids) =>
        ids == null || ids.Count == 0 ? "" : string.Join(',', ids.Select(i => i.ToString("N")));

    public static IReadOnlyList<Guid> DeserializeShown(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return Array.Empty<Guid>();
        var list = new List<Guid>();
        foreach (var part in raw.Split(',', StringSplitOptions.RemoveEmptyEntries))
            if (Guid.TryParse(part, out var g)) list.Add(g);
        return list;
    }
}
