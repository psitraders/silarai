using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Helpers;
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

public class UpdateProductCommandHandler(IAppDbContext db, IMediator mediator)
    : IRequestHandler<UpdateProductCommand>
{
    public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await db.Products
            .Include(p => p.Tags)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), request.Id);

        var previousStatus = product.Status;

        // Regenerate slug when title changes or slug was never set (existing products)
        if (product.Slug == null || product.Title != request.Title)
        {
            product.Slug = await SlugHelper.GenerateUniqueAsync(
                request.Title,
                product.TenantId,
                candidate => db.Products.AnyAsync(
                    p => p.TenantId == product.TenantId && p.Slug == candidate && p.Id != product.Id,
                    cancellationToken));
        }

        product.Title = request.Title;
        product.Description = request.Description;
        product.BasePrice = request.BasePrice;
        product.DiscountedPrice = request.DiscountedPrice;
        product.IsFeatured = request.IsFeatured;
        product.StockQuantity = request.StockQuantity;
        product.CategoryId = request.CategoryId;
        product.Attributes = request.Attributes;

        // Auto out-of-stock: if stock is set to 0 and product is active, switch automatically
        if (request.Status == ProductStatus.Active &&
            request.StockQuantity.HasValue && request.StockQuantity.Value <= 0)
        {
            product.Status = ProductStatus.OutOfStock;
        }
        else
        {
            product.Status = request.Status;
        }

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

        // Fire auto-campaign only when product first transitions to Active
        if (previousStatus != ProductStatus.Active && product.Status == ProductStatus.Active)
        {
            var firstImage = await db.ProductImages
                .Where(i => i.ProductId == product.Id)
                .OrderBy(i => i.SortOrder)
                .Select(i => i.Url)
                .FirstOrDefaultAsync(cancellationToken);

            _ = mediator.Send(new AutoLaunchCampaignCommand(
                TenantId:           product.TenantId,
                ProductId:          product.Id,
                ProductTitle:       product.Title,
                ProductDescription: product.Description,
                ProductImageUrl:    firstImage
            ), CancellationToken.None); // fire-and-forget
        }
    }
}
