using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Leads;

public class LeadNote : TenantEntity
{
    public Guid LeadId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }

    public Lead Lead { get; set; } = null!;
}
