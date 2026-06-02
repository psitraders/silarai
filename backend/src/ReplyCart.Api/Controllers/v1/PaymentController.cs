using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Orders;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Razorpay payment integration for the public storefront checkout.
/// Uses each tenant's own Razorpay credentials stored in the Business record.
/// </summary>
[ApiController]
[Route("api/v1/public/{slug}/payment")]
public class PaymentController(
    AppDbContext db,
    ITenantContext tenantContext) : ControllerBase
{
    // ── helpers ───────────────────────────────────────────────────────────────

    private async Task<(string KeyId, string KeySecret, string Currency)?> GetTenantRazorpay(CancellationToken ct)
    {
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        if (business == null
            || string.IsNullOrWhiteSpace(business.RazorpayKeyId)
            || string.IsNullOrWhiteSpace(business.RazorpayKeySecret))
            return null;

        return (business.RazorpayKeyId, business.RazorpayKeySecret, business.Currency ?? "INR");
    }

    // ── 1. Public payment config (keyId only — never expose secret) ──────────

    [HttpGet("config")]
    public async Task<IActionResult> GetConfig(string slug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        var creds = await GetTenantRazorpay(ct);
        return Ok(new
        {
            razorpayEnabled = creds.HasValue,
            keyId           = creds?.KeyId,
            currency        = creds?.Currency ?? "INR"
        });
    }

    // ── 2. Create Razorpay order ──────────────────────────────────────────────

    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder(
        string slug,
        [FromBody] CreatePaymentOrderRequest request,
        CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        var creds = await GetTenantRazorpay(ct);
        if (creds == null)
            return BadRequest(new { errors = new[] { "Online payments are not configured for this store yet." } });

        var (keyId, keySecret, currency) = creds.Value;

        var amountPaise = (long)(request.Amount * 100);

        using var http        = new HttpClient();
        var credentials       = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{keyId}:{keySecret}"));
        http.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);

        var payload = JsonSerializer.Serialize(new
        {
            amount   = amountPaise,
            currency,
            receipt  = $"rcpt_{Guid.NewGuid().ToString()[..8]}",
            notes    = new { customerName = request.CustomerName, customerPhone = request.CustomerPhone }
        });

        var response = await http.PostAsync(
            "https://api.razorpay.com/v1/orders",
            new StringContent(payload, Encoding.UTF8, "application/json"),
            ct);

        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync(ct);
            return BadRequest(new { errors = new[] { $"Razorpay error: {err}" } });
        }

        var body = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(body);
        var razorpayOrderId = doc.RootElement.GetProperty("id").GetString();

        var business = await db.Businesses.FirstOrDefaultAsync(ct);

        return Ok(new
        {
            razorpayOrderId,
            amount       = amountPaise,
            currency,
            keyId,
            businessName = business?.Name ?? "Store"
        });
    }

    // ── 3. Verify payment + create internal order ─────────────────────────────

    [HttpPost("verify")]
    public async Task<IActionResult> VerifyPayment(
        string slug,
        [FromBody] VerifyPaymentRequest request,
        CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        var creds = await GetTenantRazorpay(ct);
        if (creds == null)
            return BadRequest(new { errors = new[] { "Payment configuration missing." } });

        var (_, keySecret, _) = creds.Value;

        // Verify HMAC-SHA256 signature
        var signatureData = $"{request.RazorpayOrderId}|{request.RazorpayPaymentId}";
        using var hmac    = new HMACSHA256(Encoding.UTF8.GetBytes(keySecret));
        var hash          = hmac.ComputeHash(Encoding.UTF8.GetBytes(signatureData));
        var computedSig   = Convert.ToHexString(hash).ToLower();

        if (computedSig != request.RazorpaySignature.ToLower())
            return BadRequest(new { errors = new[] { "Payment signature verification failed." } });

        // Build order
        var tenantId    = tenantContext.CurrentTenantId;
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        var totalAmount = request.Items.Sum(i => i.Quantity * i.UnitPrice);

        // Upsert customer
        ReplyCart.Domain.Customers.Customer? customer = null;
        if (!string.IsNullOrWhiteSpace(request.CustomerPhone))
            customer = await db.Customers
                .FirstOrDefaultAsync(c => c.PhoneNumber == request.CustomerPhone, ct);

        if (customer != null)
        {
            customer.TotalOrders++;
            customer.TotalSpend   += totalAmount;
            customer.LastOrderDate = DateTime.UtcNow;
        }
        else if (!string.IsNullOrWhiteSpace(request.CustomerName))
        {
            customer = new ReplyCart.Domain.Customers.Customer
            {
                TenantId         = tenantId,
                Name             = request.CustomerName,
                PhoneNumber      = request.CustomerPhone ?? string.Empty,
                Email            = request.CustomerEmail,
                TotalOrders      = 1,
                TotalSpend       = totalAmount,
                LastOrderDate    = DateTime.UtcNow,
                PreferredChannel = SocialPlatform.Direct
            };
            db.Customers.Add(customer);
        }

        var items = request.Items.Select(i => new OrderItem
        {
            TenantId     = tenantId,
            ProductId    = i.ProductId,
            ProductTitle = i.ProductTitle,
            VariantInfo  = i.VariantInfo,
            Quantity     = i.Quantity,
            UnitPrice    = i.UnitPrice,
            TotalPrice   = i.Quantity * i.UnitPrice
        }).ToList();

        var order = new Order
        {
            TenantId        = tenantId,
            OrderNumber     = orderNumber,
            CustomerId      = customer?.Id,
            SourceChannel   = SocialPlatform.Direct,
            CustomerName    = request.CustomerName,
            CustomerPhone   = request.CustomerPhone,
            DeliveryAddress = request.DeliveryAddress,
            Notes           = $"Paid online via Razorpay | Payment ID: {request.RazorpayPaymentId}",
            TotalAmount     = totalAmount,
            Items           = items
        };

        order.StatusHistory.Add(new OrderStatusHistory
        {
            TenantId   = tenantId,
            OrderId    = order.Id,
            FromStatus = OrderStatus.New,
            ToStatus   = OrderStatus.New,
            Note       = $"Order placed via storefront checkout. Razorpay Payment ID: {request.RazorpayPaymentId}"
        });

        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        return Ok(new
        {
            success     = true,
            orderNumber = order.OrderNumber,
            orderId     = order.Id,
            message     = "Payment successful! Your order has been placed."
        });
    }
}

public record CreatePaymentOrderRequest(
    decimal Amount,
    string? CustomerName,
    string? CustomerPhone);

public record VerifyPaymentRequest(
    string RazorpayOrderId,
    string RazorpayPaymentId,
    string RazorpaySignature,
    string? CustomerName,
    string? CustomerPhone,
    string? CustomerEmail,
    string? DeliveryAddress,
    IEnumerable<PaymentOrderItem> Items);

public record PaymentOrderItem(
    Guid ProductId,
    string ProductTitle,
    string? VariantInfo,
    int Quantity,
    decimal UnitPrice);
