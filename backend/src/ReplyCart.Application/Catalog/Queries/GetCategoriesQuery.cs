using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Catalog.Queries;

public record SubCategoryDto(
    Guid    Id,
    string  Name,
    string? Description,
    string? ImageUrl,
    int     ProductCount,
    bool    IsActive,
    int     SortOrder
);

public record CategoryDto(
    Guid              Id,
    string            Name,
    string?           Description,
    string?           ImageUrl,
    int               ProductCount,
    bool              IsActive,
    int               SortOrder,
    bool              IsFeatured,
    Guid?             ParentCategoryId,
    List<SubCategoryDto> SubCategories
);

public record GetCategoriesQuery : IRequest<List<CategoryDto>>;

public class GetCategoriesQueryHandler(IAppDbContext db) : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        // Load all categories (flat) with product counts in one query
        var all = await db.Categories
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new
            {
                c.Id, c.Name, c.Description, c.ImageUrl,
                c.IsActive, c.SortOrder, c.IsFeatured, c.ParentCategoryId,
                ProductCount = db.Products.Count(p => p.CategoryId == c.Id)
            })
            .ToListAsync(cancellationToken);

        // Build parent DTOs (root categories = ParentCategoryId == null)
        var subMap = all
            .Where(c => c.ParentCategoryId != null)
            .GroupBy(c => c.ParentCategoryId!.Value)
            .ToDictionary(
                g => g.Key,
                g => g.Select(c => new SubCategoryDto(
                    c.Id, c.Name, c.Description, c.ImageUrl,
                    c.ProductCount, c.IsActive, c.SortOrder
                )).ToList()
            );

        return all
            .Where(c => c.ParentCategoryId == null)
            .Select(c => new CategoryDto(
                c.Id, c.Name, c.Description, c.ImageUrl,
                c.ProductCount, c.IsActive, c.SortOrder,
                c.IsFeatured, null,
                subMap.TryGetValue(c.Id, out var subs) ? subs : []
            ))
            .ToList();
    }
}
