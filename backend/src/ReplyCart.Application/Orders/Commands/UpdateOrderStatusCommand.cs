using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Orders;

namespace ReplyCart.Application.Orders.Commands;

public record UpdateOrderStatusCommand(Guid Id, OrderStatus Status, PaymentStatus? PaymentStatus, string? Note) : IRequest;

public class UpdateOrderStatusCommandHandler(IAppDbContext db, ICurrentUser currentUser)
    : IRequestHandler<UpdateOrderStatusCommand>
{
    public async Task Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Order), request.Id);

        var previous = order.Status;
        order.Status = request.Status;
        if (request.PaymentStatus.HasValue)
            order.PaymentStatus = request.PaymentStatus.Value;

        db.OrderStatusHistories.Add(new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            TenantId = order.TenantId,
            OrderId = order.Id,
            FromStatus = previous,
            ToStatus = request.Status,
            Note = request.Note,
            ChangedBy = currentUser.UserId ?? Guid.Empty
        });

        await db.SaveChangesAsync(cancellationToken);
    }
}


