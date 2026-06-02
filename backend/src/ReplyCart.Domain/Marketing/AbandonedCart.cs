using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Marketing;

public class AbandonedCart : TenantEntity
{
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public string CartItemsJson { get; set; } = "[]";   // JSON array of cart items
    public decimal CartTotal { get; set; }
    public int ItemCount { get; set; }
    public string StoreSlug { get; set; } = string.Empty;
    public bool IsRecovered { get; set; }
    public DateTime? LastReminderSentAt { get; set; }
}
