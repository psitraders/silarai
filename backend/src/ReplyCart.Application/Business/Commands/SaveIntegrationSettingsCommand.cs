using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Business.Commands;

/// <summary>
/// Saves Instagram, Facebook, Payment gateway, and Theme settings.
/// WhatsApp is no longer set here — it is connected via Meta Embedded Signup
/// (POST /integrations/whatsapp/connect) and disconnected via DELETE /integrations/whatsapp/disconnect.
/// </summary>
public record SaveIntegrationSettingsCommand(
    // Instagram
    string? InstagramAccountId,
    string? InstagramAccessToken,
    // Facebook
    string? FacebookPageId,
    string? FacebookPageAccessToken,
    // Payment gateway selector
    string? PaymentGateway,
    // Stripe
    string? StripeSecretKey,
    // PayPal
    string? PayPalClientId,
    string? PayPalClientSecret,
    bool?   PayPalSandbox,
    // Theme
    string  ThemeColor
) : IRequest;

public class SaveIntegrationSettingsHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<SaveIntegrationSettingsCommand>
{
    public async Task Handle(SaveIntegrationSettingsCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantId, cancellationToken);

        if (business == null)
        {
            business = new Domain.Business.Business { Id = Guid.NewGuid(), TenantId = tenantId };
            db.Businesses.Add(business);
        }

        // ── Instagram ────────────────────────────────────────────────────────────
        business.InstagramAccountId = request.InstagramAccountId?.Trim();
        if (!string.IsNullOrEmpty(request.InstagramAccessToken)
            && !request.InstagramAccessToken.StartsWith("••"))
            business.InstagramAccessToken = request.InstagramAccessToken.Trim();

        // ── Facebook ─────────────────────────────────────────────────────────────
        business.FacebookPageId = request.FacebookPageId?.Trim();
        if (!string.IsNullOrEmpty(request.FacebookPageAccessToken)
            && !request.FacebookPageAccessToken.StartsWith("••"))
            business.FacebookPageAccessToken = request.FacebookPageAccessToken.Trim();

        // ── Payment Gateway ───────────────────────────────────────────────────────
        if (!string.IsNullOrEmpty(request.PaymentGateway))
            business.PaymentGateway = request.PaymentGateway;

        // Stripe
        if (!string.IsNullOrEmpty(request.StripeSecretKey)
            && !request.StripeSecretKey.StartsWith("••"))
            business.StripeSecretKey = request.StripeSecretKey.Trim();

        // PayPal
        business.PayPalClientId = request.PayPalClientId?.Trim();
        if (!string.IsNullOrEmpty(request.PayPalClientSecret)
            && !request.PayPalClientSecret.StartsWith("••"))
            business.PayPalClientSecret = request.PayPalClientSecret.Trim();
        if (request.PayPalSandbox.HasValue)
            business.PayPalSandbox = request.PayPalSandbox.Value;

        // ── StorefrontSettings (theme) ────────────────────────────────────────────
        var storefront = await db.StorefrontSettings
            .FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);

        if (storefront == null)
        {
            storefront = new Domain.Business.StorefrontSettings
            {
                Id              = Guid.NewGuid(),
                TenantId        = tenantId,
                BusinessId      = business.Id,
                Slug            = tenantId.ToString("N")[..8],
                WhatsAppCtaLabel  = "Order on WhatsApp",
                InstagramCtaLabel = "Follow on Instagram",
                FacebookCtaLabel  = "Like on Facebook",
            };
            db.StorefrontSettings.Add(storefront);
        }

        if (!string.IsNullOrEmpty(request.ThemeColor))
            storefront.ThemeColor = request.ThemeColor;

        await db.SaveChangesAsync(cancellationToken);
    }
}
