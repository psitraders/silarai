using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Storefront;

namespace ReplyCart.Application.Storefront.Commands;

// ── Toggle (add / remove) ─────────────────────────────────────────────────────

public record ToggleWishlistCommand(Guid CustomerId, Guid TenantId, Guid ProductId)
    : IRequest<WishlistToggleResult>;

public record WishlistToggleResult(bool IsNowWishlisted, int TotalWishlistCount);

public class ToggleWishlistHandler(IAppDbContext db)
    : IRequestHandler<ToggleWishlistCommand, WishlistToggleResult>
{
    public async Task<WishlistToggleResult> Handle(ToggleWishlistCommand req, CancellationToken ct)
    {
        var existing = await db.StorefrontWishlistItems
            .FirstOrDefaultAsync(w => w.StorefrontCustomerId == req.CustomerId
                                   && w.ProductId == req.ProductId
                                   && w.TenantId == req.TenantId, ct);

        bool isNowWishlisted;
        if (existing != null)
        {
            existing.IsDeleted = true;
            existing.DeletedAt = DateTime.UtcNow;
            isNowWishlisted = false;
        }
        else
        {
            db.StorefrontWishlistItems.Add(new StorefrontWishlistItem
            {
                TenantId             = req.TenantId,
                StorefrontCustomerId = req.CustomerId,
                ProductId            = req.ProductId,
            });
            isNowWishlisted = true;
        }

        await db.SaveChangesAsync(ct);

        var count = await db.StorefrontWishlistItems
            .CountAsync(w => w.StorefrontCustomerId == req.CustomerId && w.TenantId == req.TenantId, ct);

        return new WishlistToggleResult(isNowWishlisted, count);
    }
}

// ── Get Wishlist ──────────────────────────────────────────────────────────────

public record GetWishlistQuery(Guid CustomerId, Guid TenantId) : IRequest<List<WishlistItemDto>>;

public record WishlistItemDto(
    Guid ProductId,
    string Title,
    decimal BasePrice,
    decimal? DiscountedPrice,
    string? ImageUrl,
    string? Sku,
    bool InStock
);

public class GetWishlistHandler(IAppDbContext db)
    : IRequestHandler<GetWishlistQuery, List<WishlistItemDto>>
{
    public async Task<List<WishlistItemDto>> Handle(GetWishlistQuery req, CancellationToken ct)
    {
        return await db.StorefrontWishlistItems
            .Where(w => w.StorefrontCustomerId == req.CustomerId && w.TenantId == req.TenantId)
            .Include(w => w.Product).ThenInclude(p => p!.Images)
            .Select(w => new WishlistItemDto(
                w.ProductId,
                w.Product!.Title,
                w.Product.BasePrice,
                w.Product.DiscountedPrice,
                w.Product.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault(),
                w.Product.Sku,
                w.Product.StockQuantity == null || w.Product.StockQuantity > 0
            ))
            .ToListAsync(ct);
    }
}
