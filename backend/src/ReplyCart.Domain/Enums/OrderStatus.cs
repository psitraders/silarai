namespace ReplyCart.Domain.Enums;

public enum OrderStatus
{
    New = 1,
    Confirmed = 2,
    PaymentPending = 3,
    Paid = 4,
    Packed = 5,
    Delivered = 6,
    Cancelled = 7
}
