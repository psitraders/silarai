using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Catalog.Commands;

public record DeleteCategoryCommand(Guid Id) : IRequest;

public class DeleteCategoryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<DeleteCategoryCommand>
{
    public async Task Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var cat = await db.Categories
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.TenantId == tenantContext.CurrentTenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Category {request.Id} not found.");

        cat.IsDeleted = true;
        cat.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
    }
}


