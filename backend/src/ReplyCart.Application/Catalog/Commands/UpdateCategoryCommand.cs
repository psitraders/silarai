using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Catalog.Commands;

public record UpdateCategoryCommand(Guid Id, string Name, string? Description, string? ImageUrl, bool IsActive, int SortOrder) : IRequest;

public class UpdateCategoryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<UpdateCategoryCommand>
{
    public async Task Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var cat = await db.Categories
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.TenantId == tenantContext.CurrentTenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Category {request.Id} not found.");

        cat.Name = request.Name;
        cat.Description = request.Description;
        if (request.ImageUrl is not null)
            cat.ImageUrl = request.ImageUrl;
        cat.IsActive = request.IsActive;
        cat.SortOrder = request.SortOrder;

        await db.SaveChangesAsync(cancellationToken);
    }
}


