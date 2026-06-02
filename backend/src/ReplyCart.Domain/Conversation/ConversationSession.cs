using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Conversation;

/// <summary>
/// Tracks an ongoing AI-managed conversation with a customer across any channel.
/// One session per customer per channel — reused across messages, reset when closed.
/// </summary>
public class ConversationSession : TenantEntity
{
    /// <summary>Unique customer identifier for this channel (phone for WhatsApp, PSID for FB/IG).</summary>
    public string ExternalCustomerId { get; set; } = string.Empty;

    /// <summary>WhatsApp | Facebook | Instagram</summary>
    public string Channel { get; set; } = "WhatsApp";

    public ConversationState State { get; set; } = ConversationState.Greeting;

    // ── Collected during conversation ───────────────────────────────────────
    public string? CollectedName    { get; set; }
    public string? CollectedPhone   { get; set; }
    public string? CollectedAddress { get; set; }
    public string? CollectedEmail   { get; set; }

    /// <summary>Product the customer is most interested in (last mentioned).</summary>
    public Guid? InterestedProductId { get; set; }

    /// <summary>
    /// JSON array of cart items: [{ productId, title, qty, unitPrice }]
    /// Populated as the customer confirms items before checkout.
    /// </summary>
    public string CartJson { get; set; } = "[]";

    /// <summary>
    /// Last N messages stored as JSON for context window.
    /// Format: [{ role: "user"|"assistant", content: "..." }]
    /// </summary>
    public string MessagesJson { get; set; } = "[]";

    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

    /// <summary>False once session is escalated to human or order placed.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Lead created from this conversation.</summary>
    public Guid? LeadId { get; set; }

    /// <summary>Order placed at end of this conversation.</summary>
    public Guid? OrderId { get; set; }

    /// <summary>Number of messages exchanged in this session.</summary>
    public int MessageCount { get; set; }
}

public enum ConversationState
{
    /// <summary>First message — AI greets and asks how it can help.</summary>
    Greeting = 0,

    /// <summary>Customer is browsing — AI suggests products based on queries.</summary>
    Discovery = 1,

    /// <summary>Customer expressed interest in a specific product.</summary>
    Interested = 2,

    /// <summary>AI is collecting name, address, phone for checkout.</summary>
    CollectingInfo = 3,

    /// <summary>AI has all info, showing order summary and asking to confirm.</summary>
    Confirming = 4,

    /// <summary>Order placed — AI sends confirmation and closes.</summary>
    Ordered = 5,

    /// <summary>Session handed off to human seller or ended by timeout.</summary>
    Closed = 6,
}
