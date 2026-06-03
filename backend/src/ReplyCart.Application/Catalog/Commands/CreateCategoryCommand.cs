using MediatR;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;

namespace ReplyCart.Application.Catalog.Commands;

public record CreateCategoryCommand(string Name, string? Description, string? ImageUrl) : IRequest<Guid>;

public class CreateCategoryCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateCategoryCommand, Guid>
{
    public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.CurrentTenantId,
            Name = request.Name,
            Description = request.Description,
            ImageUrl = request.ImageUrl
        };
        db.Categories.Add(category);
        await db.SaveChangesAsync(cancellationToken);
        return category.Id;
    }
}


