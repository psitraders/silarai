using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Catalog.Queries;

public record CategoryDto(Guid Id, string Name, string? Description, string? ImageUrl, int ProductCount, bool IsActive, int SortOrder);

public record GetCategoriesQuery : IRequest<List<CategoryDto>>;

public class GetCategoriesQueryHandler(IAppDbContext db) : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        // OrderBy MUST come before Select — after Select, 'c' is CategoryDto (not an entity)
        // and EF Core cannot translate DTO property access to SQL.
        return await db.Categories
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryDto(
                c.Id, c.Name, c.Description, c.ImageUrl,
                db.Products.Count(p => p.CategoryId == c.Id),
                c.IsActive, c.SortOrder
            ))
            .ToListAsync(cancellationToken);
    }
}
