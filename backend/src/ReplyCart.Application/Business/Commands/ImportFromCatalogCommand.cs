using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Business.Commands;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public record CatalogImportPreviewItem(
    string RetailerId,
    string Name,
    string Description,
    decimal Price,       // in major currency unit (rupees/dollars)
    string Currency,
    string ImageUrl,
    bool   InStock,
    bool   AlreadyExists // matched by SKU = retailer_id
);

public record CatalogImportPreview(
    int TotalInCatalog,
    int AlreadyExists,
    int WillImport,
    IReadOnlyList<CatalogImportPreviewItem> Items
);

// ── Preview query (no writes) ─────────────────────────────────────────────────

public record PreviewCatalogImportQuery : IRequest<CatalogImportPreview>;

public class PreviewCatalogImportQueryHandler(
    IAppDbContext          db,
    ITenantContext         tenantContext,
    IWhatsAppCatalogService catalogService)
    : IRequestHandler<PreviewCatalogImportQuery, CatalogImportPreview>
{
    public async Task<CatalogImportPreview> Handle(
        PreviewCatalogImportQuery request, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantId, ct)
            ?? throw new InvalidOperationException("Business profile not found.");

        if (string.IsNullOrWhiteSpace(business.WhatsAppCatalogId))
            throw new InvalidOperationException(
                "WhatsApp Catalog ID is not configured. Add it in Integrations settings.");

        if (string.IsNullOrWhiteSpace(business.WhatsAppAccessToken))
            throw new InvalidOperationException(
                "WhatsApp Access Token is not configured.");

        // Fetch from Meta
        var catalogItems = await catalogService.FetchItemsAsync(
            business.WhatsAppCatalogId,
            business.WhatsAppAccessToken,
            ct);

        // Find which retailer_ids already exist as SKUs
        var retailerIds = catalogItems.Select(i => i.RetailerId).ToList();
        var existingSkus = await db.Products
            .Where(p => p.TenantId == tenantId && p.Sku != null && retailerIds.Contains(p.Sku))
            .Select(p => p.Sku!)
            .ToListAsync(ct);

        var existingSet = existingSkus.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var previewItems = catalogItems.Select(i => new CatalogImportPreviewItem(
            RetailerId:   i.RetailerId,
            Name:         i.Name,
            Description:  i.Description,
            Price:        i.PricePaise / 100m,   // convert from smallest unit to major unit
            Currency:     i.Currency,
            ImageUrl:     i.ImageUrl,
            InStock:      i.InStock,
            AlreadyExists: existingSet.Contains(i.RetailerId)
        )).ToList();

        return new CatalogImportPreview(
            TotalInCatalog: catalogItems.Count,
            AlreadyExists:  existingSet.Count,
            WillImport:     previewItems.Count(x => !x.AlreadyExists),
            Items:          previewItems);
    }
}

// ── Confirm import (writes products) ─────────────────────────────────────────

/// <param name="RetailerIds">
/// The retailer_ids to import. Pass empty list to import ALL new items.
/// </param>
public record ImportFromCatalogCommand(IReadOnlyList<string> RetailerIds) : IRequest<ImportCatalogResult>;

public record ImportCatalogResult(int Imported, int Skipped, string Message);

public class ImportFromCatalogCommandHandler(
    IAppDbContext          db,
    ITenantContext         tenantContext,
    IWhatsAppCatalogService catalogService)
    : IRequestHandler<ImportFromCatalogCommand, ImportCatalogResult>
{
    public async Task<ImportCatalogResult> Handle(
        ImportFromCatalogCommand request, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantId, ct)
            ?? throw new InvalidOperationException("Business profile not found.");

        if (string.IsNullOrWhiteSpace(business.WhatsAppCatalogId) ||
            string.IsNullOrWhiteSpace(business.WhatsAppAccessToken))
            throw new InvalidOperationException(
                "WhatsApp Catalog credentials are not configured.");

        var catalogItems = await catalogService.FetchItemsAsync(
            business.WhatsAppCatalogId,
            business.WhatsAppAccessToken,
            ct);

        // Filter to requested retailer_ids (or all if empty)
        var toImport = request.RetailerIds.Count > 0
            ? catalogItems.Where(i => request.RetailerIds.Contains(i.RetailerId)).ToList()
            : catalogItems.ToList();

        // Existing SKUs — skip these
        var retailerIds  = toImport.Select(i => i.RetailerId).ToList();
        var existingSkus = await db.Products
            .Where(p => p.TenantId == tenantId && p.Sku != null && retailerIds.Contains(p.Sku))
            .Select(p => p.Sku!)
            .ToListAsync(ct);
        var existingSet = existingSkus.ToHashSet(StringComparer.OrdinalIgnoreCase);

        int imported = 0, skipped = 0;

        foreach (var item in toImport)
        {
            if (existingSet.Contains(item.RetailerId))
            {
                skipped++;
                continue;
            }

            var price = item.PricePaise / 100m;

            var product = new Product
            {
                Id            = Guid.NewGuid(),
                TenantId      = tenantId,
                Title         = item.Name,
                Description   = string.IsNullOrWhiteSpace(item.Description) ? null : item.Description,
                Sku           = item.RetailerId,
                BasePrice     = price,
                DiscountedPrice = null,
                Status        = ProductStatus.Active,
                StockQuantity = item.InStock ? 999 : 0,
                SortOrder     = 0,
            };

            // Add image if present
            if (!string.IsNullOrWhiteSpace(item.ImageUrl))
            {
                product.Images.Add(new ProductImage
                {
                    Id        = Guid.NewGuid(),
                    TenantId  = tenantId,
                    ProductId = product.Id,
                    Url       = item.ImageUrl,
                    IsPrimary = true,
                    SortOrder = 0,
                });
            }

            db.Products.Add(product);
            imported++;
        }

        await db.SaveChangesAsync(ct);

        return new ImportCatalogResult(
            Imported: imported,
            Skipped:  skipped,
            Message:  imported == 0
                ? "No new products to import — all catalog items already exist."
                : $"Imported {imported} product{(imported != 1 ? "s" : "")} from catalog." +
                  (skipped > 0 ? $" Skipped {skipped} already existing." : ""));
    }
}


