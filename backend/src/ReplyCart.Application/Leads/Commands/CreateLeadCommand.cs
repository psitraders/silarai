using MediatR;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Leads;

namespace ReplyCart.Application.Leads.Commands;

public record CreateLeadCommand(
    string CustomerName,
    string? CustomerPhone,
    string? CustomerEmail,
    SocialPlatform SourceChannel,
    Guid? InterestedProductId,
    string? InquiryNote,
    Guid? AssignedUserId,
    DateTime? FollowUpDate,
    int Priority = 1
) : IRequest<Guid>;

public class CreateLeadCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateLeadCommand, Guid>
{
    public async Task<Guid> Handle(CreateLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = new Lead
        {
            TenantId = tenantContext.CurrentTenantId,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            CustomerEmail = request.CustomerEmail,
            SourceChannel = request.SourceChannel,
            InterestedProductId = request.InterestedProductId,
            InquiryNote = request.InquiryNote,
            AssignedUserId = request.AssignedUserId,
            FollowUpDate = request.FollowUpDate,
            Priority = request.Priority,
            LastActivityDate = DateTime.UtcNow
        };
        db.Leads.Add(lead);

        db.LeadActivities.Add(new LeadActivity
        {
            TenantId = tenantContext.CurrentTenantId,
            LeadId = lead.Id,
            ActivityType = "Created",
            Description = "Lead created"
        });

        await db.SaveChangesAsync(cancellationToken);
        return lead.Id;
    }
}


