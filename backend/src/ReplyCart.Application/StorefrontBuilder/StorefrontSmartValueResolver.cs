using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.StorefrontBuilder;

/// <summary>
/// Fills in live data for <c>$products</c> / <c>$categories</c> smart values on public
/// reads. The query object is kept and an <c>items</c> array is added next to it:
/// <code>{ "$products": { "source": "featured", "limit": 8 }, "items": [ … ] }</code>
/// Prices, stock and images always come from the catalog at request time (INV-2, SB-R1).
/// Must run inside a request whose tenant is resolved (global query filter scopes the data).
/// </summary>
public sealed class StorefrontSmartValueResolver(IAppDbContext db)
{
    private const int DefaultProductLimit  = 8;
    private const int DefaultCategoryLimit = 12;

    /// <param name="absoluteUrl">Turns stored relative image paths into absolute URLs.</param>
    public async Task ResolveAsync(JsonNode root, Func<string?, string?> absoluteUrl, CancellationToken ct)
    {
        var productNodes  = new List<JsonObject>();
        var categoryNodes = new List<JsonObject>();
        var imageNodes    = new List<JsonObject>();
        Collect(root, productNodes, categoryNodes, imageNodes);

        // Stored upload paths may be root-relative; shoppers need absolute URLs.
        foreach (var node in imageNodes)
            node["$image"] = absoluteUrl((string?)node["$image"]) ?? string.Empty;

        foreach (var node in productNodes)
        {
            var items = await ResolveProductsAsync((JsonObject)node["$products"]!, absoluteUrl, ct);
            node["items"] = items;
        }

        if (categoryNodes.Count > 0)
        {
            var all = await LoadCategoriesAsync(absoluteUrl, ct);
            foreach (var node in categoryNodes)
                node["items"] = SelectCategories((JsonObject)node["$categories"]!, all);
        }
    }

    private static void Collect(JsonNode node, List<JsonObject> products, List<JsonObject> categories, List<JsonObject> images)
    {
        switch (node)
        {
            case JsonObject obj when obj["$products"] is JsonObject:
                products.Add(obj);
                return;
            case JsonObject obj when obj["$categories"] is JsonObject:
                categories.Add(obj);
                return;
            case JsonObject obj when obj["$image"] is JsonValue:
                images.Add(obj);
                return;
            case JsonObject obj:
                foreach (var kv in obj.ToList())
                    if (kv.Value is not null) Collect(kv.Value, products, categories, images);
                return;
            case JsonArray arr:
                foreach (var child in arr.ToList())
                    if (child is not null) Collect(child, products, categories, images);
                return;
        }
    }

    // ── Products ──────────────────────────────────────────────────────────────

