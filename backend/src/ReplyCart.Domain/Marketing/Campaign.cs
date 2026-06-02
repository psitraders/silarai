using ReplyCart.Domain.Common;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Domain.Marketing;

public class Campaign : TenantEntity
{
    public string Title { get; set; } = string.Empty;
    public CampaignType Type { get; set; } = CampaignType.WhatsApp;
    public string? Message { get; set; }
    public string? Subject { get; set; }
    public CampaignStatus Status { get; set; } = CampaignStatus.Draft;
    public DateTime? ScheduledAt { get; set; }
    public DateTime? SentAt { get; set; }
    public int RecipientCount { get; set; }
    public int SentCount { get; set; }
    public int OpenedCount { get; set; }
    public ICollection<CampaignRecipient> Recipients { get; set; } = [];
}
