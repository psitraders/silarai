namespace ReplyCart.Domain.Enums;

public enum SubscriptionStatus
{
    Active = 1,
    Expired = 2,
    Cancelled = 3,
    Trial = 4,
    PastDue = 5,
    /// <summary>Tenant has requested a plan — waiting for admin to approve and activate.</summary>
    PendingApproval = 6,
}
