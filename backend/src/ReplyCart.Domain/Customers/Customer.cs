using ReplyCart.Domain.Common;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Domain.Customers;

public class Customer : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public SocialPlatform PreferredChannel { get; set; } = SocialPlatform.WhatsApp;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Notes { get; set; }
    public string? Tags { get; set; }
    public DateTime? LastOrderDate { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpend { get; set; }
}
