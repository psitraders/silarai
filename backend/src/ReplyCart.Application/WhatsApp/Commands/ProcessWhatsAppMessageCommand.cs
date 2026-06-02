using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Leads;

namespace ReplyCart.Application.WhatsApp.Commands;

public record ProcessWhatsAppMessageCommand(
    string FromPhone,
    string SenderName,
    string MessageText,
    string WhatsAppMessageId,
    Guid TenantId
) : IRequest<Guid>;

public class ProcessWhatsAppMessageHandler : IRequestHandler<ProcessWhatsAppMessageCommand, Guid>
{
    private readonly IAppDbContext _db;

    public ProcessWhatsAppMessageHandler(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(ProcessWhatsAppMessageCommand request, CancellationToken ct)
    {
        // Check for duplicate (idempotency - same WhatsApp message ID)
        var existingActivity = await _db.LeadActivities
            .FirstOrDefaultAsync(a => a.Description.Contains(request.WhatsAppMessageId) && a.TenantId == request.TenantId, ct);

        if (existingActivity != null)
            return existingActivity.LeadId;

        // Find existing lead with this phone number
        var existingLead = await _db.Leads
            .Where(l => l.TenantId == request.TenantId && l.CustomerPhone == request.FromPhone && !l.IsDeleted)
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync(ct);

        Guid leadId;

        if (existingLead != null)
        {
            // Add message as activity on existing lead
            existingLead.LastActivityDate = DateTime.UtcNow;
            leadId = existingLead.Id;
        }
        else
        {
            // Create new lead from WhatsApp message
            var lead = new Lead
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                CustomerName = request.SenderName,
                CustomerPhone = request.FromPhone,
                SourceChannel = SocialPlatform.WhatsApp,
                InquiryNote = request.MessageText,
                Status = LeadStatus.NewInquiry,
                Priority = 1,
                LastActivityDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
            };
            _db.Leads.Add(lead);
            leadId = lead.Id;
        }

        // Log the message as a lead activity
        _db.LeadActivities.Add(new LeadActivity
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            LeadId = leadId,
            ActivityType = "WhatsAppMessage",
            Description = $"[msgid:{request.WhatsAppMessageId}] {request.MessageText}",
            PerformedBy = null,
            CreatedAt = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync(ct);
        return leadId;
    }
}
