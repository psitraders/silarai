using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Storefront;

/// <summary>B2B wholesale price tier — quantity break pricing for a product.</summary>
public class ProductWholesaleTier : TenantEntity
{
    public Guid ProductId { get; set; }
    public int MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }   // null = "and above"
    public decimal PricePerUnit { get; set; }
    public string? Label { get; set; }      // e.g. "10–49 units", "50+ units"

    public Product? Product { get; set; }
}
