using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Common.Models;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Leads.Queries;

public record GetLeadsQuery(
    int Page = 1,
    int PageSize = 20,
    LeadStatus? Status = null,
    SocialPlatform? Channel = null,
    string? Search = null,
    Guid? AssignedUserId = null
) : IRequest<PagedList<LeadDto>>;

public record LeadDto(
    Guid Id,
    string CustomerName,
    string? CustomerPhone,
    SocialPlatform SourceChannel,
    string? InterestedProductTitle,
    LeadStatus Status,
    int Priority,
    DateTime? FollowUpDate,
    DateTime? LastActivityDate,
    DateTime CreatedAt
);

public class GetLeadsQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetLeadsQuery, PagedList<LeadDto>>
{
    public async Task<PagedList<LeadDto>> Handle(GetLeadsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Leads.Where(l => l.TenantId == tenantContext.CurrentTenantId);

        if (request.Status.HasValue)
            query = query.Where(l => l.Status == request.Status);

        if (request.Channel.HasValue)
            query = query.Where(l => l.SourceChannel == request.Channel);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(l => l.CustomerName.Contains(request.Search)
                || (l.CustomerPhone != null && l.CustomerPhone.Contains(request.Search)));

        if (request.AssignedUserId.HasValue)
            query = query.Where(l => l.AssignedUserId == request.AssignedUserId);

        // Use a correlated subquery for product title — keeps everything SQL-side.
        // An in-memory dictionary lookup inside Select() cannot be translated to SQL.
        var projected = query
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new LeadDto(
                l.Id,
                l.CustomerName,
                l.CustomerPhone,
                l.SourceChannel,
                l.InterestedProductId != null
                    ? db.Products
                        .Where(p => p.Id == l.InterestedProductId)
                        .Select(p => p.Title)
                        .FirstOrDefault()
                    : null,
                l.Status,
                l.Priority,
                l.FollowUpDate,
                l.LastActivityDate,
                l.CreatedAt
            ));

        return await PagedList<LeadDto>.CreateAsync(projected, request.Page, request.PageSize);
    }
}
