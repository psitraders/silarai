using ReplyCart.Domain.Common;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Domain.Catalog;

public class Product : TenantEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Sku { get; set; }
    public Guid? CategoryId { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public ProductStatus Status { get; set; } = ProductStatus.Draft;
    public bool IsFeatured { get; set; }
    public int? StockQuantity { get; set; }
    public int SortOrder { get; set; }
    public string? Attributes { get; set; }

    public Category? Category { get; set; }
    public ICollection<ProductImage> Images { get; set; } = [];
    public ICollection<ProductVariant> Variants { get; set; } = [];
    public ICollection<ProductTag> Tags { get; set; } = [];
}
