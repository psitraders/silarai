using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Business;

public class StorefrontSettings : TenantEntity
{
    public Guid BusinessId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string ThemeColor { get; set; } = "#0F766E";       // primary brand colour
    public string SecondaryColor { get; set; } = "#134E4A";   // secondary / gradient end colour
    public string? AccentColor { get; set; }                  // optional 3rd accent colour
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? SeoKeywords { get; set; }

    /// <summary>
    /// Return &amp; refund policy shown in the public storefront footer.
    /// Null = show the built-in generic policy.
    /// </summary>
    public string? ReturnPolicy { get; set; }
    public string WhatsAppCtaLabel { get; set; } = "Order on WhatsApp";
    public string InstagramCtaLabel { get; set; } = "Message on Instagram";
    public string FacebookCtaLabel { get; set; } = "Message on Facebook";
    public bool ShowOutOfStockProducts { get; set; } = true;
    public bool AllowPublicInquiries { get; set; } = true;
    public string? CustomCss { get; set; }

    /// <summary>
    /// Text shown in the announcement bar at the top of the public storefront.
    /// Null = hide the bar entirely.
    /// </summary>
    public string? AnnouncementText { get; set; }

    // ── Browser / loading experience ─────────────────────────────────────────
    /// <summary>
    /// Custom favicon URL (.png / .ico / .svg).
    /// Falls back to Business.LogoUrl when null.
    /// </summary>
    public string? FaviconUrl { get; set; }

    /// <summary>
    /// When true (default) the storefront shows a 2-second branded loading
    /// screen with the store logo and theme-coloured spinner on first visit.
    /// </summary>
    public bool LoaderEnabled { get; set; } = true;

    // ── Google Analytics 4 ────────────────────────────────────────────────────
    /// <summary>GA4 Measurement ID (G-XXXXXXXXXX). Embedded in the public storefront gtag script.</summary>
    public string? GA4MeasurementId { get; set; }

    /// <summary>GA4 Property ID (numeric, e.g. 123456789). Used to query the GA4 Data API.</summary>
    public string? GA4PropertyId { get; set; }

    /// <summary>
    /// Full JSON content of the merchant's GA4 service account key file.
    /// Paste the entire JSON downloaded from Google Cloud Console → Service Accounts → Keys.
    /// Stored encrypted at rest in Azure SQL; never exposed to the public storefront.
    /// </summary>
    public string? GA4ServiceAccountJson { get; set; }

    /// <summary>
    /// OAuth2 refresh token obtained when the merchant clicks "Connect Google Analytics".
    /// Used to get short-lived access tokens to call GA4 Data API on their behalf.
    /// Never exposed to the frontend.
    /// </summary>
    public string? GA4RefreshToken { get; set; }

    public Business Business { get; set; } = null!;
}
