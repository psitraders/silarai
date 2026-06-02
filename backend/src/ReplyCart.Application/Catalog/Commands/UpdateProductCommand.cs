using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Catalog.Commands;

public record UpdateProductCommand(
    Guid Id,
    string Title,
    string? Description,
    decimal BasePrice,
    decimal? DiscountedPrice,
    ProductStatus Status,
    bool IsFeatured,
    int? StockQuantity,
    Guid? CategoryId,
    string? Attributes,
    List<string> Tags,
    IEnumerable<SaveVariantDto>? Variants = null
) : IRequest;

public class UpdateProductCommandHandler(IAppDbContext db)
    : IRequestHandler<UpdateProductCommand>
{
    public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await db.Products
            .Include(p => p.Tags)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), request.Id);

        product.Title = request.Title;
        product.Description = request.Description;
        product.BasePrice = request.BasePrice;
        product.DiscountedPrice = request.DiscountedPrice;
        product.Status = request.Status;
        product.IsFeatured = request.IsFeatured;
        product.StockQuantity = request.StockQuantity;
        product.CategoryId = request.CategoryId;
        product.Attributes = request.Attributes;

        // Replace tags wholesale
        db.ProductTags.RemoveRange(product.Tags);
        var newTags = (request.Tags ?? [])
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => new ProductTag { Tag = t.Trim(), ProductId = product.Id, TenantId = product.TenantId })
            .ToList();
        db.ProductTags.AddRange(newTags);
        product.Tags = newTags;

        // Replace variants wholesale (only when caller explicitly provides the list)
        if (request.Variants != null)
        {
            db.ProductVariants.RemoveRange(product.Variants);

            var newVariants = request.Variants
                .Where(v => !string.IsNullOrWhiteSpace(v.Name) && !string.IsNullOrWhiteSpace(v.Value))
                .Select(v => new ProductVariant
                {
                    TenantId = product.TenantId,
                    ProductId = product.Id,
                    Name = v.Name.Trim(),
                    Value = v.Value.Trim(),
                    PriceAdjustment = v.PriceAdjustment,
                    StockQuantity = v.StockQuantity,
                    IsAvailable = v.IsAvailable
                })
                .ToList();
            db.ProductVariants.AddRange(newVariants);
            product.Variants = newVariants;
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
