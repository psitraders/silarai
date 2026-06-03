using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Catalog.Commands;

public record CloneProductCommand(Guid SourceId) : IRequest<Guid>;

public class CloneProductCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CloneProductCommand, Guid>
{
    public async Task<Guid> Handle(CloneProductCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var source = await db.Products
            .Include(p => p.Tags)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == request.SourceId && p.TenantId == tenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), request.SourceId);

        var productCount = await db.Products.CountAsync(p => p.TenantId == tenantId, cancellationToken);

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

        var clone = new Product
        {
            TenantId        = tenantId,
            Title           = $"{source.Title} (Copy)",
            Description     = source.Description,
            Sku             = source.Sku,
            CategoryId      = source.CategoryId,
            BasePrice       = source.BasePrice,
            DiscountedPrice = source.DiscountedPrice,
            IsFeatured      = false,
            StockQuantity   = source.StockQuantity,
            Status          = ProductStatus.Draft,
            SortOrder       = productCount + 1,
        };
        db.Products.Add(clone);

        foreach (var tag in source.Tags)
        {
            db.ProductTags.Add(new ProductTag { TenantId = tenantId, ProductId = clone.Id, Tag = tag.Tag });
        }

        foreach (var v in source.Variants)
        {
            db.ProductVariants.Add(new ProductVariant
            {
                TenantId       = tenantId,
                ProductId      = clone.Id,
                Name           = v.Name,
                Value          = v.Value,
                PriceAdjustment = v.PriceAdjustment,
                StockQuantity  = v.StockQuantity,
                IsAvailable    = v.IsAvailable,
            });
        }

        await db.SaveChangesAsync(cancellationToken);
        return clone.Id;
    }
}


