namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// Durable (SQL) tier behind <see cref="IChatSessionStore"/>.
///
/// Writes are queued and drained off the request path so they never add latency
/// to a chat turn. Reads happen only when BOTH Redis and the in-process cache
/// miss — i.e. Redis is down and this instance has not seen the session before.
/// </summary>
public interface IChatSessionArchive
{
    /// <summary>Rebuilds a session from SQL. Returns null when the session was never persisted.</summary>
    Task<ChatSessionSnapshot?> LoadAsync(ChatSessionKey key, CancellationToken ct = default);

    /// <summary>Queues a user/assistant exchange for write-behind persistence. Never throws.</summary>
    void QueueMessages(ChatSessionKey key, ConversationMessage userMsg, ConversationMessage assistantMsg);

    /// <summary>Queues cart / collected-field state for write-behind persistence. Never throws.</summary>
    void QueueState(ChatSessionKey key, ChatCart? cart, ChatProfile? profile);
}
