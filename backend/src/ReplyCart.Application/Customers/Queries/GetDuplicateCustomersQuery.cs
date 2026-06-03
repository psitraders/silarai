using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Customers.Queries;

public record DuplicateGroupDto(
    string PhoneNumber,
    IEnumerable<CustomerDto> Customers
);

public record GetDuplicateCustomersQuery : IRequest<IEnumerable<DuplicateGroupDto>>;

public class GetDuplicateCustomersQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetDuplicateCustomersQuery, IEnumerable<DuplicateGroupDto>>
{
    public async Task<IEnumerable<DuplicateGroupDto>> Handle(
        GetDuplicateCustomersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        // Load all customers, group by phone, return groups with > 1 member
        var all = await db.Customers
            .Where(c => c.TenantId == tenantId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CustomerDto(c.Id, c.Name, c.PhoneNumber, c.Email, c.TotalOrders, c.TotalSpend, c.CreatedAt))
            .ToListAsync(cancellationToken);

        var duplicates = all
            .GroupBy(c => c.PhoneNumber.Trim())
            .Where(g => g.Count() > 1)
            .Select(g => new DuplicateGroupDto(g.Key, g.ToList()))
            .ToList();

        return duplicates;
    }
}


