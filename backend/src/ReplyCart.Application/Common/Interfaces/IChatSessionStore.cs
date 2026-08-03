namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// Identifies one buyer conversation belonging to one chatbot client.
/// SessionId is the widget/localStorage id, or the WhatsApp/FB/IG sender id.
/// </summary>
public readonly record struct ChatSessionKey(Guid ClientId, string SessionId, string Channel = "web");

/// <summary>
/// One line of a buyer's cart. Prices here are ALWAYS resolved server-side from
/// ChatbotProducts — the AI never sets a price. See ChatbotCartResolver.
/// </summary>
public sealed record ChatCartLine(
    Guid?   ProductId,
    string  Title,
    int     Qty,
    decimal UnitPrice,
    string? Variant  = null,
    string? ImageUrl = null);

/// <summary>The authoritative running cart for a session.</summary>
public sealed record ChatCart(IReadOnlyList<ChatCartLine> Lines)
{
    public static ChatCart Empty { get; } = new(Array.Empty<ChatCartLine>());

    public bool    IsEmpty => Lines.Count == 0;
    public decimal Total   => Lines.Sum(l => l.Qty * l.UnitPrice);
    public int     Count   => Lines.Sum(l => l.Qty);
}

/// <summary>
/// Non-message session context: what we've collected from the buyer and what we
/// last showed them (used to resolve cart operations by product id instead of
/// fuzzy title matching).
/// </summary>
public sealed record ChatProfile(
    string?           Name                = null,
    string?           Phone               = null,
    string?           Address             = null,
    string?           State               = null,
    string?           PaymentMethod       = null,
    Guid?             FocusedProductId    = null,
    IReadOnlyList<Guid>? LastShownProductIds = null)
{
    public static ChatProfile Empty { get; } = new();

    public IReadOnlyList<Guid> ShownProducts => LastShownProductIds ?? Array.Empty<Guid>();
}

/// <summary>Sparse update — only non-null members are written.</summary>
public sealed record ChatProfilePatch(
    string?           Name                = null,
    string?           Phone               = null,
    string?           Address             = null,
    string?           State               = null,
    string?           PaymentMethod       = null,
    Guid?             FocusedProductId    = null,
    IReadOnlyList<Guid>? LastShownProductIds = null);

/// <summary>Everything needed to build a prompt, fetched in a single round-trip.</summary>
public sealed record ChatSessionSnapshot(
    IReadOnlyList<ConversationMessage> History,
    ChatCart                           Cart,
    ChatProfile                        Profile)
{
    public static ChatSessionSnapshot Empty { get; } =
        new(Array.Empty<ConversationMessage>(), ChatCart.Empty, ChatProfile.Empty);
}

/// <summary>
/// Durable, cross-instance session state for the Chatbot-as-a-Service module.
///
/// Distinct from <see cref="IConversationMemoryService"/>, which remains the
/// in-process store used by the tenant storefront chatbot and tenant channel
/// webhooks. Do not merge the two — this one is async and carries cart/profile.
/// </summary>
public interface IChatSessionStore
{
    /// <summary>History (oldest first, capped), cart and profile in one call.</summary>
    Task<ChatSessionSnapshot> GetAsync(ChatSessionKey key, CancellationToken ct = default);

    /// <summary>Appends the buyer message and the assistant reply, trimming to the retention cap.</summary>
    Task AppendMessagesAsync(ChatSessionKey key, ConversationMessage userMsg, ConversationMessage assistantMsg, CancellationToken ct = default);

    /// <summary>Replaces the whole cart with the server-resolved one.</summary>
    Task SetCartAsync(ChatSessionKey key, ChatCart cart, CancellationToken ct = default);

    /// <summary>Writes only the non-null members of the patch.</summary>
    Task PatchProfileAsync(ChatSessionKey key, ChatProfilePatch patch, CancellationToken ct = default);

    /// <summary>Drops all state for the session (called after a successful order).</summary>
    Task ClearAsync(ChatSessionKey key, CancellationToken ct = default);
}
