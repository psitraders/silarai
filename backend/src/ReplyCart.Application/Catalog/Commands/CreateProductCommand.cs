using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Helpers;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Catalog.Commands;

/// <summary>A single variant line to create/replace on a product.</summary>
public record SaveVariantDto(string Name, string Value, decimal? PriceAdjustment, int? StockQuantity, bool IsAvailable = true);

public record CreateProductCommand(
    string Title,
    string? Description,
    string? Sku,
    Guid? CategoryId,
    decimal BasePrice,
    decimal? DiscountedPrice,
    bool IsFeatured,
    int? StockQuantity,
    IEnumerable<string>? Tags,
    IEnumerable<SaveVariantDto>? Variants = null,
    ProductStatus Status = ProductStatus.Draft
) : IRequest<Guid>;

public class CreateProductCommandHandler(IAppDbContext db, ITenantContext tenantContext, IMediator mediator)
    : IRequestHandler<CreateProductCommand, Guid>
{
    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var productCount = await db.Products.CountAsync(p => p.TenantId == tenantId, cancellationToken);

        // Enforce plan product limit
        var subscription = await db.TenantSubscriptions
            .Include(s => s.Plan)
            .Where(s => s.TenantId == tenantId && s.Status != SubscriptionStatus.Cancelled)
            .OrderByDescending(s => s.StartDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (subscription != null && productCount >= subscription.Plan.MaxProducts)
        {
            throw new PlanLimitException(
                $"adding more than {subscription.Plan.MaxProducts} products on your {subscription.Plan.Name} plan");
        }

        // Auto out-of-stock: if stock is explicitly 0 and the product is being set Active, force OutOfStock
        var resolvedStatus = request.Status;
        if (resolvedStatus == ProductStatus.Active &&
            request.StockQuantity.HasValue && request.StockQuantity.Value <= 0)
        {
            resolvedStatus = ProductStatus.OutOfStock;
        }

        var slug = await SlugHelper.GenerateUniqueAsync(
            request.Title,
            tenantId,
            candidate => db.Products.AnyAsync(
                p => p.TenantId == tenantId && p.Slug == candidate, cancellationToken));

        var product = new Product
        {
            TenantId = tenantId,
            Title = request.Title,
            Slug = slug,
            Description = request.Description,
            Sku = request.Sku,
            CategoryId = request.CategoryId,
            BasePrice = request.BasePrice,
            DiscountedPrice = request.DiscountedPrice,
            IsFeatured = request.IsFeatured,
            StockQuantity = request.StockQuantity,
            Status = resolvedStatus,
            SortOrder = productCount + 1
        };
        db.Products.Add(product);

        if (request.Tags != null)
        {
            foreach (var tag in request.Tags)
            {
                db.ProductTags.Add(new ProductTag { TenantId = tenantId, ProductId = product.Id, Tag = tag });
            }
        }

        if (request.Variants != null)
        {
            foreach (var v in request.Variants.Where(v => !string.IsNullOrWhiteSpace(v.Name) && !string.IsNullOrWhiteSpace(v.Value)))
            {
                db.ProductVariants.Add(new ProductVariant
                {
                    TenantId = tenantId,
                    ProductId = product.Id,
                    Name = v.Name.Trim(),
                    Value = v.Value.Trim(),
                    PriceAdjustment = v.PriceAdjustment,
                    StockQuantity = v.StockQuantity,
                    IsAvailable = v.IsAvailable
                });
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        // Fire auto-campaign in the background when a product is published as Active
        if (resolvedStatus == ProductStatus.Active)
        {
            var firstImage = await db.ProductImages
                .Where(i => i.ProductId == product.Id)
                .OrderBy(i => i.SortOrder)
                .Select(i => i.Url)
                .FirstOrDefaultAsync(cancellationToken);

            _ = mediator.Send(new AutoLaunchCampaignCommand(
                TenantId:           tenantId,
                ProductId:          product.Id,
                ProductTitle:       product.Title,
                ProductDescription: product.Description,
                ProductImageUrl:    firstImage
            ), CancellationToken.None); // fire-and-forget (background)
        }

        return product.Id;
    }
}


