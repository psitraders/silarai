using System.Collections.Concurrent;
using Microsoft.Extensions.Options;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Configuration;

namespace ReplyCart.Infrastructure.Services.Chat;

/// <summary>
/// Per-process fallback tier for <see cref="IChatSessionStore"/>.
///
/// Written to on every turn alongside Redis, so that if Redis later becomes
/// unreachable the conversation continues from a warm local copy rather than
/// restarting from nothing.
///
/// Unlike the older ConversationMemoryService this does NOT scan the whole
/// dictionary on every read — expiry is swept on a timer instead.
/// </summary>
public sealed class InMemoryChatSessionStore : IChatSessionStore, IDisposable
{
    private sealed class Entry
    {
        public readonly List<ConversationMessage> Messages = [];
        public ChatCart    Cart         = ChatCart.Empty;
        public ChatProfile Profile      = ChatProfile.Empty;
        public DateTime    LastAccessed = DateTime.UtcNow;
    }

    private readonly ConcurrentDictionary<string, Entry> _sessions = new();
    private readonly RedisOptions _opt;
    private readonly Timer _sweeper;

    public InMemoryChatSessionStore(IOptions<RedisOptions> options)
    {
        _opt = options.Value;
        var period = TimeSpan.FromMinutes(5);
        _sweeper = new Timer(_ => Sweep(), null, period, period);
    }

    private TimeSpan Ttl => TimeSpan.FromHours(Math.Max(1, _opt.SessionTtlHours));

    private static string Id(ChatSessionKey k) => $"{k.ClientId:N}:{k.SessionId}";

    public Task<ChatSessionSnapshot> GetAsync(ChatSessionKey key, CancellationToken ct = default)
    {
        if (!_sessions.TryGetValue(Id(key), out var entry))
            return Task.FromResult(ChatSessionSnapshot.Empty);

        lock (entry)
        {
            entry.LastAccessed = DateTime.UtcNow;
            return Task.FromResult(new ChatSessionSnapshot(
                entry.Messages.ToList(), entry.Cart, entry.Profile));
        }
    }

    public Task AppendMessagesAsync(
        ChatSessionKey key, ConversationMessage userMsg, ConversationMessage assistantMsg, CancellationToken ct = default)
    {
        var entry = _sessions.GetOrAdd(Id(key), _ => new Entry());

        lock (entry)
        {
            entry.Messages.Add(userMsg);
            entry.Messages.Add(assistantMsg);
            while (entry.Messages.Count > _opt.MaxMessages)
                entry.Messages.RemoveAt(0);
            entry.LastAccessed = DateTime.UtcNow;
        }

        return Task.CompletedTask;
    }

    public Task SetCartAsync(ChatSessionKey key, ChatCart cart, CancellationToken ct = default)
    {
        var entry = _sessions.GetOrAdd(Id(key), _ => new Entry());
        lock (entry)
        {
            entry.Cart = cart;
            entry.LastAccessed = DateTime.UtcNow;
        }
        return Task.CompletedTask;
    }

    public Task PatchProfileAsync(ChatSessionKey key, ChatProfilePatch patch, CancellationToken ct = default)
    {
        var entry = _sessions.GetOrAdd(Id(key), _ => new Entry());
        lock (entry)
        {
            var p = entry.Profile;
            entry.Profile = new ChatProfile(
                patch.Name                ?? p.Name,
                patch.Phone               ?? p.Phone,
                patch.Address             ?? p.Address,
                patch.State               ?? p.State,
                patch.PaymentMethod       ?? p.PaymentMethod,
                patch.FocusedProductId    ?? p.FocusedProductId,
                patch.LastShownProductIds ?? p.LastShownProductIds);
            entry.LastAccessed = DateTime.UtcNow;
        }
        return Task.CompletedTask;
    }

    public Task ClearAsync(ChatSessionKey key, CancellationToken ct = default)
    {
        _sessions.TryRemove(Id(key), out _);
        return Task.CompletedTask;
    }

    /// <summary>Warms this tier from the SQL archive after a Redis outage cold-miss.</summary>
    public void Seed(ChatSessionKey key, ChatSessionSnapshot snapshot)
    {
        var entry = _sessions.GetOrAdd(Id(key), _ => new Entry());
        lock (entry)
        {
            entry.Messages.Clear();
            entry.Messages.AddRange(snapshot.History);
            while (entry.Messages.Count > _opt.MaxMessages)
                entry.Messages.RemoveAt(0);
            entry.Cart         = snapshot.Cart;
            entry.Profile      = snapshot.Profile;
            entry.LastAccessed = DateTime.UtcNow;
        }
    }

    private void Sweep()
    {
        var cutoff = DateTime.UtcNow - Ttl;
        foreach (var (id, entry) in _sessions)
            if (entry.LastAccessed < cutoff)
                _sessions.TryRemove(id, out _);
    }

    public void Dispose() => _sweeper.Dispose();
}
