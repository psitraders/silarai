using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Catalog;

public class ProductVariant : TenantEntity
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public decimal? PriceAdjustment { get; set; }
    public int? StockQuantity { get; set; }
    public bool IsAvailable { get; set; } = true;

    public Product Product { get; set; } = null!;
}
