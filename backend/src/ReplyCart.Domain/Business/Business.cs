using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Business;

public class Business : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? BannerUrl { get; set; }
    public string? WhatsAppNumber { get; set; }
    public string? InstagramHandle { get; set; }
    public string? FacebookPageUrl { get; set; }
    public string? DeliveryInfo { get; set; }
    public string Currency { get; set; } = "INR";
    public string? BusinessHours { get; set; }
    public string? WelcomeText { get; set; }
    public bool IsOnboardingComplete { get; set; }

    // WhatsApp Business API credentials (stored per-tenant, not in config files)
    public string? WhatsAppPhoneNumberId { get; set; }
    public string? WhatsAppAccessToken { get; set; }

    // Instagram Graph API credentials
    public string? InstagramAccountId { get; set; }
    public string? InstagramAccessToken { get; set; }

    // Facebook Messenger / Page credentials
    public string? FacebookPageId { get; set; }
    public string? FacebookPageAccessToken { get; set; }

    // Razorpay payment credentials (per-tenant, entered by business owner)
    public string? RazorpayKeyId { get; set; }
    public string? RazorpayKeySecret { get; set; }

    public StorefrontSettings? StorefrontSettings { get; set; }
    public ICollection<SocialLink> SocialLinks { get; set; } = [];
}
