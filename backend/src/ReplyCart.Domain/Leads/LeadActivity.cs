using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Leads;

public class LeadActivity : TenantEntity
{
    public Guid LeadId { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? PerformedBy { get; set; }

    public Lead Lead { get; set; } = null!;
}
