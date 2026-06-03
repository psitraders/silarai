namespace ReplyCart.Application.Common.Interfaces;

/// <summary>Single line-item used in owner order-notification emails.</summary>
public record OrderNotificationItem(string Title, string? VariantInfo, int Qty, decimal UnitPrice);

public interface IEmailService
{
    Task SendEmailVerificationAsync(string toEmail, string toName, string token, CancellationToken ct = default);
    Task SendPasswordResetAsync(string toEmail, string toName, string token, CancellationToken ct = default);

    /// <summary>
    /// Sends a 6-digit OTP to the given email for registration verification.
    /// From: support@silarai.app
    /// </summary>
    Task SendRegistrationOtpAsync(string toEmail, string toName, string otp, CancellationToken ct = default);

    /// <summary>
    /// Sends a 6-digit OTP to confirm a Cash-on-Delivery order.
    /// Branded with the seller's store name so the customer recognises the email.
    /// </summary>
    Task SendCodOtpAsync(string toEmail, string toName, string storeName, string otp, CancellationToken ct = default);

    // ── Customer-facing ────────────────────────────────────────────────────────

    /// <summary>
    /// Sends an order confirmation / bill email to the customer after a COD order is placed.
    /// </summary>
    Task SendOrderConfirmationAsync(
        string toEmail,
        string toName,
        string storeName,
        string orderNumber,
        string? deliveryAddress,
        decimal totalAmount,
        string currency,
        IEnumerable<OrderNotificationItem> items,
        string? trackingUrl,
        CancellationToken ct = default);

    // ── Owner / tenant notification emails ─────────────────────────────────────

    /// <summary>
    /// Notifies the store owner when a new inquiry is submitted via the public storefront.
    /// </summary>
    Task SendNewInquiryNotificationAsync(
        string toEmail,
        string ownerName,
        string storeName,
        string customerName,
        string? customerPhone,
        string? customerEmail,
        string channel,
        string? productTitle,
        string? message,
        bool isNewCustomer,
        CancellationToken ct = default);

    /// <summary>
    /// Notifies the store owner when a new COD order is placed (storefront or chatbot).
    /// <paramref name="manageOrderUrl"/> is the direct dashboard link to this specific order.
    /// </summary>
    Task SendNewOrderNotificationAsync(
        string toEmail,
        string ownerName,
        string storeName,
        string orderNumber,
        string customerName,
        string? customerPhone,
        string? customerEmail,
        string? deliveryAddress,
        decimal totalAmount,
        string currency,
        IEnumerable<OrderNotificationItem> items,
        string source,
        bool isNewCustomer,
        string? manageOrderUrl,
        CancellationToken ct = default);

    /// <summary>
    /// Notifies the store owner when the AI chatbot captures a brand-new lead.
    /// </summary>
    Task SendNewLeadNotificationAsync(
        string toEmail,
        string ownerName,
        string storeName,
        string customerName,
        string customerPhone,
        CancellationToken ct = default);

    // ── Platform admin notifications ───────────────────────────────────────────

    /// <summary>
    /// Notifies the ReplyCart platform admin when a tenant requests a plan upgrade.
    /// </summary>
    Task SendUpgradeRequestNotificationAsync(
        string adminEmail,
        string tenantName,
        string tenantEmail,
        string requestedPlanName,
        bool isAnnual,
        decimal pricePaid,
        string reviewUrl,
        CancellationToken ct = default);
}


