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
    public string Country { get; set; } = "India";
    public string Language { get; set; } = "en";
    public string? BusinessHours { get; set; }
    public string? WelcomeText { get; set; }
    public bool IsOnboardingComplete { get; set; }

    // ── Meta WhatsApp Business API (per-tenant, captured via Embedded Signup) ──
    /// <summary>Meta Phone Number ID — used as the From address in Cloud API calls.</summary>
    public string? WhatsAppPhoneNumberId { get; set; }
    /// <summary>Long-lived user access token obtained during Embedded Signup.</summary>
    public string? WhatsAppAccessToken { get; set; }
    /// <summary>WhatsApp Business Account ID — for management API calls.</summary>
    public string? WhatsAppWabaId { get; set; }

    // Instagram Graph API credentials
    public string? InstagramAccountId { get; set; }
    public string? InstagramAccessToken { get; set; }

    // Facebook Messenger / Page credentials
    public string? FacebookPageId { get; set; }
    public string? FacebookPageAccessToken { get; set; }

    // Razorpay payment credentials (per-tenant, entered by business owner)
    public string? RazorpayKeyId { get; set; }
    public string? RazorpayKeySecret { get; set; }

    // WhatsApp Commerce Catalog ID (from Meta Commerce Manager)
    public string? WhatsAppCatalogId { get; set; }

    // ── Payment Gateways ──────────────────────────────────────────────────────
    /// <summary>"Razorpay" (default) | "Stripe" | "PayPal"</summary>
    public string PaymentGateway { get; set; } = "Razorpay";
    // Stripe
    public string? StripeSecretKey { get; set; }
    // PayPal
    public string? PayPalClientId { get; set; }
    public string? PayPalClientSecret { get; set; }
    public bool PayPalSandbox { get; set; } = false;

    // ── AI Auto-Reply ─────────────────────────────────────────────────────────
    /// <summary>When true the AI agent auto-replies to incoming messages on all channels.</summary>
    public bool AutoReplyEnabled { get; set; } = false;

    /// <summary>Tone for AI replies: Friendly | Professional | Fun | Formal</summary>
    public string AutoReplyTone { get; set; } = "Friendly";

    /// <summary>
    /// Custom FAQ / store policy text injected into every AI context window.
    /// e.g. "We deliver within 3-5 days. COD available. No returns after 7 days."
    /// </summary>
    public string? AiStoreContext { get; set; }

    // ── Auto-Campaign ─────────────────────────────────────────────────────────
    /// <summary>Auto-post to social channels when a product is published.</summary>
    public bool AutoCampaignEnabled { get; set; } = false;

    public StorefrontSettings? StorefrontSettings { get; set; }
    public ICollection<SocialLink> SocialLinks { get; set; } = [];
}
