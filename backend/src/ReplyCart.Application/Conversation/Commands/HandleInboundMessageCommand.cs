using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Rag;
using ReplyCart.Domain.Conversation;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Leads;
using System.Text.Json;

namespace ReplyCart.Application.Conversation.Commands;

/// <summary>
/// Processes an inbound message from any channel (WhatsApp / Facebook / Instagram).
/// When the business has AutoReplyEnabled, this command:
/// 1. Gets or creates a <see cref="ConversationSession"/> for the sender.
/// 2. Builds a RAG context (products + store info + customer history).
/// 3. Calls the AI provider for an autonomous reply.
/// 4. Sends the reply back via the appropriate channel service.
/// 5. Updates the session state and persists everything.
/// Always creates / updates a Lead for CRM tracking — regardless of AI toggle.
/// </summary>
public record HandleInboundMessageCommand(
    Guid TenantId,
    string Channel,           // "WhatsApp" | "Facebook" | "Instagram"
    string ExternalSenderId,  // phone (WA) or page-scoped ID (FB/IG)
    string SenderName,
    string MessageText,
    string MessageId          // for idempotency
) : IRequest<HandleInboundMessageResult>;

public record HandleInboundMessageResult(
    Guid LeadId,
    Guid SessionId,
    bool AutoReplySent,
    string? ReplySent);

