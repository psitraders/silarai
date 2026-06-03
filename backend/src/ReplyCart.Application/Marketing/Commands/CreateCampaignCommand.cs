using MediatR;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Marketing;

namespace ReplyCart.Application.Marketing.Commands;

public record CreateCampaignCommand(
    string Title,
    CampaignType Type,
    string? Message,
    string? Subject,
    List<CampaignRecipientInput> Recipients
) : IRequest<Guid>;

public record CampaignRecipientInput(string Name, string? Phone, string? Email);

public class CreateCampaignCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateCampaignCommand, Guid>
{
    public async Task<Guid> Handle(CreateCampaignCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var campaign = new Campaign
        {
            TenantId = tenantId,
            Title = request.Title,
            Type = request.Type,
            Message = request.Message,
            Subject = request.Subject,
            RecipientCount = request.Recipients.Count,
        };
        db.Campaigns.Add(campaign);

        foreach (var r in request.Recipients)
        {
            db.CampaignRecipients.Add(new CampaignRecipient
            {
                TenantId = tenantId,
                CampaignId = campaign.Id,
                Name = r.Name,
                Phone = r.Phone,
                Email = r.Email,
            });
        }

        await db.SaveChangesAsync(cancellationToken);
        return campaign.Id;
    }
}


