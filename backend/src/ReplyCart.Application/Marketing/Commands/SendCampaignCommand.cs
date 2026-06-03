using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Marketing;

namespace ReplyCart.Application.Marketing.Commands;

public record SendCampaignResult(Guid CampaignId, int RecipientCount, List<WhatsAppSendTarget> WhatsAppTargets);
public record WhatsAppSendTarget(string Name, string Phone, string WhatsAppUrl);

public record SendCampaignCommand(Guid CampaignId) : IRequest<SendCampaignResult>;

public class SendCampaignCommandHandler(IAppDbContext db) : IRequestHandler<SendCampaignCommand, SendCampaignResult>
{
    public async Task<SendCampaignResult> Handle(SendCampaignCommand request, CancellationToken cancellationToken)
    {
        var campaign = await db.Campaigns
            .Include(c => c.Recipients)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId, cancellationToken)
            ?? throw new NotFoundException(nameof(Campaign), request.CampaignId);

        campaign.Status = CampaignStatus.Sent;
        campaign.SentAt = DateTime.UtcNow;
        campaign.SentCount = campaign.Recipients.Count;

        var targets = new List<WhatsAppSendTarget>();

        foreach (var recipient in campaign.Recipients)
        {
            recipient.IsSent = true;
            recipient.SentAt = DateTime.UtcNow;

            if (campaign.Type == CampaignType.WhatsApp && !string.IsNullOrWhiteSpace(recipient.Phone))
            {
                var encodedMsg = Uri.EscapeDataString(campaign.Message ?? "");
                var phone = recipient.Phone.Replace("+", "").Replace(" ", "").Replace("-", "");
                var url = $"https://wa.me/{phone}?text={encodedMsg}";
                targets.Add(new WhatsAppSendTarget(recipient.Name, recipient.Phone, url));
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        return new SendCampaignResult(campaign.Id, campaign.SentCount, targets);
    }
}


