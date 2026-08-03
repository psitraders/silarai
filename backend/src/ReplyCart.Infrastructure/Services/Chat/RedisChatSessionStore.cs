using Microsoft.Extensions.Options;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Configuration;
using StackExchange.Redis;

namespace ReplyCart.Infrastructure.Services.Chat;

/// <summary>
/// Redis-backed chat session state (Azure Managed Redis).
///
/// Layout, all under {prefix}:{clientId}:{sessionId}: —
///   :msgs     LIST   one JSON message per element, RPUSH + LTRIM to the retention cap
///   :cart     STRING the server-authoritative cart as JSON
///   :profile  HASH   collected fields; patched field-by-field so concurrent turns
///                    cannot clobber each other the way a whole-blob rewrite would
///
/// All three keys carry a sliding TTL that is refreshed on read and on write, so an
/// active buyer never expires mid-order.
///
/// This class does NOT swallow exceptions — ResilientChatSessionStore owns the
/// failure policy and needs to see them to trip its circuit breaker.
/// </summary>
public sealed class RedisChatSessionStore(
    IConnectionMultiplexer  multiplexer,
    IOptions<RedisOptions>  options) : IChatSessionStore
{
    private readonly RedisOptions _opt = options.Value;

    private TimeSpan Ttl     => TimeSpan.FromHours(Math.Max(1, _opt.SessionTtlHours));
    private TimeSpan Budget  => TimeSpan.FromMilliseconds(Math.Max(50, _opt.TimeoutMs));
    private IDatabase Db     => multiplexer.GetDatabase();

    private string Root(ChatSessionKey k) => $"{_opt.KeyPrefix}:{k.ClientId:N}:{k.SessionId}";
    private RedisKey MsgsKey(ChatSessionKey k)    => $"{Root(k)}:msgs";
    private RedisKey CartKey(ChatSessionKey k)    => $"{Root(k)}:cart";
    private RedisKey ProfileKey(ChatSessionKey k) => $"{Root(k)}:profile";

    public async Task<ChatSessionSnapshot> GetAsync(ChatSessionKey key, CancellationToken ct = default)
    {
        var db    = Db;
        var batch = db.CreateBatch();

        var msgsTask    = batch.ListRangeAsync(MsgsKey(key), -_opt.MaxMessages, -1);
        var cartTask    = batch.StringGetAsync(CartKey(key));
        var profileTask = batch.HashGetAllAsync(ProfileKey(key));

        batch.Execute();

        await Task.WhenAll(msgsTask, cartTask, profileTask).WaitAsync(Budget, ct);

        var history = msgsTask.Result
            .Select(v => ChatSessionPayloads.DeserializeMessage(v))
            .Where(m => m != null)
            .Select(m => m!)
            .ToList();

        var snapshot = new ChatSessionSnapshot(
            history,
            ChatSessionPayloads.DeserializeCart(cartTask.Result),
            ReadProfile(profileTask.Result));

        // Sliding expiry — best effort, never blocks the turn.
        RefreshTtl(db, key);

        return snapshot;
    }

    public async Task AppendMessagesAsync(
        ChatSessionKey key, ConversationMessage userMsg, ConversationMessage assistantMsg, CancellationToken ct = default)
    {
        var msgs  = MsgsKey(key);
        var batch = Db.CreateBatch();

        var push = batch.ListRightPushAsync(msgs, new RedisValue[]
        {
            ChatSessionPayloads.SerializeMessage(userMsg),
            ChatSessionPayloads.SerializeMessage(assistantMsg),
        });
        var trim   = batch.ListTrimAsync(msgs, -_opt.MaxMessages, -1);
        var expire = batch.KeyExpireAsync(msgs, Ttl);

        batch.Execute();
        await Task.WhenAll(push, trim, expire).WaitAsync(Budget, ct);
    }

    public async Task SetCartAsync(ChatSessionKey key, ChatCart cart, CancellationToken ct = default)
    {
        await Db.StringSetAsync(CartKey(key), ChatSessionPayloads.SerializeCart(cart), Ttl)
                .WaitAsync(Budget, ct);
    }

    public async Task PatchProfileAsync(ChatSessionKey key, ChatProfilePatch patch, CancellationToken ct = default)
    {
        var entries = new List<HashEntry>(7);

        if (patch.Name          != null) entries.Add(new(ChatSessionPayloads.FName,    patch.Name));
        if (patch.Phone         != null) entries.Add(new(ChatSessionPayloads.FPhone,   patch.Phone));
        if (patch.Address       != null) entries.Add(new(ChatSessionPayloads.FAddress, patch.Address));
        if (patch.State         != null) entries.Add(new(ChatSessionPayloads.FState,   patch.State));
        if (patch.PaymentMethod != null) entries.Add(new(ChatSessionPayloads.FPayment, patch.PaymentMethod));
        if (patch.FocusedProductId.HasValue)
            entries.Add(new(ChatSessionPayloads.FFocused, patch.FocusedProductId.Value.ToString("N")));
        if (patch.LastShownProductIds != null)
            entries.Add(new(ChatSessionPayloads.FShown, ChatSessionPayloads.SerializeShown(patch.LastShownProductIds)));

        if (entries.Count == 0) return;

        var profile = ProfileKey(key);
        var batch   = Db.CreateBatch();

        var set    = batch.HashSetAsync(profile, entries.ToArray());
        var expire = batch.KeyExpireAsync(profile, Ttl);

        batch.Execute();
        await Task.WhenAll(set, expire).WaitAsync(Budget, ct);
    }

    public async Task ClearAsync(ChatSessionKey key, CancellationToken ct = default)
    {
        await Db.KeyDeleteAsync(new[] { MsgsKey(key), CartKey(key), ProfileKey(key) })
                .WaitAsync(Budget, ct);
    }

    // ──────────────────────────────────────────────────────────────────────────
    private void RefreshTtl(IDatabase db, ChatSessionKey key)
    {
        var ttl = Ttl;
        db.KeyExpire(MsgsKey(key),    ttl, CommandFlags.FireAndForget);
        db.KeyExpire(CartKey(key),    ttl, CommandFlags.FireAndForget);
        db.KeyExpire(ProfileKey(key), ttl, CommandFlags.FireAndForget);
    }

    private static ChatProfile ReadProfile(HashEntry[] entries)
    {
        if (entries.Length == 0) return ChatProfile.Empty;

        var map = entries.ToDictionary(e => e.Name.ToString(), e => e.Value.ToString());

        string? Get(string field) =>
            map.TryGetValue(field, out var v) && !string.IsNullOrEmpty(v) ? v : null;

        Guid? focused = Guid.TryParse(Get(ChatSessionPayloads.FFocused), out var f) ? f : null;

        return new ChatProfile(
            Get(ChatSessionPayloads.FName),
            Get(ChatSessionPayloads.FPhone),
            Get(ChatSessionPayloads.FAddress),
            Get(ChatSessionPayloads.FState),
            Get(ChatSessionPayloads.FPayment),
            focused,
            ChatSessionPayloads.DeserializeShown(Get(ChatSessionPayloads.FShown)));
    }
}
