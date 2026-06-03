using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Customers.Queries;

public record CustomerDetailDto(
    Guid Id,
    string Name,
    string PhoneNumber,
    string? Email,
    string? Address,
    string? City,
    string? Notes,
    string? Tags,
    DateOnly? Birthday,
    DateOnly? Anniversary,
    int TotalOrders,
    decimal TotalSpend,
    DateTime? LastOrderDate,
    DateTime CreatedAt,
    IEnumerable<CustomerOrderSummary> RecentOrders,
    IEnumerable<CustomerLeadSummary> RecentLeads
);

public record CustomerOrderSummary(Guid Id, string OrderNumber, string Status, decimal TotalAmount, DateTime CreatedAt);
public record CustomerLeadSummary(Guid Id, string Status, string? InquiryNote, DateTime CreatedAt);

public record GetCustomerDetailQuery(Guid CustomerId) : IRequest<CustomerDetailDto>;

public class GetCustomerDetailHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetCustomerDetailQuery, CustomerDetailDto>
{
    public async Task<CustomerDetailDto> Handle(GetCustomerDetailQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var customer = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId && c.TenantId == tenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Customer {request.CustomerId} not found.");

        var recentOrders = await db.Orders
            .Where(o => o.CustomerId == customer.Id)
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new CustomerOrderSummary(o.Id, o.OrderNumber, o.Status.ToString(), o.TotalAmount, o.CreatedAt))
            .ToListAsync(cancellationToken);

        var recentLeads = await db.Leads
            .Where(l => l.CustomerId == customer.Id || l.CustomerPhone == customer.PhoneNumber)
            .OrderByDescending(l => l.CreatedAt)
            .Take(5)
            .Select(l => new CustomerLeadSummary(l.Id, l.Status.ToString(), l.InquiryNote, l.CreatedAt))
            .ToListAsync(cancellationToken);

        return new CustomerDetailDto(
            customer.Id, customer.Name, customer.PhoneNumber, customer.Email,
            customer.Address, customer.City, customer.Notes, customer.Tags,
            customer.Birthday, customer.Anniversary,
            customer.TotalOrders, customer.TotalSpend, customer.LastOrderDate,
            customer.CreatedAt, recentOrders, recentLeads
        );
    }
}


