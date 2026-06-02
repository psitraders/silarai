namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// Abstracts Razorpay payment link creation so the Application layer stays infrastructure-free.
/// </summary>
public interface IRazorpayService
{
    /// <summary>
    /// Creates a Razorpay payment link and returns the short URL.
    /// Throws <see cref="InvalidOperationException"/> on API failure.
    /// </summary>
    Task<string> CreatePaymentLinkAsync(
        string   keyId,
        string   keySecret,
        string   currency,
        Guid     orderId,
        string   orderNumber,
        decimal  amount,
        string?  customerName,
        string?  customerPhone,
        string   businessName,
        CancellationToken cancellationToken = default);
}
