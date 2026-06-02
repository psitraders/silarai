using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Common.Models;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Orders.Queries;

public record OrderListDto(
    Guid Id, string OrderNumber, string? CustomerName, string? CustomerPhone,
    decimal TotalAmount, string Status, string PaymentStatus,
    string SourceChannel, DateTime CreatedAt, int ItemCount
);

public record GetOrdersQuery(
    int Page = 1, int PageSize = 20,
    string? Status = null, string? Search = null
) : IRequest<PagedList<OrderListDto>>;

public class GetOrdersQueryHandler(IAppDbContext db) : IRequestHandler<GetOrdersQuery, PagedList<OrderListDto>>
{
    public async Task<PagedList<OrderListDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        // Do NOT Include(o => o.Items) — that loads every item row into memory.
        // Instead, project ItemCount as a correlated subquery that stays server-side.
        var query = db.Orders.AsQueryable();

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<OrderStatus>(request.Status, out var status))
            query = query.Where(o => o.Status == status);

        if (!string.IsNullOrEmpty(request.Search))
            query = query.Where(o => o.OrderNumber.Contains(request.Search) ||
                (o.CustomerName != null && o.CustomerName.Contains(request.Search)));

        var projected = query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderListDto(
                o.Id, o.OrderNumber, o.CustomerName, o.CustomerPhone,
                o.TotalAmount, o.Status.ToString(), o.PaymentStatus.ToString(),
                o.SourceChannel.ToString(), o.CreatedAt,
                db.OrderItems.Count(i => i.OrderId == o.Id)
            ));

        return await PagedList<OrderListDto>.CreateAsync(projected, request.Page, request.PageSize);
    }
}
