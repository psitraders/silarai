using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Business;

namespace ReplyCart.Application.Business.Commands;

public record UpdateStorefrontSettingsCommand(
    string Slug, string ThemeColor, string? SeoTitle, string? SeoDescription,
    string WhatsAppCtaLabel, string InstagramCtaLabel, string FacebookCtaLabel,
    bool ShowOutOfStockProducts, bool AllowPublicInquiries,
    string? AnnouncementText
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

        settings.Slug                  = request.Slug;
        settings.ThemeColor            = request.ThemeColor;
        settings.SeoTitle              = request.SeoTitle;
        settings.SeoDescription        = request.SeoDescription;
        settings.WhatsAppCtaLabel      = request.WhatsAppCtaLabel;
        settings.InstagramCtaLabel     = request.InstagramCtaLabel;
        settings.FacebookCtaLabel      = request.FacebookCtaLabel;
        settings.ShowOutOfStockProducts = request.ShowOutOfStockProducts;
        settings.AllowPublicInquiries  = request.AllowPublicInquiries;
        settings.AnnouncementText      = string.IsNullOrWhiteSpace(request.AnnouncementText)
                                            ? null
                                            : request.AnnouncementText.Trim();

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
