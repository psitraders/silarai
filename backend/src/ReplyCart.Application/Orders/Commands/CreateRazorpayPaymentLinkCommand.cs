using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Orders.Commands;

/// <summary>
/// Creates a payment link for the given order using the tenant's configured gateway
/// (Razorpay / Stripe / PayPal). Returns the hosted payment URL.
/// </summary>
public record CreateRazorpayPaymentLinkCommand(Guid OrderId) : IRequest<string>;

public class CreateRazorpayPaymentLinkCommandHandler(
    IAppDbContext      db,
    ITenantContext     tenantContext,
    IRazorpayService   razorpay,
    IStripeService     stripe,
    IPayPalService     payPal)
    : IRequestHandler<CreateRazorpayPaymentLinkCommand, string>
{
    public async Task<string> Handle(CreateRazorpayPaymentLinkCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var order = await db.Orders
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order", request.OrderId);

        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantId, cancellationToken)
            ?? throw new InvalidOperationException("Business profile not found.");

        var currency = business.Currency ?? "INR";
        var gateway  = business.PaymentGateway ?? "Razorpay";

        return gateway switch
        {
            "Stripe" when !string.IsNullOrWhiteSpace(business.StripeSecretKey) =>
                await stripe.CreateCheckoutSessionAsync(
                    secretKey:     business.StripeSecretKey!,
                    currency:      currency,
                    orderId:       order.Id,
                    orderNumber:   order.OrderNumber,
                    amount:        order.TotalAmount,
                    customerEmail: null,
                    businessName:  business.Name,
                    cancellationToken: cancellationToken),

            "PayPal" when !string.IsNullOrWhiteSpace(business.PayPalClientId)
                       && !string.IsNullOrWhiteSpace(business.PayPalClientSecret) =>
                await payPal.CreateInvoiceLinkAsync(
                    clientId:      business.PayPalClientId!,
                    clientSecret:  business.PayPalClientSecret!,
                    useSandbox:    business.PayPalSandbox,
                    currency:      currency,
                    orderId:       order.Id,
                    orderNumber:   order.OrderNumber,
                    amount:        order.TotalAmount,
                    customerName:  order.CustomerName,
                    customerEmail: null,
                    businessName:  business.Name,
                    cancellationToken: cancellationToken),

            // Default → Razorpay
            _ when !string.IsNullOrWhiteSpace(business.RazorpayKeyId)
                && !string.IsNullOrWhiteSpace(business.RazorpayKeySecret) =>
                await razorpay.CreatePaymentLinkAsync(
                    keyId:         business.RazorpayKeyId!,
                    keySecret:     business.RazorpayKeySecret!,
                    currency:      currency,
                    orderId:       order.Id,
                    orderNumber:   order.OrderNumber,
                    amount:        order.TotalAmount,
                    customerName:  order.CustomerName,
                    customerPhone: order.CustomerPhone,
                    businessName:  business.Name,
                    cancellationToken: cancellationToken),

            _ => throw new InvalidOperationException(
                $"No payment gateway configured for '{gateway}'. " +
                "Add credentials in Settings → Integrations.")
        };
    }
}
