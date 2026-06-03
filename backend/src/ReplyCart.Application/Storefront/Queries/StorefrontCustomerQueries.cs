using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Storefront.Queries;

// ── Get My Orders ─────────────────────────────────────────────────────────────

public record GetStorefrontOrdersQuery(Guid CustomerId, Guid TenantId) : IRequest<List<StorefrontOrderDto>>;

public record StorefrontOrderDto(
    Guid Id,
    string OrderNumber,
    string Status,
    string PaymentStatus,
    decimal TotalAmount,
    decimal? DiscountAmount,
    string? Notes,
    string? DeliveryAddress,
    DateTime CreatedAt,
    List<StorefrontOrderItemDto> Items
);

public record StorefrontOrderItemDto(
    Guid ProductId,
    string ProductTitle,
    int Quantity,
    decimal UnitPrice,
    string? ImageUrl
);

public class GetStorefrontOrdersHandler(IAppDbContext db)
    : IRequestHandler<GetStorefrontOrdersQuery, List<StorefrontOrderDto>>
{
    public async Task<List<StorefrontOrderDto>> Handle(GetStorefrontOrdersQuery req, CancellationToken ct)
    {
        // Find orders linked to this storefront customer via phone or CRM customer id
        var customer = await db.StorefrontCustomers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == req.CustomerId && c.TenantId == req.TenantId, ct);

        if (customer == null) return [];

        // Match orders by linked CRM customer ID, or by email/phone
        var query = db.Orders
            .AsNoTracking()
            .Where(o => o.TenantId == req.TenantId)
            .AsQueryable();

        if (customer.LinkedCrmCustomerId.HasValue)
            query = query.Where(o => o.CustomerId == customer.LinkedCrmCustomerId);
        else if (!string.IsNullOrWhiteSpace(customer.PhoneNumber))
            query = query.Where(o => o.CustomerPhone != null && o.CustomerPhone.Contains(
                new string(customer.PhoneNumber.Where(char.IsDigit).ToArray())));
        else
            return [];

        var orders = await query
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(50)
            .ToListAsync(ct);

        return orders.Select(o => new StorefrontOrderDto(
            o.Id,
            o.OrderNumber,
            o.Status.ToString(),
            o.PaymentStatus.ToString(),
            o.TotalAmount,
            o.DiscountAmount,
            o.Notes,
            o.DeliveryAddress,
            o.CreatedAt,
            o.Items.Select(i => new StorefrontOrderItemDto(
                i.ProductId,
                i.ProductTitle,
                i.Quantity,
                i.UnitPrice,
                null
            )).ToList()
        )).ToList();
    }
}

// ── Get Profile ───────────────────────────────────────────────────────────────

public record GetStorefrontProfileQuery(Guid CustomerId, Guid TenantId) : IRequest<StorefrontProfileDto?>;

public record StorefrontProfileDto(
    Guid Id,
    string Name,
    string Email,
    string? PhoneNumber,
    string? Address,
    string? City,
    string? State,
    string? PinCode,
    bool IsB2BCustomer,
    bool IsB2BApproved,
    string? CompanyName,
    string? GstNumber,
    int LoyaltyPoints
);

public class GetStorefrontProfileHandler(IAppDbContext db)
    : IRequestHandler<GetStorefrontProfileQuery, StorefrontProfileDto?>
{
    public async Task<StorefrontProfileDto?> Handle(GetStorefrontProfileQuery req, CancellationToken ct)
    {
        var c = await db.StorefrontCustomers.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == req.CustomerId && x.TenantId == req.TenantId, ct);
        if (c == null) return null;

        return new StorefrontProfileDto(c.Id, c.Name, c.Email, c.PhoneNumber,
            c.Address, c.City, c.State, c.PinCode,
            c.IsB2BCustomer, c.IsB2BApproved, c.CompanyName, c.GstNumber, c.LoyaltyPoints);
    }
}


