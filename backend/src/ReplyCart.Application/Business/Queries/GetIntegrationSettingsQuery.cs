using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Business.Queries;

public record IntegrationSettingsDto(
    // WhatsApp
    string? WhatsAppPhoneNumberId,
    string? WhatsAppAccessToken,
    string? WhatsAppNumber,
    bool WhatsAppConfigured,
    // Instagram
    string? InstagramAccountId,
    string? InstagramAccessToken,
    bool InstagramConfigured,
    // Facebook
    string? FacebookPageId,
    string? FacebookPageAccessToken,
    bool FacebookConfigured,
    // Theme (from StorefrontSettings)
    string ThemeColor,
    string StorefrontSlug
);

public record GetIntegrationSettingsQuery : IRequest<IntegrationSettingsDto>;

public class GetIntegrationSettingsHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetIntegrationSettingsQuery, IntegrationSettingsDto>
{
    public async Task<IntegrationSettingsDto> Handle(GetIntegrationSettingsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantId, cancellationToken);

        var storefront = await db.StorefrontSettings
            .FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);

        return new IntegrationSettingsDto(
            // WhatsApp
            WhatsAppPhoneNumberId: business?.WhatsAppPhoneNumberId,
            WhatsAppAccessToken: MaskToken(business?.WhatsAppAccessToken),
            WhatsAppNumber: business?.WhatsAppNumber,
            WhatsAppConfigured: !string.IsNullOrEmpty(business?.WhatsAppPhoneNumberId)
                             && !string.IsNullOrEmpty(business?.WhatsAppAccessToken),
            // Instagram
            InstagramAccountId: business?.InstagramAccountId,
            InstagramAccessToken: MaskToken(business?.InstagramAccessToken),
            InstagramConfigured: !string.IsNullOrEmpty(business?.InstagramAccountId)
                              && !string.IsNullOrEmpty(business?.InstagramAccessToken),
            // Facebook
            FacebookPageId: business?.FacebookPageId,
            FacebookPageAccessToken: MaskToken(business?.FacebookPageAccessToken),
            FacebookConfigured: !string.IsNullOrEmpty(business?.FacebookPageId)
                             && !string.IsNullOrEmpty(business?.FacebookPageAccessToken),
            // Theme
            ThemeColor: storefront?.ThemeColor ?? "#0F766E",
            StorefrontSlug: storefront?.Slug ?? string.Empty
        );
    }

    // Show only last 6 chars of token so UI can confirm it's set without exposing the full key
    private static string? MaskToken(string? token)
    {
        if (string.IsNullOrEmpty(token)) return null;
        if (token.Length <= 6) return "••••••";
        return "••••••••••••" + token[^6..];
    }
}
