namespace ReplyCart.Domain.Common;

public abstract class TenantEntity : BaseEntity
{
    public Guid TenantId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
