using System.Threading.Channels;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Chatbot;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Infrastructure.Services.Chat;

/// <summary>
/// Durable (SQL) tier behind the chat session store.
///
/// Writes are queued onto a bounded channel and drained by
/// <see cref="ChatSessionArchiveWorker"/>, so persisting a transcript never adds
/// latency to a chat turn and a DB hiccup can never fail a buyer's message. If the
/// queue is full the oldest pending job is dropped — losing an archived transcript
/// is strictly preferable to blocking or crashing the chat path.
///
/// Reads happen only when Redis is unavailable AND this instance has no local copy.
/// </summary>
public sealed class SqlChatSessionArchive : IChatSessionArchive
{
    internal abstract record ArchiveJob(ChatSessionKey Key);
    internal sealed record MessagesJob(ChatSessionKey Key, ConversationMessage User, ConversationMessage Assistant) : ArchiveJob(Key);
    internal sealed record StateJob(ChatSessionKey Key, ChatCart? Cart, ChatProfile? Profile) : ArchiveJob(Key);

    private const int QueueCapacity = 5_000;

    private readonly Channel<ArchiveJob> _queue = Channel.CreateBounded<ArchiveJob>(
        new BoundedChannelOptions(QueueCapacity)
        {
            FullMode     = BoundedChannelFullMode.DropOldest,
            SingleReader = true,
        });

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SqlChatSessionArchive> _logger;

    public SqlChatSessionArchive(IServiceScopeFactory scopeFactory, ILogger<SqlChatSessionArchive> logger)
    {
        _scopeFactory = scopeFactory;
        _logger       = logger;
    }

    internal ChannelReader<ArchiveJob> Reader => _queue.Reader;

    // ── Queue (never throws, never blocks) ────────────────────────────────────
    public void QueueMessages(ChatSessionKey key, ConversationMessage userMsg, ConversationMessage assistantMsg)
    {
        if (!_queue.Writer.TryWrite(new MessagesJob(key, userMsg, assistantMsg)))
            _logger.LogWarning("Chat archive queue full — dropped transcript for {Client}/{Session}.",
                key.ClientId, key.SessionId);
    }

    public void QueueState(ChatSessionKey key, ChatCart? cart, ChatProfile? profile)
    {
        if (cart == null && profile == null) return;
        _queue.Writer.TryWrite(new StateJob(key, cart, profile));
    }

    // ── Rehydrate ─────────────────────────────────────────────────────────────
    public async Task<ChatSessionSnapshot?> LoadAsync(ChatSessionKey key, CancellationToken ct = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var session = await db.ChatbotSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.ClientId == key.ClientId && s.SessionId == key.SessionId, ct);

        if (session == null) return null;

        var messages = await db.ChatbotSessionMessages
            .AsNoTracking()
            .Where(m => m.SessionRowId == session.Id)
            .OrderByDescending(m => m.Seq)
            .Take(40)
            .ToListAsync(ct);

        messages.Reverse();   // back to chronological order

        var profile = new ChatProfile(
            session.CustomerName,
            session.CustomerPhone,
            session.DeliveryAddress,
            session.State,
            session.PaymentMethod);

        return new ChatSessionSnapshot(
            messages.Select(m => new ConversationMessage(m.Role, m.Content)).ToList(),
            ChatSessionPayloads.DeserializeCart(session.CartJson),
            profile);
    }

    // ── Drain (called by the background worker) ───────────────────────────────
    internal async Task PersistAsync(ArchiveJob job, AppDbContext db, CancellationToken ct)
    {
        var key = job.Key;

        var session = await db.ChatbotSessions
            .FirstOrDefaultAsync(s => s.ClientId == key.ClientId && s.SessionId == key.SessionId, ct);

        if (session == null)
        {
            session = new ChatbotSession
            {
                Id        = Guid.NewGuid(),
                ClientId  = key.ClientId,
                SessionId = key.SessionId,
                Channel   = key.Channel,
                CreatedAt = DateTime.UtcNow,
            };
            db.ChatbotSessions.Add(session);
        }

        switch (job)
        {
            case MessagesJob m:
                session.Messages.Add(new ChatbotSessionMessage
                {
                    Id = Guid.NewGuid(), SessionRowId = session.Id,
                    Role = m.User.Role, Content = Truncate(m.User.Content), Seq = ++session.MessageSeq,
                    CreatedAt = DateTime.UtcNow,
                });
                session.Messages.Add(new ChatbotSessionMessage
                {
                    Id = Guid.NewGuid(), SessionRowId = session.Id,
                    Role = m.Assistant.Role, Content = Truncate(m.Assistant.Content), Seq = ++session.MessageSeq,
                    CreatedAt = DateTime.UtcNow,
                });
                session.LastMessageAt = DateTime.UtcNow;
                break;

            case StateJob s:
                if (s.Cart != null)
                    session.CartJson = ChatSessionPayloads.SerializeCart(s.Cart);
                if (s.Profile != null)
                {
                    session.CustomerName    = s.Profile.Name          ?? session.CustomerName;
                    session.CustomerPhone   = s.Profile.Phone         ?? session.CustomerPhone;
                    session.DeliveryAddress = s.Profile.Address       ?? session.DeliveryAddress;
                    session.PaymentMethod   = s.Profile.PaymentMethod ?? session.PaymentMethod;
                    session.State           = s.Profile.State         ?? session.State;
                }
                break;
        }

        session.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    private static string Truncate(string content) =>
        content.Length <= 4000 ? content : content[..4000];
}
