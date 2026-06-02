using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Leads;

namespace ReplyCart.Application.Instagram.Commands;

public record ProcessInstagramMessageCommand(
    string SenderId,        // Instagram-scoped user ID
    string SenderName,
    string MessageText,
    string InstagramMessageId,
    Guid TenantId
) : IRequest<Guid>;

public class ProcessInstagramMessageHandler : IRequestHandler<ProcessInstagramMessageCommand, Guid>
{
    private readonly IAppDbContext _db;

    public ProcessInstagramMessageHandler(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(ProcessInstagramMessageCommand request, CancellationToken ct)
    {
        // Idempotency — same Instagram message ID
        var existingActivity = await _db.LeadActivities
            .FirstOrDefaultAsync(a => a.Description.Contains(request.InstagramMessageId) && a.TenantId == request.TenantId, ct);

        if (existingActivity != null)
            return existingActivity.LeadId;

        // Find existing lead with this Instagram sender ID (stored in CustomerPhone field for consistency)
        var existingLead = await _db.Leads
            .Where(l => l.TenantId == request.TenantId
                     && l.CustomerPhone == request.SenderId
                     && l.SourceChannel == SocialPlatform.Instagram
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
                CustomerPhone = request.SenderId,   // IG-scoped user ID stored here
                SourceChannel = SocialPlatform.Instagram,
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
            ActivityType = "InstagramMessage",
            Description = $"[msgid:{request.InstagramMessageId}] {request.MessageText}",
            PerformedBy = null,
            CreatedAt = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync(ct);
        return leadId;
    }
}
