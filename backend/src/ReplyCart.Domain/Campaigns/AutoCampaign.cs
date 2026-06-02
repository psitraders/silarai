using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Campaigns;

/// <summary>
/// Records an auto-generated marketing campaign triggered when a product goes live.
/// Stores what was generated, where it was posted, and any errors.
/// </summary>
public class AutoCampaign : TenantEntity
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;

    // ── AI-generated content ────────────────────────────────────────────────
    public string GeneratedCaption    { get; set; } = string.Empty;
    public string GeneratedHashtags   { get; set; } = string.Empty;
    public string GeneratedCta        { get; set; } = string.Empty;
    public string? GeneratedImageUrl  { get; set; }

    // ── Posting results ─────────────────────────────────────────────────────
    public bool   PostedToInstagram         { get; set; }
    public string? InstagramPostId          { get; set; }

    public bool   PostedToFacebook          { get; set; }
    public string? FacebookPostId           { get; set; }

    public bool   SentViaWhatsAppBroadcast  { get; set; }
    public int    WhatsAppRecipientsCount   { get; set; }

    public AutoCampaignStatus Status { get; set; } = AutoCampaignStatus.Pending;

    /// <summary>Comma-separated error messages from posting failures.</summary>
    public string? ErrorLog { get; set; }

    public DateTime? CompletedAt { get; set; }
}

public enum AutoCampaignStatus
{
    Pending    = 0,
    Processing = 1,
    Completed  = 2,
    Failed     = 3,
    Partial    = 4,   // some channels succeeded, some failed
}
