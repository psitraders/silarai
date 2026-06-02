using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Orders;

namespace ReplyCart.Application.Orders.Queries;

public record OrderDetailDto(
    Guid Id, string OrderNumber, string? CustomerName, string? CustomerPhone,
    decimal TotalAmount, string Status, string PaymentStatus,
    string SourceChannel, string? Notes, string? DeliveryAddress, DateTime CreatedAt,
    List<OrderItemDto> Items,
    List<OrderPaymentDto> Payments,
    List<OrderHistoryDto> StatusHistory
);
public record OrderItemDto(Guid Id, Guid ProductId, string ProductTitle, string? VariantInfo, int Quantity, decimal UnitPrice, decimal TotalPrice);
public record OrderPaymentDto(Guid Id, decimal Amount, string Method, string? ReferenceNumber, DateTime PaidAt);
public record OrderHistoryDto(Guid Id, string FromStatus, string ToStatus, string? Note, DateTime CreatedAt);

public record GetOrderByIdQuery(Guid Id) : IRequest<OrderDetailDto>;

public class GetOrderByIdQueryHandler(IAppDbContext db) : IRequestHandler<GetOrderByIdQuery, OrderDetailDto>
{
    public async Task<OrderDetailDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var o = await db.Orders
            .Include(x => x.Items)
            .Include(x => x.Payments)
            .Include(x => x.StatusHistory.OrderByDescending(h => h.CreatedAt))
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Order), request.Id);

        return new OrderDetailDto(
            o.Id, o.OrderNumber, o.CustomerName, o.CustomerPhone,
            o.TotalAmount, o.Status.ToString(), o.PaymentStatus.ToString(),
            o.SourceChannel.ToString(), o.Notes, o.DeliveryAddress, o.CreatedAt,
            o.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.ProductTitle, i.VariantInfo, i.Quantity, i.UnitPrice, i.TotalPrice)).ToList(),
            o.Payments.OrderByDescending(p => p.PaidAt).Select(p => new OrderPaymentDto(p.Id, p.Amount, p.Method, p.ReferenceNumber, p.PaidAt)).ToList(),
            o.StatusHistory.Select(h => new OrderHistoryDto(h.Id, h.FromStatus.ToString(), h.ToStatus.ToString(), h.Note, h.CreatedAt)).ToList()
        );
    }
}
