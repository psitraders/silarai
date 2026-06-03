using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;

namespace ReplyCart.Application.Catalog.Queries;

public record ProductImageDto(Guid Id, string Url, string? AltText, int SortOrder, bool IsPrimary);
public record ProductVariantItemDto(Guid Id, string Name, string Value, decimal? PriceAdjustment, int? StockQuantity, bool IsAvailable);

public record ProductDetailDto(
    Guid Id, string Title, string? Description, decimal BasePrice, decimal? DiscountedPrice,
    string Status, bool IsFeatured, int? StockQuantity, Guid? CategoryId, string? CategoryName,
    string? Attributes, List<string> Tags, List<ProductImageDto> Images,
    List<ProductVariantItemDto> Variants, DateTime CreatedAt
);

public record GetProductByIdQuery(Guid Id) : IRequest<ProductDetailDto>;

public class GetProductByIdQueryHandler(IAppDbContext db) : IRequestHandler<GetProductByIdQuery, ProductDetailDto>
{
    public async Task<ProductDetailDto> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var p = await db.Products
            .Include(x => x.Tags)
            .Include(x => x.Images)
            .Include(x => x.Category)
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), request.Id);

        return new ProductDetailDto(
            p.Id, p.Title, p.Description, p.BasePrice, p.DiscountedPrice,
            p.Status.ToString(), p.IsFeatured, p.StockQuantity,
            p.CategoryId, p.Category?.Name,
            p.Attributes,
            p.Tags.Select(t => t.Tag).ToList(),
            p.Images.OrderBy(i => i.SortOrder).Select(i => new ProductImageDto(i.Id, i.Url, i.AltText, i.SortOrder, i.IsPrimary)).ToList(),
            p.Variants.OrderBy(v => v.Name).ThenBy(v => v.Value)
                .Select(v => new ProductVariantItemDto(v.Id, v.Name, v.Value, v.PriceAdjustment, v.StockQuantity, v.IsAvailable)).ToList(),
            p.CreatedAt
        );
    }
}


