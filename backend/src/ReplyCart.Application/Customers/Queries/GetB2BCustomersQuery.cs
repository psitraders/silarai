using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Customers.Queries;

public record B2BCustomerDto(
    Guid   CrmCustomerId,
    Guid   StorefrontCustomerId,
    string Name,
    string? Email,
    string PhoneNumber,
    string? CompanyName,
    string? GstNumber,
    bool   IsB2BApproved,
    int    TotalOrders,
    decimal TotalSpend,
    DateTime CreatedAt
);

public record GetB2BCustomersQuery : IRequest<List<B2BCustomerDto>>;

public class GetB2BCustomersQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetB2BCustomersQuery, List<B2BCustomerDto>>
{
    public async Task<List<B2BCustomerDto>> Handle(GetB2BCustomersQuery request, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        // Join CRM Customers ↔ StorefrontCustomers where B2B flag is set.
        // Global query filters on both DbSets handle IsDeleted + TenantId.
        var result = await (
            from c in db.Customers.Where(c => c.TenantId == tenantId)
            join sc in db.StorefrontCustomers
                .Where(s => s.TenantId == tenantId && s.IsB2BCustomer && s.LinkedCrmCustomerId != null)
                on c.Id equals sc.LinkedCrmCustomerId
            orderby sc.IsB2BApproved, c.Name
            select new B2BCustomerDto(
                c.Id,
                sc.Id,
                c.Name,
                c.Email,
                c.PhoneNumber,
                sc.CompanyName,
                sc.GstNumber,
                sc.IsB2BApproved,
                c.TotalOrders,
                c.TotalSpend,
                c.CreatedAt
            )
        ).ToListAsync(ct);

        return result;
    }
}


