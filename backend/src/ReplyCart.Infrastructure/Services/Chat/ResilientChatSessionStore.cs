using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Configuration;

namespace ReplyCart.Infrastructure.Services.Chat;

/// <summary>
/// The <see cref="IChatSessionStore"/> that actually gets injected.
///
/// Read path:   Redis → in-process → SQL archive (rehydrate + warm in-process).
/// Write path:  Redis (best effort) AND in-process (always) AND SQL archive (queued).
///
/// Writing to the in-process tier even while Redis is healthy is deliberate: it means
/// a Redis outage mid-conversation degrades to "this instance still remembers you"
/// rather than "the bot forgot everything". The SQL archive is the backstop for the
/// case where the outage coincides with the request landing on a cold instance.
///
/// A simple circuit breaker stops every turn paying the Redis timeout while Redis
/// is down; it half-opens automatically after CircuitOpenSeconds.
/// </summary>
public sealed class ResilientChatSessionStore(
    InMemoryChatSessionStore              memory,
    IChatSessionArchive                   archive,
    IOptions<RedisOptions>                options,
    ILogger<ResilientChatSessionStore>    logger,
    RedisChatSessionStore?                redis = null) : IChatSessionStore
{
    private readonly RedisOptions _opt = options.Value;

    private int  _consecutiveFailures;
    private long _circuitOpenUntilTicks;

    private bool RedisAvailable =>
        redis != null && Interlocked.Read(ref _circuitOpenUntilTicks) < DateTime.UtcNow.Ticks;

    // ── Read ──────────────────────────────────────────────────────────────────
    public async Task<ChatSessionSnapshot> GetAsync(ChatSessionKey key, CancellationToken ct = default)
    {
        if (RedisAvailable)
        {
            try
            {
                var snapshot = await redis!.GetAsync(key, ct);
                OnSuccess();
                return snapshot;
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                throw;   // the caller went away — not a Redis fault
            }
            catch (Exception ex)
            {
                OnFailure(ex, nameof(GetAsync));
            }
        }

        // ── Degraded ──────────────────────────────────────────────────────────
        var local = await memory.GetAsync(key, ct);
        if (local.History.Count > 0 || !local.Cart.IsEmpty) return local;

        // Cold instance during a Redis outage — rebuild from SQL.
        try
        {
            var restored = await archive.LoadAsync(key, ct);
            if (restored != null)
            {
                memory.Seed(key, restored);
                logger.LogInformation(
                    "Chat session {Client}/{Session} rehydrated from SQL ({Count} messages) — Redis unavailable.",
                    key.ClientId, key.SessionId, restored.History.Count);
                return restored;
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Chat session rehydrate from SQL failed for {Client}/{Session}.",
                key.ClientId, key.SessionId);
        }

        return local;
    }

    // ── Writes ────────────────────────────────────────────────────────────────
    public async Task AppendMessagesAsync(
        ChatSessionKey key, ConversationMessage userMsg, ConversationMessage assistantMsg, CancellationToken ct = default)
    {
        await memory.AppendMessagesAsync(key, userMsg, assistantMsg, ct);
        archive.QueueMessages(key, userMsg, assistantMsg);
        await TryRedis(r => r.AppendMessagesAsync(key, userMsg, assistantMsg, ct), nameof(AppendMessagesAsync));
    }

    public async Task SetCartAsync(ChatSessionKey key, ChatCart cart, CancellationToken ct = default)
    {
        await memory.SetCartAsync(key, cart, ct);
        archive.QueueState(key, cart, null);
        await TryRedis(r => r.SetCartAsync(key, cart, ct), nameof(SetCartAsync));
    }

    public async Task PatchProfileAsync(ChatSessionKey key, ChatProfilePatch patch, CancellationToken ct = default)
    {
        await memory.PatchProfileAsync(key, patch, ct);

        // The archive stores whole state, so hand it the merged profile.
        var merged = (await memory.GetAsync(key, ct)).Profile;
        archive.QueueState(key, null, merged);

        await TryRedis(r => r.PatchProfileAsync(key, patch, ct), nameof(PatchProfileAsync));
    }

    public async Task ClearAsync(ChatSessionKey key, CancellationToken ct = default)
    {
        await memory.ClearAsync(key, ct);
        await TryRedis(r => r.ClearAsync(key, ct), nameof(ClearAsync));
    }

    // ── Circuit breaker ───────────────────────────────────────────────────────
    private async Task TryRedis(Func<RedisChatSessionStore, Task> action, string op)
    {
        if (!RedisAvailable) return;

        try
        {
            await action(redis!);
            OnSuccess();
        }
        catch (Exception ex)
        {
            OnFailure(ex, op);
        }
    }

    private void OnSuccess() => Interlocked.Exchange(ref _consecutiveFailures, 0);

    private void OnFailure(Exception ex, string op)
    {
        var failures = Interlocked.Increment(ref _consecutiveFailures);

        if (failures < _opt.CircuitFailureThreshold)
        {
            logger.LogWarning(ex, "Redis chat store {Op} failed ({Failures}/{Threshold}).",
                op, failures, _opt.CircuitFailureThreshold);
            return;
        }

        var openUntil = DateTime.UtcNow.AddSeconds(_opt.CircuitOpenSeconds).Ticks;
        Interlocked.Exchange(ref _circuitOpenUntilTicks, openUntil);
        Interlocked.Exchange(ref _consecutiveFailures, 0);

        logger.LogError(ex,
            "Redis chat store circuit OPEN for {Seconds}s after {Failures} consecutive failures on {Op}. " +
            "Chat sessions are degraded to in-process memory with SQL rehydrate.",
            _opt.CircuitOpenSeconds, _opt.CircuitFailureThreshold, op);
    }
}
