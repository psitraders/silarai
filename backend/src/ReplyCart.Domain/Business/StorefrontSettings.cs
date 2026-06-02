using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Business;

public class StorefrontSettings : TenantEntity
{
    public Guid BusinessId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string ThemeColor { get; set; } = "#0F766E";
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
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

    public Business Business { get; set; } = null!;
}
