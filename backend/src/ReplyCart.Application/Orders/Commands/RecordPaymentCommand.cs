using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Orders;

namespace ReplyCart.Application.Orders.Commands;

public record RecordPaymentCommand(
    Guid OrderId,
    decimal Amount,
    string Method,
    string? ReferenceNumber,
    string? Notes
) : IRequest;

public class RecordPaymentHandler(IAppDbContext db, ICurrentUser currentUser)
    : IRequestHandler<RecordPaymentCommand>
{
    public async Task Handle(RecordPaymentCommand request, CancellationToken cancellationToken)
    {
        var order = await db.Orders
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"Order {request.OrderId} not found.");

        db.Payments.Add(new Payment
        {
            Id = Guid.NewGuid(),
            TenantId = order.TenantId,
            OrderId = order.Id,
            Amount = request.Amount,
            Method = request.Method,
            ReferenceNumber = request.ReferenceNumber,
            Notes = request.Notes,
            PaidAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUser.UserId,
        });

        // Auto-mark as Paid if payment covers total
        var totalPaid = await db.Payments
            .Where(p => p.OrderId == order.Id)
            .SumAsync(p => p.Amount, cancellationToken) + request.Amount;

        if (totalPaid >= order.TotalAmount)
            order.PaymentStatus = PaymentStatus.Paid;
        else
            order.PaymentStatus = PaymentStatus.Partial;

        await db.SaveChangesAsync(cancellationToken);
    }
}
