using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
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

public class CreateProductCommandHandler(IAppDbContext db, ITenantContext tenantContext)
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

        var product = new Product
        {
            TenantId = tenantId,
            Title = request.Title,
            Description = request.Description,
            Sku = request.Sku,
            CategoryId = request.CategoryId,
            BasePrice = request.BasePrice,
            DiscountedPrice = request.DiscountedPrice,
            IsFeatured = request.IsFeatured,
            StockQuantity = request.StockQuantity,
            Status = request.Status,
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
        return product.Id;
    }
}
