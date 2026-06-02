using ReplyCart.Domain.Common;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Domain.Orders;

public class OrderStatusHistory : TenantEntity
{
    public Guid OrderId { get; set; }
    public OrderStatus FromStatus { get; set; }
    public OrderStatus ToStatus { get; set; }
    public string? Note { get; set; }
    public Guid ChangedBy { get; set; }

    public Order Order { get; set; } = null!;
}
