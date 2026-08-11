using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReplyCart.Application.Chatbot;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Configuration;
using ReplyCart.Infrastructure.Persistence;
using StackExchange.Redis;
using System.Text.Json;

namespace ReplyCart.Infrastructure.Services.Chat;

/// <summary>
/// Caches the per-client catalogue and the pre-chunked knowledge base.
///
/// Before this existed, every single chat turn re-read the client's entire product
/// list AND every uploaded document's full extracted text out of SQL, then re-sliced
/// that text into 600-char chunks in memory — all to build one prompt.
///
/// Two tiers: Redis (shared across instances) with IMemoryCache in front of it, so a
/// hot client costs zero network round-trips. Falls back to IMemoryCache alone when
/// Redis is disabled or unreachable.
/// </summary>
public sealed class ChatbotContextCache(
    IServiceScopeFactory            scopeFactory,
    IMemoryCache                    local,
    IOptions<RedisOptions>          options,
    ILogger<ChatbotContextCache>    logger,
    IConnectionMultiplexer?         multiplexer = null) : IChatbotContextCache
{
    private readonly RedisOptions _opt = options.Value;

    private string CatalogKey(Guid clientId)   => $"{_opt.KeyPrefix}:catalog:{clientId:N}";
    private string KnowledgeKey(Guid clientId) => $"{_opt.KeyPrefix}:kb:{clientId:N}";

    private TimeSpan Ttl     => TimeSpan.FromSeconds(Math.Max(30, _opt.CatalogCacheSeconds));
    private TimeSpan Budget  => TimeSpan.FromMilliseconds(Math.Max(50, _opt.TimeoutMs));

    // ── Catalogue ─────────────────────────────────────────────────────────────
    public Task<IReadOnlyList<ChatbotCatalogItem>> GetCatalogAsync(Guid clientId, CancellationToken ct = default) =>
        GetOrLoadAsync(
            CatalogKey(clientId),
            () => LoadCatalogAsync(clientId, ct),
            ct);

    private async Task<IReadOnlyList<ChatbotCatalogItem>> LoadCatalogAsync(Guid clientId, CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var rows = await db.ChatbotProducts
            .AsNoTracking()
            .Where(p => p.ClientId == clientId && p.IsAvailable)
            .OrderBy(p => p.Category).ThenBy(p => p.Title)
            .Select(p => new ChatbotCatalogItem(
                p.Id, p.Title, p.Description, p.Price, p.SalePrice, p.Variants, p.ImageUrl, p.Category))
            .ToListAsync(ct);

        return rows;
    }

    // ── Knowledge base ────────────────────────────────────────────────────────
    public Task<IReadOnlyList<ChatbotKnowledgeChunk>> GetKnowledgeAsync(Guid clientId, CancellationToken ct = default) =>
        GetOrLoadAsync(
            KnowledgeKey(clientId),
            () => LoadKnowledgeAsync(clientId, ct),
            ct);

    private async Task<IReadOnlyList<ChatbotKnowledgeChunk>> LoadKnowledgeAsync(Guid clientId, CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var docs = await db.ChatbotDocuments
            .AsNoTracking()
            .Where(d => d.ClientId == clientId)
            .Select(d => new { d.FileName, d.ExtractedText })
            .ToListAsync(ct);

        // Chunk once, here — not on every chat turn.
        return docs
            .SelectMany(d => ChatbotKnowledgeSelector.Chunk(d.FileName, d.ExtractedText))
            .ToList();
    }

    // ── Invalidation ──────────────────────────────────────────────────────────
    public async Task InvalidateAsync(Guid clientId, CancellationToken ct = default)
    {
        local.Remove(CatalogKey(clientId));
        local.Remove(KnowledgeKey(clientId));

        if (multiplexer == null) return;

        try
        {
            await multiplexer.GetDatabase()
                .KeyDeleteAsync(new RedisKey[] { CatalogKey(clientId), KnowledgeKey(clientId) })
                .WaitAsync(Budget, ct);
        }
        catch (Exception ex)
        {
            // Not fatal — the short TTL will clear it shortly.
            logger.LogWarning(ex, "Failed to invalidate chatbot context cache for client {ClientId}.", clientId);
        }
    }

    // ── Shared two-tier read-through ──────────────────────────────────────────
    private async Task<IReadOnlyList<T>> GetOrLoadAsync<T>(
        string key, Func<Task<IReadOnlyList<T>>> loader, CancellationToken ct)
    {
        if (local.TryGetValue<IReadOnlyList<T>>(key, out var cached) && cached != null)
            return cached;

        var fromRedis = await TryReadRedisAsync<T>(key, ct);
        if (fromRedis != null)
        {
            local.Set(key, fromRedis, LocalTtl());
            return fromRedis;
        }

        var fresh = await loader();

        local.Set(key, fresh, LocalTtl());
        await TryWriteRedisAsync(key, fresh, ct);

        return fresh;
    }

    // Local tier is deliberately shorter than Redis so an invalidation on another
    // instance is picked up within seconds even if its Redis delete was missed.
    private TimeSpan LocalTtl() => TimeSpan.FromSeconds(Math.Min(30, _opt.CatalogCacheSeconds));

    private async Task<IReadOnlyList<T>?> TryReadRedisAsync<T>(string key, CancellationToken ct)
    {
        if (multiplexer == null) return null;

        try
        {
            var raw = await multiplexer.GetDatabase().StringGetAsync(key).WaitAsync(Budget, ct);
            if (raw.IsNullOrEmpty) return null;
            return JsonSerializer.Deserialize<List<T>>(raw.ToString(), ChatSessionPayloads.Json);
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Chatbot context cache Redis read failed for {Key}.", key);
            return null;
        }
    }

    private async Task TryWriteRedisAsync<T>(string key, IReadOnlyList<T> value, CancellationToken ct)
    {
        if (multiplexer == null) return;

        try
        {
            var json = JsonSerializer.Serialize(value, ChatSessionPayloads.Json);
            await multiplexer.GetDatabase().StringSetAsync(key, json, Ttl).WaitAsync(Budget, ct);
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Chatbot context cache Redis write failed for {Key}.", key);
        }
    }
}
