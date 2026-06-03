namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// Abstracts Stripe Checkout Session creation for the Application layer.
/// </summary>
public interface IStripeService
{
    /// <summary>
    /// Creates a Stripe Checkout Session and returns the hosted checkout URL.
    /// Throws <see cref="InvalidOperationException"/> on API failure.
    /// </summary>
    Task<string> CreateCheckoutSessionAsync(
        string   secretKey,
        string   currency,
        Guid     orderId,
        string   orderNumber,
        decimal  amount,
        string?  customerEmail,
        string   businessName,
        CancellationToken cancellationToken = default);
}


