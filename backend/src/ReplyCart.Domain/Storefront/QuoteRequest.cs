using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Storefront;

public class QuoteRequest : TenantEntity
{
    public Guid? StorefrontCustomerId { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string? ContactPhone { get; set; }
    public string? CompanyName { get; set; }
    public string? GstNumber { get; set; }
    public string ItemsJson { get; set; } = "[]";   // [{ productId, title, qty, unitPrice }]
    public string? Notes { get; set; }
    public string Status { get; set; } = "Pending"; // Pending | Replied | Closed
    public string? MerchantReply { get; set; }
    public DateTime? RepliedAt { get; set; }
}
