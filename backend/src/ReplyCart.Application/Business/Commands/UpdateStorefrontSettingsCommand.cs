using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Business;

namespace ReplyCart.Application.Business.Commands;

public record UpdateStorefrontSettingsCommand(
    string Slug,
    string ThemeColor, string SecondaryColor, string? AccentColor,
    string? SeoTitle, string? SeoDescription, string? SeoKeywords,
    string? ReturnPolicy,
    string WhatsAppCtaLabel, string InstagramCtaLabel, string FacebookCtaLabel,
    bool ShowOutOfStockProducts, bool AllowPublicInquiries,
    string? AnnouncementText,
    string? LogoUrl, string? BannerUrl,
    string? GA4MeasurementId = null,
    string? GA4PropertyId = null,
    string? GA4ServiceAccountJson = null,
    string? FaviconUrl = null,
    bool LoaderEnabled = true
) : IRequest;

public class UpdateStorefrontSettingsCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<UpdateStorefrontSettingsCommand>
{
    public async Task Handle(UpdateStorefrontSettingsCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var business = await db.Businesses.FirstOrDefaultAsync(
            b => b.TenantId == tenantId, cancellationToken);

        var settings = await db.StorefrontSettings.FirstOrDefaultAsync(
            s => s.TenantId == tenantId, cancellationToken);

        if (settings is null)
        {
            settings = new StorefrontSettings
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BusinessId = business?.Id ?? Guid.Empty,
            };
            db.StorefrontSettings.Add(settings);
        }

        settings.Slug                   = request.Slug;
        settings.ThemeColor             = request.ThemeColor;
        settings.SecondaryColor         = request.SecondaryColor;
        settings.AccentColor            = string.IsNullOrWhiteSpace(request.AccentColor) ? null : request.AccentColor;
        settings.SeoTitle               = request.SeoTitle;
        settings.SeoDescription         = request.SeoDescription;
        settings.SeoKeywords            = string.IsNullOrWhiteSpace(request.SeoKeywords)   ? null : request.SeoKeywords.Trim();
        settings.ReturnPolicy           = string.IsNullOrWhiteSpace(request.ReturnPolicy)  ? null : request.ReturnPolicy.Trim();
        settings.WhatsAppCtaLabel       = request.WhatsAppCtaLabel;
        settings.InstagramCtaLabel      = request.InstagramCtaLabel;
        settings.FacebookCtaLabel       = request.FacebookCtaLabel;
        settings.ShowOutOfStockProducts = request.ShowOutOfStockProducts;
        settings.AllowPublicInquiries   = request.AllowPublicInquiries;
        settings.AnnouncementText       = string.IsNullOrWhiteSpace(request.AnnouncementText)
                                            ? null
                                            : request.AnnouncementText.Trim();
        settings.GA4MeasurementId       = string.IsNullOrWhiteSpace(request.GA4MeasurementId)      ? null : request.GA4MeasurementId.Trim();
        settings.GA4PropertyId          = string.IsNullOrWhiteSpace(request.GA4PropertyId)          ? null : request.GA4PropertyId.Trim();
        // Only overwrite if a non-null value was sent (null = "don't change"; empty string = "clear it")
        if (request.GA4ServiceAccountJson is not null)
            settings.GA4ServiceAccountJson = string.IsNullOrWhiteSpace(request.GA4ServiceAccountJson) ? null : request.GA4ServiceAccountJson.Trim();

        settings.FaviconUrl    = string.IsNullOrWhiteSpace(request.FaviconUrl) ? null : request.FaviconUrl.Trim();
        settings.LoaderEnabled = request.LoaderEnabled;

        // Persist logo & banner on the Business entity
        if (business is not null)
        {
            if (request.LogoUrl is not null)
                business.LogoUrl = string.IsNullOrWhiteSpace(request.LogoUrl) ? null : request.LogoUrl.Trim();

            if (request.BannerUrl is not null)
                business.BannerUrl = string.IsNullOrWhiteSpace(request.BannerUrl) ? null : request.BannerUrl.Trim();
        }

        // Keep Tenant.Slug in sync — the public-route middleware resolves
        // tenants by Tenant.Slug, so it must always match StorefrontSettings.Slug.
        var tenant = await db.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);
        if (tenant != null)
            tenant.Slug = request.Slug;

        await db.SaveChangesAsync(cancellationToken);
    }
}


