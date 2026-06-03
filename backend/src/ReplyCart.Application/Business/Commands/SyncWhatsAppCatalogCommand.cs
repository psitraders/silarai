using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Business.Commands;

/// <summary>
/// Pushes all active products to the tenant's WhatsApp Business Catalog
/// via the Meta Commerce Manager Catalog Items Batch API.
/// </summary>
public record SyncWhatsAppCatalogCommand(string StorefrontBaseUrl) : IRequest<SyncCatalogResult>;

public record SyncCatalogResult(int Synced, int Skipped, string Message);

public class SyncWhatsAppCatalogCommandHandler(
    IAppDbContext db,
    ITenantContext tenantContext,
    IWhatsAppCatalogService catalogService)
    : IRequestHandler<SyncWhatsAppCatalogCommand, SyncCatalogResult>
{
    public async Task<SyncCatalogResult> Handle(SyncWhatsAppCatalogCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantId, cancellationToken)
            ?? throw new InvalidOperationException("Business profile not found.");

        if (string.IsNullOrWhiteSpace(business.WhatsAppCatalogId))
            throw new InvalidOperationException(
                "WhatsApp Catalog ID is not configured. Add it in Integrations settings.");

        if (string.IsNullOrWhiteSpace(business.WhatsAppAccessToken))
            throw new InvalidOperationException(
                "WhatsApp Access Token is not configured. Add it in Integrations settings.");

        // Load storefront slug for building product URLs
        var storefront = await db.StorefrontSettings
            .FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);
        var slug = storefront?.Slug ?? tenantId.ToString("N")[..8];

        // Load all active products with images
        var products = await db.Products
            .Include(p => p.Images)
            .Where(p => p.TenantId == tenantId && p.Status == ProductStatus.Active)
            .ToListAsync(cancellationToken);

        if (products.Count == 0)
            return new SyncCatalogResult(0, 0, "No active products to sync.");

        var currency = business.Currency ?? "INR";

        var items = products.Select(p =>
        {
            var imageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.Url
                        ?? p.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.Url
                        ?? "";

            var price    = p.DiscountedPrice ?? p.BasePrice;
            var pricePaise = (long)Math.Round(price * 100);

            return new WhatsAppCatalogItem(
                RetailerId:  string.IsNullOrWhiteSpace(p.Sku) ? p.Id.ToString() : p.Sku,
                Name:        p.Title,
                Description: p.Description ?? p.Title,
                PricePaise:  pricePaise,
                Currency:    currency,
                ImageUrl:    imageUrl,
                ProductUrl:  $"{request.StorefrontBaseUrl}/{slug}/products/{p.Id}",
                InStock:     p.StockQuantity > 0,
                Brand:       business.Name
            );
        }).ToList();

        await catalogService.SyncItemsAsync(
            business.WhatsAppCatalogId,
            business.WhatsAppAccessToken,
            items,
            cancellationToken);

        return new SyncCatalogResult(
            Synced:  products.Count,
            Skipped: 0,
            Message: $"Successfully synced {products.Count} products to WhatsApp Catalog.");
    }
}


