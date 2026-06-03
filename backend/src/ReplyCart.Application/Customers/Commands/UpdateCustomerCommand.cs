using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Customers;

namespace ReplyCart.Application.Customers.Commands;

public record UpdateCustomerCommand(
    Guid     CustomerId,
    string   Name,
    string   PhoneNumber,
    string?  Email,
    string?  Address,
    string?  City,
    string?  Notes,
    string?  Tags,
    DateOnly? Birthday    = null,
    DateOnly? Anniversary = null
) : IRequest;

public class UpdateCustomerCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<UpdateCustomerCommand>
{
    public async Task Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId && c.TenantId == tenantContext.CurrentTenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), request.CustomerId);

        customer.Name        = request.Name.Trim();
        customer.PhoneNumber = request.PhoneNumber.Trim();
        customer.Email       = request.Email?.Trim();
        customer.Address     = request.Address?.Trim();
        customer.City        = request.City?.Trim();
        customer.Notes       = request.Notes?.Trim();
        customer.Tags        = request.Tags?.Trim();
        customer.Birthday    = request.Birthday;
        customer.Anniversary = request.Anniversary;

        await db.SaveChangesAsync(cancellationToken);
    }
}


