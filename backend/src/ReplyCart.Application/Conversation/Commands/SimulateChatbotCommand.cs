using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Rag;
using ReplyCart.Domain.Conversation;
using System.Text.Json;

namespace ReplyCart.Application.Conversation.Commands;

/// <summary>
/// Runs the full AI chatbot pipeline for the simulator — same RAG context,
/// same AI model, same session state machine — but:
///   • Always runs regardless of AutoReplyEnabled setting
///   • Never sends a real message to WhatsApp / Facebook / Instagram
///   • Stores conversation under a synthetic sender id "sim:{tenantId}"
///     so it doesn't pollute real CRM data
/// </summary>
public record SimulateChatbotCommand(
    string MessageText,
    string Channel,    // "WhatsApp" | "Facebook" | "Instagram"
    string SenderName
) : IRequest<SimulateChatbotResult>;

public record SimulateChatbotResult(
    string Reply,
    string SessionState,
    bool IsNewSession
);

public class SimulateChatbotCommandHandler(
    IAppDbContext      db,
    ITenantContext     tenantContext,
    IAiProvider        aiProvider,
    RagContextBuilder  ragBuilder)
    : IRequestHandler<SimulateChatbotCommand, SimulateChatbotResult>
{
    public async Task<SimulateChatbotResult> Handle(
        SimulateChatbotCommand request, CancellationToken ct)
    {
        var tenantId   = tenantContext.CurrentTenantId;
        var senderId   = $"sim:{tenantId:N}";   // synthetic, never real
        var channel    = NormaliseChannel(request.Channel);
        var isNew      = false;

        // ── Get or create simulator conversation session ───────────────────────
        var session = await db.ConversationSessions
            .FirstOrDefaultAsync(s =>
                s.TenantId           == tenantId
                && s.ExternalCustomerId == senderId
                && s.Channel            == channel
                && s.IsActive, ct);

        if (session == null)
        {
            isNew   = true;
            session = new ConversationSession
            {
                Id                 = Guid.NewGuid(),
                TenantId           = tenantId,
                ExternalCustomerId = senderId,
                Channel            = channel,
                State              = ConversationState.Greeting,
                CollectedName      = request.SenderName,
                LastMessageAt      = DateTime.UtcNow,
                IsActive           = true,
                CartJson           = "[]",
                MessagesJson       = "[]",
            };
            db.ConversationSessions.Add(session);
        }

        session.LastMessageAt = DateTime.UtcNow;
        session.MessageCount++;

        // ── Build RAG context ─────────────────────────────────────────────────
        var ragContext   = await ragBuilder.BuildAsync(tenantId, request.MessageText, session, ct);
        var systemPrompt = ConversationSystemPromptBuilder.Build(ragContext);

        var history = ragContext.ConversationHistory
            .TakeLast(20)
            .Select(m => new ConversationMessage(m.Role, m.Content))
            .ToList();

        // ── Call AI ───────────────────────────────────────────────────────────
        string replyText;
        string? stateSignal;

        try
        {
            var aiReply  = await aiProvider.HandleConversationAsync(
                new ConversationRequest(systemPrompt, history, request.MessageText), ct);
            replyText    = aiReply.ReplyText;
            stateSignal  = aiReply.StateSignal;
        }
        catch (Exception ex)
        {
            replyText   = $"⚠️ AI call failed: {ex.Message}. Check your AI provider settings.";
            stateSignal = null;
        }

        // ── Update session state ──────────────────────────────────────────────
        if (stateSignal != null)
        {
            session.State = stateSignal switch
            {
                "greeting"        => ConversationState.Greeting,
                "discovery"       => ConversationState.Discovery,
                "interested"      => ConversationState.Interested,
                "collecting_info" => ConversationState.CollectingInfo,
                "confirming"      => ConversationState.Confirming,
                "ordered"         => ConversationState.Ordered,
                "escalate"        => ConversationState.Closed,
                _                 => session.State,
            };
        }

        // ── Persist updated history ───────────────────────────────────────────
        var updated = history.ToList();
        updated.Add(new ConversationMessage("user",      request.MessageText));
        updated.Add(new ConversationMessage("assistant", replyText));
        if (updated.Count > 30) updated = updated[^30..];
        session.MessagesJson = JsonSerializer.Serialize(updated);

        await db.SaveChangesAsync(ct);

        return new SimulateChatbotResult(
            Reply:        replyText,
            SessionState: session.State.ToString(),
            IsNewSession: isNew);
    }

    private static string NormaliseChannel(string ch) => ch.Trim() switch
    {
        var s when s.Equals("facebook",  StringComparison.OrdinalIgnoreCase) => "Facebook",
        var s when s.Equals("instagram", StringComparison.OrdinalIgnoreCase) => "Instagram",
        _ => "WhatsApp",
    };
}

/// <summary>Resets (closes) the simulator session so the next message starts fresh.</summary>
public record ResetSimulatorSessionCommand : IRequest;

public class ResetSimulatorSessionCommandHandler(
    IAppDbContext  db,
    ITenantContext tenantContext)
    : IRequestHandler<ResetSimulatorSessionCommand>
{
    public async Task Handle(ResetSimulatorSessionCommand request, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var senderId = $"sim:{tenantId:N}";

        var sessions = await db.ConversationSessions
            .Where(s => s.TenantId == tenantId && s.ExternalCustomerId == senderId)
            .ToListAsync(ct);

        foreach (var s in sessions)
            s.IsActive = false;

        await db.SaveChangesAsync(ct);
    }
}
