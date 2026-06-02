using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Business.Queries;

public record StorefrontSettingsDto(
    Guid Id, string Slug,
    string ThemeColor, string SecondaryColor, string? AccentColor,
    string? SeoTitle, string? SeoDescription, string? SeoKeywords,
    string? ReturnPolicy,
    string WhatsAppCtaLabel, string InstagramCtaLabel, string FacebookCtaLabel,
    bool ShowOutOfStockProducts, bool AllowPublicInquiries,
    string? AnnouncementText,
    string? LogoUrl, string? BannerUrl,
    string? GA4MeasurementId = null,
    string? GA4PropertyId = null,
    bool HasGA4ServiceAccount = false,  // true if service account JSON is saved
    bool HasGA4OAuthToken = false,      // true if OAuth refresh token is saved
    string? FaviconUrl = null,          // custom browser-tab icon (falls back to LogoUrl)
    bool LoaderEnabled = true           // show branded 2-second loading screen
);

public record GetStorefrontSettingsQuery : IRequest<StorefrontSettingsDto?>;

public class GetStorefrontSettingsQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetStorefrontSettingsQuery, StorefrontSettingsDto?>
{
    public async Task<StorefrontSettingsDto?> Handle(GetStorefrontSettingsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var s = await db.StorefrontSettings.FirstOrDefaultAsync(
            x => x.TenantId == tenantId, cancellationToken);

        var business = await db.Businesses.FirstOrDefaultAsync(
            b => b.TenantId == tenantId, cancellationToken);

        // Fallback slug: use Tenant.Slug for tenants who registered before
        // StorefrontSettings was auto-created on registration.
        string effectiveSlug = s?.Slug ?? string.Empty;
        if (string.IsNullOrWhiteSpace(effectiveSlug))
        {
            var tenant = await db.Tenants
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);
            effectiveSlug = tenant?.Slug ?? string.Empty;
        }

        return new StorefrontSettingsDto(
            s?.Id ?? Guid.Empty,
            effectiveSlug,
            s?.ThemeColor             ?? "#0F766E",
            s?.SecondaryColor         ?? "#134E4A",
            s?.AccentColor,
            s?.SeoTitle,
            s?.SeoDescription,
            s?.SeoKeywords,
            s?.ReturnPolicy,
            s?.WhatsAppCtaLabel       ?? "Order on WhatsApp",
            s?.InstagramCtaLabel      ?? "Message on Instagram",
            s?.FacebookCtaLabel       ?? "Message on Facebook",
            s?.ShowOutOfStockProducts ?? true,
            s?.AllowPublicInquiries   ?? true,
            s?.AnnouncementText,
            business?.LogoUrl,
            business?.BannerUrl,
            s?.GA4MeasurementId,
            s?.GA4PropertyId,
            !string.IsNullOrWhiteSpace(s?.GA4ServiceAccountJson),
            !string.IsNullOrWhiteSpace(s?.GA4RefreshToken),
            FaviconUrl:    s?.FaviconUrl,
            LoaderEnabled: s?.LoaderEnabled ?? true
        );
    }
}
