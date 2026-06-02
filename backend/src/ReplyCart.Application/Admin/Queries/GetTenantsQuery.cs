using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Common.Models;

namespace ReplyCart.Application.Admin.Queries;

public record TenantAdminDto(
    Guid Id, string Name, string Slug, string ContactEmail,
    bool IsActive, string? PlanName, DateTime CreatedAt,
    int ProductCount, int LeadCount
);

public record GetTenantsQuery(int Page = 1, int PageSize = 20, string? Search = null)
    : IRequest<PagedList<TenantAdminDto>>;

public class GetTenantsQueryHandler(IAppDbContext db) : IRequestHandler<GetTenantsQuery, PagedList<TenantAdminDto>>
{
    public async Task<PagedList<TenantAdminDto>> Handle(GetTenantsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Tenants.AsQueryable();

        if (!string.IsNullOrEmpty(request.Search))
            query = query.Where(t => t.Name.Contains(request.Search) ||
                t.Slug.Contains(request.Search) || t.ContactEmail.Contains(request.Search));

        var projected = query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TenantAdminDto(
                t.Id, t.Name, t.Slug, t.ContactEmail, t.IsActive,
                db.TenantSubscriptions
                    .Where(ts => ts.TenantId == t.Id)
                    .Join(db.SubscriptionPlans, ts => ts.PlanId, p => p.Id, (ts, p) => p.Name)
                    .FirstOrDefault(),
                t.CreatedAt,
                db.Products.IgnoreQueryFilters().Count(p => p.TenantId == t.Id && !p.IsDeleted),
                db.Leads.IgnoreQueryFilters().Count(l => l.TenantId == t.Id && !l.IsDeleted)
            ));

        return await PagedList<TenantAdminDto>.CreateAsync(projected, request.Page, request.PageSize);
    }
}
