using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Campaigns;

namespace ReplyCart.Application.Catalog.Queries;

public record GetAutoCampaignsQuery(int Page = 1, int PageSize = 20) : IRequest<AutoCampaignsResult>;

public record AutoCampaignsResult(
    IReadOnlyList<AutoCampaignDto> Items,
    int Total,
    int Page,
    int PageSize
);

public record AutoCampaignDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string GeneratedCaption,
    string GeneratedHashtags,
    string GeneratedCta,
    string? GeneratedImageUrl,
    bool PostedToInstagram,
    string? InstagramPostId,
    bool PostedToFacebook,
    string? FacebookPostId,
    bool SentViaWhatsAppBroadcast,
    int WhatsAppRecipientsCount,
    string Status,
    string? ErrorLog,
    DateTime? CompletedAt,
    DateTime CreatedAt
);

public class GetAutoCampaignsQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetAutoCampaignsQuery, AutoCampaignsResult>
{
    public async Task<AutoCampaignsResult> Handle(GetAutoCampaignsQuery request, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var query = db.AutoCampaigns
            .AsNoTracking()
            .Where(c => c.TenantId == tenantId);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new AutoCampaignDto(
                c.Id,
                c.ProductId,
                c.ProductName,
                c.GeneratedCaption,
                c.GeneratedHashtags,
                c.GeneratedCta,
                c.GeneratedImageUrl,
                c.PostedToInstagram,
                c.InstagramPostId,
                c.PostedToFacebook,
                c.FacebookPostId,
                c.SentViaWhatsAppBroadcast,
                c.WhatsAppRecipientsCount,
                c.Status.ToString(),
                c.ErrorLog,
                c.CompletedAt,
                c.CreatedAt))
            .ToListAsync(ct);

        return new AutoCampaignsResult(items, total, request.Page, request.PageSize);
    }
}


