using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Leads;

namespace ReplyCart.Application.Facebook.Commands;

public record ProcessFacebookMessageCommand(
    string SenderId,        // Page-scoped user ID (PSID)
    string SenderName,
    string MessageText,
    string FacebookMessageId,
    Guid TenantId
) : IRequest<Guid>;

public class ProcessFacebookMessageHandler : IRequestHandler<ProcessFacebookMessageCommand, Guid>
{
    private readonly IAppDbContext _db;

    public ProcessFacebookMessageHandler(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(ProcessFacebookMessageCommand request, CancellationToken ct)
    {
        // Idempotency — same Facebook message ID
        var existingActivity = await _db.LeadActivities
            .FirstOrDefaultAsync(a => a.Description.Contains(request.FacebookMessageId) && a.TenantId == request.TenantId, ct);

        if (existingActivity != null)
            return existingActivity.LeadId;

        // Find existing lead with this Facebook PSID (stored in CustomerPhone for consistency)
        var existingLead = await _db.Leads
            .Where(l => l.TenantId == request.TenantId
                     && l.CustomerPhone == request.SenderId
                     && l.SourceChannel == SocialPlatform.Facebook
                     && !l.IsDeleted)
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync(ct);

        Guid leadId;

        if (existingLead != null)
        {
            existingLead.LastActivityDate = DateTime.UtcNow;
            leadId = existingLead.Id;
        }
        else
        {
            var lead = new Lead
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                CustomerName = request.SenderName,
                CustomerPhone = request.SenderId,   // Facebook PSID stored here
                SourceChannel = SocialPlatform.Facebook,
                InquiryNote = request.MessageText,
                Status = LeadStatus.NewInquiry,
                Priority = 1,
                LastActivityDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
            };
            _db.Leads.Add(lead);
            leadId = lead.Id;
        }

        _db.LeadActivities.Add(new LeadActivity
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            LeadId = leadId,
            ActivityType = "FacebookMessage",
            Description = $"[msgid:{request.FacebookMessageId}] {request.MessageText}",
            PerformedBy = null,
            CreatedAt = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync(ct);
        return leadId;
    }
}
