using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Business.Queries;

public record IntegrationSettingsDto(
    // WhatsApp (Meta Cloud API — connected via Embedded Signup)
    bool    WhatsAppConfigured,
    string? WhatsAppNumber,          // human-readable display number e.g. "+91 98765 43210"
    string? WhatsAppPhoneNumberId,   // Meta internal ID (shown masked in UI)
    string? WhatsAppWabaId,          // WABA ID (masked)
    // Instagram
    string? InstagramAccountId,
    string? InstagramAccessToken,
    bool    InstagramConfigured,
    // Facebook
    string? FacebookPageId,
    string? FacebookPageAccessToken,
    bool    FacebookConfigured,
    // Razorpay
    string? RazorpayKeyId,
    bool    RazorpayConfigured,
    // Stripe
    string? StripeSecretKey,         // masked
    bool    StripeConfigured,
    // PayPal
    string? PayPalClientId,
    string? PayPalClientSecret,      // masked
    bool    PayPalConfigured,
    bool    PayPalSandbox,
    // Active gateway
    string  PaymentGateway,
    // Theme
    string  ThemeColor,
    string  StorefrontSlug
);

public record GetIntegrationSettingsQuery : IRequest<IntegrationSettingsDto>;

public class GetIntegrationSettingsHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetIntegrationSettingsQuery, IntegrationSettingsDto>
{
    public async Task<IntegrationSettingsDto> Handle(GetIntegrationSettingsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var business   = await db.Businesses.FirstOrDefaultAsync(b => b.TenantId == tenantId, cancellationToken);
        var storefront = await db.StorefrontSettings.FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);

        return new IntegrationSettingsDto(
            // WhatsApp
            WhatsAppConfigured:    !string.IsNullOrEmpty(business?.WhatsAppPhoneNumberId)
                                && !string.IsNullOrEmpty(business?.WhatsAppAccessToken),
            WhatsAppNumber:        business?.WhatsAppNumber,
            WhatsAppPhoneNumberId: MaskId(business?.WhatsAppPhoneNumberId),
            WhatsAppWabaId:        MaskId(business?.WhatsAppWabaId),
            // Instagram
            InstagramAccountId:      business?.InstagramAccountId,
            InstagramAccessToken:    MaskToken(business?.InstagramAccessToken),
            InstagramConfigured:     !string.IsNullOrEmpty(business?.InstagramAccountId)
                                  && !string.IsNullOrEmpty(business?.InstagramAccessToken),
            // Facebook
            FacebookPageId:          business?.FacebookPageId,
            FacebookPageAccessToken: MaskToken(business?.FacebookPageAccessToken),
            FacebookConfigured:      !string.IsNullOrEmpty(business?.FacebookPageId)
                                  && !string.IsNullOrEmpty(business?.FacebookPageAccessToken),
            // Razorpay
            RazorpayKeyId:          business?.RazorpayKeyId,
            RazorpayConfigured:     !string.IsNullOrEmpty(business?.RazorpayKeyId)
                                 && !string.IsNullOrEmpty(business?.RazorpayKeySecret),
            // Stripe
            StripeSecretKey:        MaskToken(business?.StripeSecretKey),
            StripeConfigured:       !string.IsNullOrEmpty(business?.StripeSecretKey),
            // PayPal
            PayPalClientId:         business?.PayPalClientId,
            PayPalClientSecret:     MaskToken(business?.PayPalClientSecret),
            PayPalConfigured:       !string.IsNullOrEmpty(business?.PayPalClientId)
                                 && !string.IsNullOrEmpty(business?.PayPalClientSecret),
            PayPalSandbox:          business?.PayPalSandbox ?? false,
            // Active gateway
            PaymentGateway:         business?.PaymentGateway ?? "Razorpay",
            // Theme
            ThemeColor:             storefront?.ThemeColor ?? "#0F766E",
            StorefrontSlug:         storefront?.Slug ?? string.Empty
        );
    }

    private static string? MaskToken(string? token)
    {
        if (string.IsNullOrEmpty(token)) return null;
        if (token.Length <= 6) return "••••••";
        return "••••••••••••" + token[^6..];
    }

    // For numeric IDs like PhoneNumberId / WabaId — show last 4 digits
    private static string? MaskId(string? id)
    {
        if (string.IsNullOrEmpty(id)) return null;
        if (id.Length <= 4) return id;
        return "••••" + id[^4..];
    }
}