public class HandleInboundMessageHandler(
    IAppDbContext db,
    IAiProvider aiProvider,
    RagContextBuilder ragBuilder,
    IWhatsAppService whatsApp,
    IFacebookService facebook,
    IInstagramService instagram)
    : IRequestHandler<HandleInboundMessageCommand, HandleInboundMessageResult>
{
    public async Task<HandleInboundMessageResult> Handle(
        HandleInboundMessageCommand request,
        CancellationToken ct)
    {
        // ── Idempotency guard ─────────────────────────────────────────────────
        var alreadyProcessed = await db.LeadActivities
            .AnyAsync(a => a.TenantId == request.TenantId
                        && a.Description.Contains(request.MessageId), ct);
        if (alreadyProcessed)
        {
            var fallbackLead = await db.Leads
                .Where(l => l.TenantId == request.TenantId && l.CustomerPhone == request.ExternalSenderId)
                .Select(l => new { l.Id })
                .FirstOrDefaultAsync(ct);
            return new HandleInboundMessageResult(fallbackLead?.Id ?? Guid.Empty, Guid.Empty, false, null);
        }

        // ── Load business settings ────────────────────────────────────────────
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == request.TenantId, ct);

        // ── Get or create lead (always, for CRM) ──────────────────────────────
        var channel = Enum.TryParse<SocialPlatform>(request.Channel, true, out var parsed)
            ? parsed
            : SocialPlatform.WhatsApp;

        var lead = await db.Leads
            .Where(l => l.TenantId == request.TenantId
                     && l.CustomerPhone == request.ExternalSenderId
                     && !l.IsDeleted)
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (lead == null)
        {
            lead = new Lead
            {
                Id              = Guid.NewGuid(),
                TenantId        = request.TenantId,
                CustomerName    = request.SenderName,
                CustomerPhone   = request.ExternalSenderId,
                SourceChannel   = channel,
                InquiryNote     = request.MessageText,
                Status          = LeadStatus.NewInquiry,
                Priority        = 1,
                LastActivityDate = DateTime.UtcNow,
                CreatedAt       = DateTime.UtcNow
            };
            db.Leads.Add(lead);
        }
        else
        {
            lead.LastActivityDate = DateTime.UtcNow;
        }

        db.LeadActivities.Add(new LeadActivity
        {
            Id           = Guid.NewGuid(),
            TenantId     = request.TenantId,
            LeadId       = lead.Id,
            ActivityType = $"{request.Channel}Message",
            Description  = $"[msgid:{request.MessageId}] {request.MessageText}",
            PerformedBy  = null,
            CreatedAt    = DateTime.UtcNow
        });

        // ── Early exit if auto-reply is off ───────────────────────────────────
        if (business?.AutoReplyEnabled != true)
        {
            await db.SaveChangesAsync(ct);
            return new HandleInboundMessageResult(lead.Id, Guid.Empty, false, null);
        }

        // ── Get or create conversation session ────────────────────────────────
        var session = await db.ConversationSessions
            .FirstOrDefaultAsync(s =>
                s.TenantId == request.TenantId
                && s.ExternalCustomerId == request.ExternalSenderId
                && s.Channel == request.Channel
                && s.IsActive, ct);

        if (session == null)
        {
            session = new ConversationSession
            {
                Id                 = Guid.NewGuid(),
                TenantId           = request.TenantId,
                ExternalCustomerId = request.ExternalSenderId,
                Channel            = request.Channel,
                State              = ConversationState.Greeting,
                LastMessageAt      = DateTime.UtcNow,
                IsActive           = true,
                LeadId             = lead.Id,
                CartJson           = "[]",
                MessagesJson       = "[]"
            };
            db.ConversationSessions.Add(session);
        }

        session.LastMessageAt = DateTime.UtcNow;
        session.MessageCount++;

        // Update collected info from sender name if not yet known
        if (string.IsNullOrWhiteSpace(session.CollectedName) && !string.IsNullOrWhiteSpace(request.SenderName))
            session.CollectedName = request.SenderName;

        // ── Build RAG context and system prompt ───────────────────────────────
        var ragContext    = await ragBuilder.BuildAsync(request.TenantId, request.MessageText, session, ct);
        var systemPrompt  = ConversationSystemPromptBuilder.Build(ragContext);

        // Deserialise history, keeping last 20 messages to limit token usage
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
        catch
        {
            // Graceful fallback — never leave the customer with silence
            replyText   = "Thank you for reaching out! 🙏 We'll get back to you very shortly.";
            stateSignal = null;
        }

        // ── Update session state ──────────────────────────────────────────────
        UpdateSessionState(session, stateSignal, request.MessageText, replyText);

        // ── Persist updated messages history ──────────────────────────────────
        var updatedHistory = history.ToList();
        updatedHistory.Add(new ConversationMessage("user",      request.MessageText));
        updatedHistory.Add(new ConversationMessage("assistant", replyText));
        // Keep at most 30 turns to avoid unbounded growth
        if (updatedHistory.Count > 30)
            updatedHistory = updatedHistory[^30..];
        session.MessagesJson = JsonSerializer.Serialize(updatedHistory);

        // ── Send reply via channel ────────────────────────────────────────────
        await SendReplyAsync(request.Channel, request.ExternalSenderId, replyText, ct);

        // Log outbound reply as lead activity
        db.LeadActivities.Add(new LeadActivity
        {
            Id           = Guid.NewGuid(),
            TenantId     = request.TenantId,
            LeadId       = lead.Id,
            ActivityType = $"{request.Channel}AutoReply",
            Description  = $"[AI] {TruncateForLog(replyText)}",
            PerformedBy  = null,
            CreatedAt    = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);

        return new HandleInboundMessageResult(lead.Id, session.Id, true, replyText);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static void UpdateSessionState(
        ConversationSession session,
        string? stateSignal,
        string customerMessage,
        string replyText)
    {
        if (stateSignal == null) return;

        session.State = stateSignal switch
        {
            "greeting"        => ConversationState.Greeting,
            "discovery"       => ConversationState.Discovery,
            "interested"      => ConversationState.Interested,
            "collecting_info" => ConversationState.CollectingInfo,
            "confirming"      => ConversationState.Confirming,
            "ordered"         => ConversationState.Ordered,
            "escalate"        => ConversationState.Closed,
            _                 => session.State
        };

        // If the session is moving to collecting_info, try to extract info from the
        // customer message with basic pattern matching (supplements what the AI handles).
        if (session.State == ConversationState.CollectingInfo)
            TryExtractContactInfo(session, customerMessage);
    }

    private static void TryExtractContactInfo(ConversationSession session, string text)
    {
        // Phone: 10-digit number anywhere in the message
        var phoneMatch = System.Text.RegularExpressions.Regex.Match(text, @"\b[6-9]\d{9}\b");
        if (phoneMatch.Success && string.IsNullOrWhiteSpace(session.CollectedPhone))
            session.CollectedPhone = phoneMatch.Value;

        // Email
        var emailMatch = System.Text.RegularExpressions.Regex.Match(text,
            @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b");
        if (emailMatch.Success && string.IsNullOrWhiteSpace(session.CollectedEmail))
            session.CollectedEmail = emailMatch.Value;
    }

    private async Task SendReplyAsync(string channel, string senderId, string text, CancellationToken ct)
    {
        try
        {
            switch (channel)
            {
                case "WhatsApp" when whatsApp.IsConfigured:
                    await whatsApp.SendTextMessageAsync(senderId, text, ct);
                    break;
                case "Facebook" when facebook.IsConfigured:
                    await facebook.SendTextMessageAsync(senderId, text, ct);
                    break;
                case "Instagram" when instagram.IsConfigured:
                    await instagram.SendTextMessageAsync(senderId, text, ct);
                    break;
            }
        }
        catch
        {
            // Log failure silently — session is still saved so retry is possible.
        }
    }

    private static string TruncateForLog(string text, int maxLen = 200)
        => text.Length <= maxLen ? text : text[..maxLen] + "…";
}


