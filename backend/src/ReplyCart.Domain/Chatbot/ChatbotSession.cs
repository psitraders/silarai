using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Chatbot;

/// <summary>
/// Durable record of one buyer conversation with an external chatbot client.
///
/// Redis is the hot store for live sessions; this table is the backstop that lets a
/// conversation be rebuilt when Redis is unavailable and the request lands on an
/// instance that has never seen the session. It also gives the seller an auditable
/// transcript — previously nothing about a conversation was persisted at all, so
/// ChatbotOrder.SessionId pointed at state that no longer existed.
///
/// Written by a background writer, never on the request path.
/// </summary>
public class ChatbotSession : BaseEntity
{
    public Guid   ClientId  { get; set; }

    /// <summary>Widget localStorage id, or the WhatsApp / Messenger / Instagram sender id.</summary>
    public string SessionId { get; set; } = string.Empty;

    /// <summary>web | whatsapp | facebook | instagram</summary>
    public string Channel   { get; set; } = "web";

    // ── Collected fields (mirrors ChatProfile) ────────────────────────────────
    public string? State           { get; set; }
    public string? CustomerName    { get; set; }
    public string? CustomerPhone   { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? PaymentMethod   { get; set; }

    /// <summary>Server-authoritative cart as JSON. Same shape the widget renders.</summary>
    public string  CartJson        { get; set; } = "";

    public DateTime LastMessageAt  { get; set; } = DateTime.UtcNow;

    /// <summary>Monotonic counter used to order messages deterministically.</summary>
    public int      MessageSeq     { get; set; }

    public ICollection<ChatbotSessionMessage> Messages { get; set; } = [];
}

/// <summary>One persisted turn of a <see cref="ChatbotSession"/>.</summary>
public class ChatbotSessionMessage : BaseEntity
{
    public Guid   SessionRowId { get; set; }

    /// <summary>user | assistant</summary>
    public string Role         { get; set; } = "user";

    public string Content      { get; set; } = string.Empty;

    /// <summary>Ordering within the session. CreatedAt alone is not granular enough.</summary>
    public int    Seq          { get; set; }

    public ChatbotSession Session { get; set; } = null!;
}
