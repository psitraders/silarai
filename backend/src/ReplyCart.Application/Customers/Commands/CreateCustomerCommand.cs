using MediatR;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Customers;

namespace ReplyCart.Application.Customers.Commands;

public record CreateCustomerCommand(
    string Name,
    string PhoneNumber,
    string? Email,
    string? Address,
    string? City,
    string? Notes,
    string? Tags
) : IRequest<Guid>;

public class CreateCustomerCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateCustomerCommand, Guid>
{
    public async Task<Guid> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = new Customer
        {
            TenantId    = tenantContext.CurrentTenantId,
            Name        = request.Name.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            Email       = request.Email?.Trim(),
            Address     = request.Address?.Trim(),
            City        = request.City?.Trim(),
            Notes       = request.Notes?.Trim(),
            Tags        = request.Tags?.Trim(),
        };
        db.Customers.Add(customer);
        await db.SaveChangesAsync(cancellationToken);
        return customer.Id;
    }
}
