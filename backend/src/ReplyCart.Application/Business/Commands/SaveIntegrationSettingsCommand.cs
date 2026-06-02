using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Business.Commands;

public record SaveIntegrationSettingsCommand(
    // WhatsApp
    string? WhatsAppPhoneNumberId,
    string? WhatsAppAccessToken,       // null/masked means "don't change"
    string? WhatsAppNumber,
    // Instagram
    string? InstagramAccountId,
    string? InstagramAccessToken,      // null/masked means "don't change"
    // Facebook
    string? FacebookPageId,
    string? FacebookPageAccessToken,   // null/masked means "don't change"
    // Theme
    string ThemeColor
) : IRequest;

public class SaveIntegrationSettingsHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<SaveIntegrationSettingsCommand>
{
    public async Task Handle(SaveIntegrationSettingsCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        // ── Business (credentials) ────────────────────────────────────────────
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantId, cancellationToken);

        if (business == null)
        {
            business = new Domain.Business.Business { Id = Guid.NewGuid(), TenantId = tenantId };
            db.Businesses.Add(business);
        }

        // WhatsApp
        business.WhatsAppPhoneNumberId = request.WhatsAppPhoneNumberId?.Trim();
        business.WhatsAppNumber = request.WhatsAppNumber?.Trim();
        if (!string.IsNullOrEmpty(request.WhatsAppAccessToken)
            && !request.WhatsAppAccessToken.StartsWith("••"))
        {
            business.WhatsAppAccessToken = request.WhatsAppAccessToken.Trim();
        }

        // Instagram
        business.InstagramAccountId = request.InstagramAccountId?.Trim();
        if (!string.IsNullOrEmpty(request.InstagramAccessToken)
            && !request.InstagramAccessToken.StartsWith("••"))
        {
            business.InstagramAccessToken = request.InstagramAccessToken.Trim();
        }

        // Facebook
        business.FacebookPageId = request.FacebookPageId?.Trim();
        if (!string.IsNullOrEmpty(request.FacebookPageAccessToken)
            && !request.FacebookPageAccessToken.StartsWith("••"))
        {
            business.FacebookPageAccessToken = request.FacebookPageAccessToken.Trim();
        }

        // ── StorefrontSettings (theme) ────────────────────────────────────────
        var storefront = await db.StorefrontSettings
            .FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);

        if (storefront == null)
        {
            storefront = new Domain.Business.StorefrontSettings
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BusinessId = business.Id,
                Slug = tenantId.ToString("N")[..8],
                WhatsAppCtaLabel = "Order on WhatsApp",
                InstagramCtaLabel = "Follow on Instagram",
                FacebookCtaLabel = "Like on Facebook",
            };
            db.StorefrontSettings.Add(storefront);
        }

        if (!string.IsNullOrEmpty(request.ThemeColor))
            storefront.ThemeColor = request.ThemeColor;

        await db.SaveChangesAsync(cancellationToken);
    }
}
