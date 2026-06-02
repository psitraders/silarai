using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Customers;

namespace ReplyCart.Application.Customers.Commands;

public record DeleteCustomerCommand(Guid CustomerId) : IRequest;

public class DeleteCustomerCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<DeleteCustomerCommand>
{
    public async Task Handle(DeleteCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId && c.TenantId == tenantContext.CurrentTenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), request.CustomerId);

        customer.IsDeleted = true;
        customer.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
    }
}
