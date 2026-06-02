using System.Collections.Concurrent;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

/// <summary>
/// Thread-safe, in-memory conversation history store for the storefront AI chatbot.
/// Registered as a singleton — survives across HTTP requests within a single process.
/// Sessions auto-expire after 2 hours of inactivity; stale entries are lazily evicted.
/// </summary>
public sealed class ConversationMemoryService : IConversationMemoryService
{
    private sealed record SessionData(List<ConversationMessage> Messages, DateTime LastAccessed);

    private readonly ConcurrentDictionary<string, SessionData> _sessions = new();

    private const int MaxMessagesPerSession = 40; // 20 user/assistant exchanges
    private static readonly TimeSpan SessionTtl = TimeSpan.FromHours(2);

    public IReadOnlyList<ConversationMessage> GetHistory(string sessionId)
    {
        EvictExpiredSessions();

        if (_sessions.TryGetValue(sessionId, out var session))
        {
            // Refresh last-accessed timestamp without locking
            _sessions.TryUpdate(sessionId, session with { LastAccessed = DateTime.UtcNow }, session);
            return session.Messages.AsReadOnly();
        }

        return [];
    }

    public void AddMessages(string sessionId, ConversationMessage userMsg, ConversationMessage assistantMsg)
    {
        _sessions.AddOrUpdate(
            sessionId,
            _ => new SessionData([userMsg, assistantMsg], DateTime.UtcNow),
            (_, existing) =>
            {
                var msgs = existing.Messages;
                // Guard against concurrent mutation with a simple lock on the list
                lock (msgs)
                {
                    msgs.Add(userMsg);
                    msgs.Add(assistantMsg);
                    // Trim oldest messages to keep memory bounded
                    while (msgs.Count > MaxMessagesPerSession)
                        msgs.RemoveAt(0);
                }
                return new SessionData(msgs, DateTime.UtcNow);
            });
    }

    public void ClearSession(string sessionId) =>
        _sessions.TryRemove(sessionId, out _);

    private void EvictExpiredSessions()
    {
        var cutoff = DateTime.UtcNow - SessionTtl;
        foreach (var (key, val) in _sessions)
        {
            if (val.LastAccessed < cutoff)
                _sessions.TryRemove(key, out _);
        }
    }
}
