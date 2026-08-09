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
public record B2BApprovalResult(string Email, string Name, bool Approved);

public record ApproveB2BCustomerCommand(Guid CrmCustomerId, bool Approve = true) : IRequest<B2BApprovalResult>;

public class ApproveB2BCustomerCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<ApproveB2BCustomerCommand, B2BApprovalResult>
{
    public async Task<B2BApprovalResult> Handle(ApproveB2BCustomerCommand request, CancellationToken ct)
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

        return new B2BApprovalResult(sc.Email, sc.Name, request.Approve);
    }
}


