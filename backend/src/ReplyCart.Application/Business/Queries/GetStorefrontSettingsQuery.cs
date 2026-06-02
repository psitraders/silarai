using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Business.Queries;

public record StorefrontSettingsDto(
    Guid Id, string Slug, string ThemeColor, string? SeoTitle, string? SeoDescription,
    string WhatsAppCtaLabel, string InstagramCtaLabel, string FacebookCtaLabel,
    bool ShowOutOfStockProducts, bool AllowPublicInquiries,
    string? AnnouncementText
);

public record GetStorefrontSettingsQuery : IRequest<StorefrontSettingsDto?>;

public class GetStorefrontSettingsQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetStorefrontSettingsQuery, StorefrontSettingsDto?>
{
    public async Task<StorefrontSettingsDto?> Handle(GetStorefrontSettingsQuery request, CancellationToken cancellationToken)
    {
        var s = await db.StorefrontSettings.FirstOrDefaultAsync(
            x => x.TenantId == tenantContext.CurrentTenantId, cancellationToken);

        return s is null ? null : new StorefrontSettingsDto(
            s.Id, s.Slug, s.ThemeColor, s.SeoTitle, s.SeoDescription,
            s.WhatsAppCtaLabel, s.InstagramCtaLabel, s.FacebookCtaLabel,
            s.ShowOutOfStockProducts, s.AllowPublicInquiries,
            s.AnnouncementText
        );
    }
}
