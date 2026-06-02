using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Orders;

public class Payment : TenantEntity
{
    public Guid OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public DateTime PaidAt { get; set; }
    public string? Notes { get; set; }

    public Order Order { get; set; } = null!;
}
