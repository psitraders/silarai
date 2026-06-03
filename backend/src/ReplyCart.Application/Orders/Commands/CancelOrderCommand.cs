using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Orders;

namespace ReplyCart.Application.Orders.Commands;

public record CancelOrderCommand(Guid OrderId, string? Reason) : IRequest;

public class CancelOrderHandler(IAppDbContext db, ICurrentUser currentUser)
    : IRequestHandler<CancelOrderCommand>
{
    public async Task Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await db.Orders
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Order {request.OrderId} not found.");

        if (order.Status == OrderStatus.Cancelled)
            return; // idempotent

        var previous = order.Status;
        order.Status = OrderStatus.Cancelled;

        db.OrderStatusHistories.Add(new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            TenantId = order.TenantId,
            OrderId = order.Id,
            FromStatus = previous,
            ToStatus = OrderStatus.Cancelled,
            Note = request.Reason,
            ChangedBy = currentUser.UserId ?? Guid.Empty,
            CreatedAt = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(cancellationToken);
    }
}


