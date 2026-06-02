using ReplyCart.Domain.Common;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Domain.Tenancy;

public class TenantSubscription : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid PlanId { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Trial;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsAnnual { get; set; }
    public decimal PricePaid { get; set; }
    public string? ExternalPaymentId { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public SubscriptionPlan Plan { get; set; } = null!;
}
