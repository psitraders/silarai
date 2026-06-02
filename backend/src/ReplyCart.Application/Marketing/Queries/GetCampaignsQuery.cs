using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Marketing.Queries;

public record CampaignDto(
    Guid Id, string Title, string Type, string Status,
    int RecipientCount, int SentCount, int OpenedCount,
    DateTime? ScheduledAt, DateTime? SentAt, DateTime CreatedAt);

public record GetCampaignsQuery(int Page = 1, int PageSize = 20) : IRequest<List<CampaignDto>>;

public class GetCampaignsQueryHandler(IAppDbContext db)
    : IRequestHandler<GetCampaignsQuery, List<CampaignDto>>
{
    public async Task<List<CampaignDto>> Handle(GetCampaignsQuery request, CancellationToken cancellationToken)
    {
        return await db.Campaigns
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CampaignDto(
                c.Id, c.Title, c.Type.ToString(), c.Status.ToString(),
                c.RecipientCount, c.SentCount, c.OpenedCount,
                c.ScheduledAt, c.SentAt, c.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
