using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Marketing;

public class CampaignRecipient : TenantEntity
{
    public Guid CampaignId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsSent { get; set; }
    public DateTime? SentAt { get; set; }
    public Campaign Campaign { get; set; } = null!;
}
