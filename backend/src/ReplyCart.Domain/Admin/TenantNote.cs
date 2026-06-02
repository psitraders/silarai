using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Admin;

public class TenantNote : BaseEntity
{
    public Guid TenantId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }
}
