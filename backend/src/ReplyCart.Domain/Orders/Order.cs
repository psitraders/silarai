using ReplyCart.Domain.Common;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Domain.Orders;

public class Order : TenantEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid? CustomerId { get; set; }
    public Guid? SourceLeadId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.New;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public SocialPlatform SourceChannel { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public string? Notes { get; set; }
    public Guid? AssignedUserId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? DeliveryAddress { get; set; }

    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = [];
}
