using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Storefront;

public class StorefrontCustomer : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PinCode { get; set; }

    // B2B fields
    public bool IsB2BCustomer { get; set; }
    public bool IsB2BApproved { get; set; }
    public string? CompanyName { get; set; }
    public string? GstNumber { get; set; }

    // Loyalty
    public int LoyaltyPoints { get; set; }

    // Link to CRM Customer (optional, auto-created on first order)
    public Guid? LinkedCrmCustomerId { get; set; }

    public ICollection<StorefrontWishlistItem> WishlistItems { get; set; } = [];
}
