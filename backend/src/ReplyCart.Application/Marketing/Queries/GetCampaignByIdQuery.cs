using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Marketing;

namespace ReplyCart.Application.Marketing.Queries;

public record CampaignDetailDto(
    Guid Id, string Title, string Type, string Status, string? Message, string? Subject,
    int RecipientCount, int SentCount, int OpenedCount,
    DateTime? ScheduledAt, DateTime? SentAt, DateTime CreatedAt,
    List<CampaignRecipientDto> Recipients);
public record CampaignRecipientDto(Guid Id, string Name, string? Phone, string? Email, bool IsSent, DateTime? SentAt);

public record GetCampaignByIdQuery(Guid Id) : IRequest<CampaignDetailDto>;

public class GetCampaignByIdQueryHandler(IAppDbContext db)
    : IRequestHandler<GetCampaignByIdQuery, CampaignDetailDto>
{
    public async Task<CampaignDetailDto> Handle(GetCampaignByIdQuery request, CancellationToken cancellationToken)
    {
        var c = await db.Campaigns
            .Include(x => x.Recipients)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Campaign), request.Id);

        return new CampaignDetailDto(
            c.Id, c.Title, c.Type.ToString(), c.Status.ToString(), c.Message, c.Subject,
            c.RecipientCount, c.SentCount, c.OpenedCount,
            c.ScheduledAt, c.SentAt, c.CreatedAt,
            c.Recipients.Select(r => new CampaignRecipientDto(r.Id, r.Name, r.Phone, r.Email, r.IsSent, r.SentAt)).ToList());
    }
}


