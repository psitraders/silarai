namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// Abstracts PayPal Invoice creation for the Application layer.
/// </summary>
public interface IPayPalService
{
    /// <summary>
    /// Creates a PayPal Invoice, sends it, and returns the payer-view URL.
    /// Throws <see cref="InvalidOperationException"/> on API failure.
    /// </summary>
    Task<string> CreateInvoiceLinkAsync(
        string   clientId,
        string   clientSecret,
        bool     useSandbox,
        string   currency,
        Guid     orderId,
        string   orderNumber,
        decimal  amount,
        string?  customerName,
        string?  customerEmail,
        string   businessName,
        CancellationToken cancellationToken = default);
}
