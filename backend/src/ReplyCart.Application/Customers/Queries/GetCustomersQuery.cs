using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Common.Models;

namespace ReplyCart.Application.Customers.Queries;

public record CustomerDto(
    Guid Id, string Name, string PhoneNumber, string? Email,
    int TotalOrders, decimal TotalSpend, DateTime CreatedAt
);

public record GetCustomersQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    string? Tag = null
) : IRequest<PagedList<CustomerDto>>;

public class GetCustomersQueryHandler(IAppDbContext db)
    : IRequestHandler<GetCustomersQuery, PagedList<CustomerDto>>
{
    public async Task<PagedList<CustomerDto>> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
    {
        var query = db.Customers.AsQueryable();

        if (!string.IsNullOrEmpty(request.Search))
            query = query.Where(c =>
                c.Name.Contains(request.Search) ||
                c.PhoneNumber.Contains(request.Search) ||
                (c.Email != null && c.Email.Contains(request.Search)));

        // Tag filter: Tags is stored as a comma-separated string, e.g. "vip, loyal"
        if (!string.IsNullOrEmpty(request.Tag))
            query = query.Where(c => c.Tags != null && c.Tags.Contains(request.Tag));

        var projected = query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CustomerDto(
                c.Id, c.Name, c.PhoneNumber, c.Email,
                c.TotalOrders, c.TotalSpend, c.CreatedAt
            ));

        return await PagedList<CustomerDto>.CreateAsync(projected, request.Page, request.PageSize);
    }
}