    private async Task<JsonArray> ResolveProductsAsync(JsonObject q, Func<string?, string?> absoluteUrl, CancellationToken ct)
    {
        var source = (string?)q["source"] ?? "featured";
        var limit  = Math.Clamp(q["limit"] is JsonValue lv && lv.TryGetValue<int>(out var l) ? l : DefaultProductLimit,
                                1, StorefrontLayoutProcessor.MaxProductLimit);

        // Same visibility rule as GET /public/{slug}/products: Active + OutOfStock.
        var query = db.Products
            .Where(p => p.Status == ProductStatus.Active || p.Status == ProductStatus.OutOfStock);

        List<Guid>? manualOrder = null;
        switch (source)
        {
            case "featured":
                query = query.Where(p => p.IsFeatured).OrderBy(p => p.SortOrder).ThenByDescending(p => p.CreatedAt);
                break;
            case "category":
                var categoryId = Guid.TryParse((string?)q["categoryId"], out var cid) ? cid : Guid.Empty;
                // A parent category includes products of its subcategories.
                var childIds = await db.Categories.Where(c => c.ParentCategoryId == categoryId).Select(c => c.Id).ToListAsync(ct);
                query = query.Where(p => p.CategoryId == categoryId || (p.CategoryId != null && childIds.Contains(p.CategoryId.Value)))
                             .OrderByDescending(p => p.IsFeatured).ThenBy(p => p.SortOrder);
                break;
            case "manual":
                var ids = (q["productIds"] as JsonArray ?? new JsonArray())
                    .Select(n => Guid.TryParse((string?)n, out var g) ? g : Guid.Empty)
                    .Where(g => g != Guid.Empty).Distinct().Take(StorefrontLayoutProcessor.MaxProductLimit).ToList();
                manualOrder = ids;
                query = query.Where(p => ids.Contains(p.Id));
                break;
            case "newest":
                query = query.OrderByDescending(p => p.CreatedAt);
                break;
            case "sale":
                query = query.Where(p => p.DiscountedPrice != null && p.DiscountedPrice < p.BasePrice)
                             .OrderByDescending(p => p.IsFeatured).ThenBy(p => p.SortOrder);
                break;
            default: // "all"
                query = query.OrderByDescending(p => p.IsFeatured).ThenBy(p => p.SortOrder);
                break;
        }

        var rows = await query
            .Take(manualOrder?.Count ?? limit)
            .Select(p => new
            {
                p.Id,
                p.Slug,
                p.Title,
                p.Description,
                p.BasePrice,
                p.DiscountedPrice,
                p.IsFeatured,
                p.StockQuantity,
                IsOutOfStock = p.Status == ProductStatus.OutOfStock,
                PrimaryImage = p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault(),
                AllImages    = p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
                CategoryName = p.Category != null ? p.Category.Name : null,
                p.CategoryId,
                MinVariantPrice = p.Variants.Any()
                    ? (p.DiscountedPrice ?? p.BasePrice) + p.Variants.Min(v => v.PriceAdjustment ?? 0)
                    : (decimal?)null,
                Tags = p.Tags.Select(t => t.Tag).ToList(),
            })
            .ToListAsync(ct);

        if (manualOrder is not null)
            rows = rows.OrderBy(r => manualOrder.IndexOf(r.Id)).Take(limit).ToList();

        var result = new JsonArray();
        foreach (var r in rows)
        {
            var images = new JsonArray();
            foreach (var url in r.AllImages) images.Add(absoluteUrl(url));
            var tags = new JsonArray();
            foreach (var tag in r.Tags) tags.Add(tag);
            result.Add(new JsonObject
            {
                ["id"]              = r.Id.ToString(),
                ["slug"]            = r.Slug,
                ["title"]           = r.Title,
                ["description"]     = r.Description,
                ["basePrice"]       = r.BasePrice,
                ["discountedPrice"] = r.DiscountedPrice,
                ["isFeatured"]      = r.IsFeatured,
                ["stockQuantity"]   = r.StockQuantity,
                ["isOutOfStock"]    = r.IsOutOfStock,
                ["primaryImage"]    = absoluteUrl(r.PrimaryImage ?? r.AllImages.FirstOrDefault()),
                ["allImages"]       = images,
                ["categoryName"]    = r.CategoryName,
                ["categoryId"]      = r.CategoryId?.ToString(),
                ["minVariantPrice"] = r.MinVariantPrice,
                ["tags"]            = tags,
            });
        }
        return result;
    }

    // ── Categories ────────────────────────────────────────────────────────────

    private sealed record CategoryRow(Guid Id, string Name, string? Description, string? ImageUrl, bool IsFeatured, Guid? ParentId);

    private async Task<List<CategoryRow>> LoadCategoriesAsync(Func<string?, string?> absoluteUrl, CancellationToken ct)
    {
        var rows = await db.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new CategoryRow(c.Id, c.Name, c.Description, c.ImageUrl, c.IsFeatured, c.ParentCategoryId))
            .ToListAsync(ct);
        return rows.Select(r => r with { ImageUrl = absoluteUrl(r.ImageUrl) }).ToList();
    }

    private static JsonArray SelectCategories(JsonObject q, List<CategoryRow> all)
    {
        var source = (string?)q["source"] ?? "all";
        var limit  = Math.Clamp(q["limit"] is JsonValue lv && lv.TryGetValue<int>(out var l) ? l : DefaultCategoryLimit,
                                1, StorefrontLayoutProcessor.MaxCategoryLimit);
        var roots = all.Where(c => c.ParentId == null).ToList();

        IEnumerable<CategoryRow> picked = source switch
        {
            "featured" => roots.Where(c => c.IsFeatured),
            "manual"   => (q["categoryIds"] as JsonArray ?? new JsonArray())
                            .Select(n => Guid.TryParse((string?)n, out var g) ? g : Guid.Empty)
                            .Select(id => all.FirstOrDefault(c => c.Id == id))
                            .Where(c => c is not null)
                            .Select(c => c!),
            _          => roots,
        };

        var result = new JsonArray();
        foreach (var c in picked.Take(limit))
        {
            var subs = new JsonArray();
            foreach (var s in all.Where(x => x.ParentId == c.Id))
                subs.Add(new JsonObject { ["id"] = s.Id.ToString(), ["name"] = s.Name, ["description"] = s.Description, ["imageUrl"] = s.ImageUrl });
            result.Add(new JsonObject
            {
                ["id"]            = c.Id.ToString(),
                ["name"]          = c.Name,
                ["description"]   = c.Description,
                ["imageUrl"]      = c.ImageUrl,
                ["isFeatured"]    = c.IsFeatured,
                ["subCategories"] = subs,
            });
        }
        return result;
    }
}
