using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Common.Models;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Catalog.Queries;

public record GetProductsQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? CategoryId = null,
    string? Search = null,
    ProductStatus? Status = null
) : IRequest<PagedList<ProductDto>>;

public record ProductDto(
    Guid Id,
    string Title,
    string? Description,
    decimal BasePrice,
    decimal? DiscountedPrice,
    ProductStatus Status,
    bool IsFeatured,
    int? StockQuantity,
    string? CategoryName,
    string? PrimaryImageUrl,
    IEnumerable<string> Tags,
    DateTime CreatedAt
);

public class GetProductsQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetProductsQuery, PagedList<ProductDto>>
{
    public async Task<PagedList<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Tags)
            .Where(p => p.TenantId == tenantContext.CurrentTenantId);

        if (request.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == request.CategoryId);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(p => p.Title.Contains(request.Search) || (p.Sku != null && p.Sku.Contains(request.Search)));

        if (request.Status.HasValue)
            query = query.Where(p => p.Status == request.Status);

        var projected = query.OrderBy(p => p.SortOrder).ThenByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto(
                p.Id,
                p.Title,
                p.Description,
                p.BasePrice,
                p.DiscountedPrice,
                p.Status,
                p.IsFeatured,
                p.StockQuantity,
                p.Category != null ? p.Category.Name : null,
                p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault(),
                p.Tags.Select(t => t.Tag),
                p.CreatedAt
            ));

        return await PagedList<ProductDto>.CreateAsync(projected, request.Page, request.PageSize);
    }
}


