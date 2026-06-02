using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Storefront;

namespace ReplyCart.Application.Customers.Commands;

/// <summary>
/// Approves (or revokes) the B2B status of a storefront customer identified by their
/// linked CRM Customer ID.  The merchant calls this from the B2B Customers tab.
/// </summary>
public record ApproveB2BCustomerCommand(Guid CrmCustomerId, bool Approve = true) : IRequest;

public class ApproveB2BCustomerCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<ApproveB2BCustomerCommand>
{
    public async Task Handle(ApproveB2BCustomerCommand request, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var sc = await db.StorefrontCustomers
            .FirstOrDefaultAsync(
                s => s.TenantId == tenantId
                  && s.LinkedCrmCustomerId == request.CrmCustomerId
                  && s.IsB2BCustomer,
                ct)
            ?? throw new NotFoundException(nameof(StorefrontCustomer), request.CrmCustomerId);

        sc.IsB2BApproved = request.Approve;
        await db.SaveChangesAsync(ct);
    }
}
