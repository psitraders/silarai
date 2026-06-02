using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Orders;

public class OrderItem : TenantEntity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductTitle { get; set; } = string.Empty;
    public string? VariantInfo { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    public Order Order { get; set; } = null!;
}
