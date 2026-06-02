using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Import;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Infrastructure.Import;

/// <summary>
/// Handles product import from three sources:
///   1. Shopify Admin REST API
///   2. WooCommerce REST API
///   3. Generic web scraper (JSON-LD + Open Graph fallback)
/// </summary>
public class ProductImportService : IProductImportService
{
    private readonly IHttpClientFactory _http;
    private readonly IAppDbContext _db;
    private readonly ITenantContext _tenantContext;

    private static readonly JsonSerializerOptions _jsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public ProductImportService(
        IHttpClientFactory http,
        IAppDbContext db,
        ITenantContext tenantContext)
    {
        _http = http;
        _db = db;
        _tenantContext = tenantContext;
    }

    // ── Public interface ──────────────────────────────────────────────────────

    public Task<ImportPreviewResponse> PreviewAsync(ImportPreviewRequest request, CancellationToken ct = default)
        => request.Source.ToLowerInvariant() switch
        {
            "shopify"     => PreviewShopifyAsync(request, ct),
            "woocommerce" => PreviewWooCommerceAsync(request, ct),
            "scraper"     => PreviewScraperAsync(request, ct),
            _             => Task.FromResult(new ImportPreviewResponse { Errors = { "Unknown source. Use 'shopify', 'woocommerce', or 'scraper'." } })
        };

    public async Task<ImportConfirmResponse> ConfirmAsync(ImportConfirmRequest request, CancellationToken ct = default)
    {
        var tenantId = _tenantContext.CurrentTenantId;
        var response = new ImportConfirmResponse();

        // 1. Create / resolve categories
        var categoryMap = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);
        if (request.CreateCategories)
        {
            var names = request.Products
                .Where(p => !string.IsNullOrWhiteSpace(p.Category))
                .Select(p => p.Category!)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var existing = await _db.Categories
                .Where(c => c.TenantId == tenantId && names.Contains(c.Name))
                .ToListAsync(ct);

            foreach (var name in names)
            {
                var ex = existing.FirstOrDefault(c =>
                    string.Equals(c.Name, name, StringComparison.OrdinalIgnoreCase));

                if (ex != null)
                {
                    categoryMap[name] = ex.Id;
                }
                else
                {
                    var cat = new Category
                    {
                        Id       = Guid.NewGuid(),
                        TenantId = tenantId,
                        Name     = name,
                        IsActive = true,
                    };
                    _db.Categories.Add(cat);
                    categoryMap[name] = cat.Id;
                }
            }
            await _db.SaveChangesAsync(ct);
        }

        // 2. Create products
        foreach (var dto in request.Products)
        {
            try
            {
                Guid? categoryId = null;
                if (!string.IsNullOrWhiteSpace(dto.Category) &&
                    categoryMap.TryGetValue(dto.Category, out var catId))
                    categoryId = catId;

                var product = new Product
                {
                    Id             = Guid.NewGuid(),
                    TenantId       = tenantId,
                    Title          = dto.Title.Trim(),
                    Description    = dto.Description?.Trim(),
                    Sku            = dto.Sku?.Trim(),
                    CategoryId     = categoryId,
                    BasePrice      = dto.BasePrice,
                    DiscountedPrice= dto.DiscountedPrice,
                    IsFeatured     = false,
                    StockQuantity  = dto.StockQuantity,
                    Status         = ProductStatus.Active,
                };
                _db.Products.Add(product);

                // Primary image
                if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
                {
                    _db.ProductImages.Add(new ProductImage
                    {
                        Id        = Guid.NewGuid(),
                        TenantId  = tenantId,
                        ProductId = product.Id,
                        Url       = dto.ImageUrl,
                        IsPrimary = true,
                        SortOrder = 0,
                    });
                }

                // Additional images (max 4 extras)
                for (int i = 0; i < Math.Min(dto.AdditionalImages.Count, 4); i++)
                {
                    _db.ProductImages.Add(new ProductImage
                    {
                        Id        = Guid.NewGuid(),
                        TenantId  = tenantId,
                        ProductId = product.Id,
                        Url       = dto.AdditionalImages[i],
                        IsPrimary = false,
                        SortOrder = i + 1,
                    });
                }

                response.Imported++;
            }
            catch (Exception ex)
            {
                response.Failed++;
                response.Errors.Add($"'{dto.Title}': {ex.Message}");
            }
        }

        await _db.SaveChangesAsync(ct);
        return response;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // SHOPIFY
    // ═════════════════════════════════════════════════════════════════════════

    private async Task<ImportPreviewResponse> PreviewShopifyAsync(
        ImportPreviewRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.ShopUrl) || string.IsNullOrWhiteSpace(req.AccessToken))
            return Err("Shop URL and Access Token are required.");

        var host = NormaliseUrl(req.ShopUrl.Trim());
        var client = MakeClient();
        client.DefaultRequestHeaders.Add("X-Shopify-Access-Token", req.AccessToken.Trim());
        client.Timeout = TimeSpan.FromSeconds(30);

        var response = new ImportPreviewResponse();
        try
        {
            // Products
            var raw  = await client.GetStringAsync($"{host}/admin/api/2024-01/products.json?limit=250&status=active", ct);
            var root = JsonDocument.Parse(raw).RootElement;

            foreach (var p in root.GetProperty("products").EnumerateArray())
            {
                var dto = new ImportedProductDto
                {
                    ExternalId  = p.GetProperty("id").ToString(),
                    Title       = Str(p, "title"),
                    Description = StripHtml(Str(p, "body_html")),
                    Sku         = ArrayFirst(p, "variants", "sku"),
                    Category    = Str(p, "product_type"),
                };

                // Price from first variant
                if (p.TryGetProperty("variants", out var vars) && vars.GetArrayLength() > 0)
                {
                    var v0 = vars[0];
                    ParseShopifyPrice(v0, dto);
                }

                // Images
                if (p.TryGetProperty("images", out var imgs))
                    ExtractImageList(imgs, dto);

                if (!string.IsNullOrWhiteSpace(dto.Title) && dto.BasePrice > 0)
                    response.Products.Add(dto);
            }
        }
        catch (Exception ex)
        {
            response.Errors.Add($"Shopify API error: {ex.Message}");
        }

        Finalize(response);
        return response;
    }

    private static void ParseShopifyPrice(JsonElement variant, ImportedProductDto dto)
    {
        if (variant.TryGetProperty("price", out var p) &&
            TryParseDecimal(p.GetString(), out var price))
            dto.BasePrice = price;

        if (variant.TryGetProperty("compare_at_price", out var cap) &&
            cap.ValueKind != JsonValueKind.Null &&
            TryParseDecimal(cap.GetString(), out var compareVal) &&
            compareVal > dto.BasePrice)
        {
            dto.DiscountedPrice = dto.BasePrice;
            dto.BasePrice       = compareVal;
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // WOOCOMMERCE
    // ═════════════════════════════════════════════════════════════════════════

    private async Task<ImportPreviewResponse> PreviewWooCommerceAsync(
        ImportPreviewRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.SiteUrl) ||
            string.IsNullOrWhiteSpace(req.ConsumerKey) ||
            string.IsNullOrWhiteSpace(req.ConsumerSecret))
            return Err("Site URL, Consumer Key, and Consumer Secret are required.");

        var site   = NormaliseUrl(req.SiteUrl.Trim());
        var client = MakeClient();
        var creds  = Convert.ToBase64String(
            System.Text.Encoding.ASCII.GetBytes($"{req.ConsumerKey}:{req.ConsumerSecret}"));
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Basic", creds);
        client.Timeout = TimeSpan.FromSeconds(30);

        var response = new ImportPreviewResponse();
        try
        {
            // Paginate — WooCommerce max per_page is 100
            int page = 1;
            while (response.Products.Count < 500)
            {
                var url = $"{site}/wp-json/wc/v3/products?per_page=100&status=publish&page={page}";
                var raw = await client.GetStringAsync(url, ct);
                var arr = JsonDocument.Parse(raw).RootElement;
                if (arr.GetArrayLength() == 0) break;

                foreach (var p in arr.EnumerateArray())
                {
                    var dto = new ImportedProductDto
                    {
                        ExternalId  = p.GetProperty("id").ToString(),
                        Title       = Str(p, "name"),
                        Description = StripHtml(Str(p, "short_description") ?? Str(p, "description")),
                        Sku         = Str(p, "sku"),
                    };

                    // Price
                    ParseWooPrice(p, dto);

                    // Category (first one)
                    if (p.TryGetProperty("categories", out var cats) && cats.GetArrayLength() > 0)
                        dto.Category = Str(cats[0], "name");

                    // Stock
                    if (p.TryGetProperty("stock_quantity", out var sq) && sq.ValueKind == JsonValueKind.Number)
                        dto.StockQuantity = sq.GetInt32();

                    // Images
                    if (p.TryGetProperty("images", out var imgs))
                        ExtractImageList(imgs, dto);

                    if (!string.IsNullOrWhiteSpace(dto.Title) && dto.BasePrice > 0)
                        response.Products.Add(dto);
                }

                page++;
            }
        }
        catch (Exception ex)
        {
            response.Errors.Add($"WooCommerce API error: {ex.Message}");
        }

        Finalize(response);
        return response;
    }

    private static void ParseWooPrice(JsonElement p, ImportedProductDto dto)
    {
        // sale_price + regular_price → discounted flow
        if (p.TryGetProperty("regular_price", out var rp) &&
            p.TryGetProperty("sale_price",    out var sp) &&
            !string.IsNullOrWhiteSpace(sp.GetString()) &&
            TryParseDecimal(rp.GetString(), out var reg) &&
            TryParseDecimal(sp.GetString(), out var sale) &&
            reg > 0 && sale > 0 && reg > sale)
        {
            dto.BasePrice       = reg;
            dto.DiscountedPrice = sale;
            return;
        }

        if (p.TryGetProperty("price", out var pr) &&
            TryParseDecimal(pr.GetString(), out var wooPrice))
            dto.BasePrice = wooPrice;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // GENERIC SCRAPER
    // ═════════════════════════════════════════════════════════════════════════

    private async Task<ImportPreviewResponse> PreviewScraperAsync(
        ImportPreviewRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.SiteUrl))
            return Err("URL is required.");

        var startUrl = NormaliseUrl(req.SiteUrl.Trim());
        var client   = MakeScraperClient();
        var response = new ImportPreviewResponse();

        var allProducts = new List<ImportedProductDto>();
        var visited     = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var queue       = new Queue<string>();
        queue.Enqueue(startUrl);

        int pageCount = 0;

        while (queue.Count > 0 && pageCount < 6 && allProducts.Count < 120)
        {
            var url = queue.Dequeue();
            if (visited.Contains(url)) continue;
            visited.Add(url);
            pageCount++;

            try
            {
                var html     = await client.GetStringAsync(url, ct);
                var found    = ScrapeProducts(html, url);
                allProducts.AddRange(found);

                // Follow pagination
                var next = FindNextPage(html, url);
                if (next != null && !visited.Contains(next))
                    queue.Enqueue(next);

                // On homepage with no products found, spider category links
                if (pageCount == 1 && found.Count == 0)
                {
                    foreach (var cu in FindCategoryUrls(html, startUrl).Take(5))
                        queue.Enqueue(cu);
                }
            }
            catch { /* ignore individual page failures */ }
        }

        // Deduplicate by title
        response.Products = allProducts
            .GroupBy(p => p.Title, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .Take(100)
            .ToList();

        if (response.Products.Count == 0)
            response.Errors.Add(
                "No products detected. The site likely requires JavaScript rendering " +
                "(React/Vue SPA) or blocks automated access. " +
                "Try using the Shopify or WooCommerce integrations instead if applicable.");

        Finalize(response);
        return response;
    }

    // ── HTML scraping helpers ─────────────────────────────────────────────────

    private static List<ImportedProductDto> ScrapeProducts(string html, string pageUrl)
    {
        var products = new List<ImportedProductDto>();

        // ── 1. JSON-LD structured data (most reliable) ──────────────────────
        var ldMatches = Regex.Matches(
            html,
            @"<script[^>]+type=[""']application/ld\+json[""'][^>]*>([\s\S]*?)</script>",
            RegexOptions.IgnoreCase);

        foreach (Match m in ldMatches)
        {
            try
            {
                var json = m.Groups[1].Value.Trim();
                var doc  = JsonDocument.Parse(json).RootElement;
                products.AddRange(ExtractFromJsonLd(doc));
            }
            catch { /* skip malformed JSON-LD */ }
        }

        // ── 2. Open Graph fallback for single-product pages ─────────────────
        if (products.Count == 0)
        {
            var p = TryExtractFromOpenGraph(html, pageUrl);
            if (p != null) products.Add(p);
        }

        return products;
    }

    private static IEnumerable<ImportedProductDto> ExtractFromJsonLd(JsonElement root)
    {
        var results = new List<ImportedProductDto>();

        if (root.ValueKind == JsonValueKind.Array)
        {
            foreach (var elem in root.EnumerateArray())
                results.AddRange(ExtractFromJsonLd(elem));
            return results;
        }

        var type = root.TryGetProperty("@type", out var t) ? t.GetString() : null;

        if (type == "Product")
        {
            var p = ParseJsonLdProduct(root);
            if (p != null) results.Add(p);
        }
        else if (type == "ItemList" && root.TryGetProperty("itemListElement", out var items))
        {
            foreach (var item in items.EnumerateArray())
            {
                var it = item.TryGetProperty("@type", out var it2) ? it2.GetString() : null;
                if (it == "Product")
                {
                    var p = ParseJsonLdProduct(item);
                    if (p != null) results.Add(p);
                }
                else if (it == "ListItem" && item.TryGetProperty("item", out var inner))
                {
                    var p = ParseJsonLdProduct(inner);
                    if (p != null) results.Add(p);
                }
            }
        }
        // BreadcrumbList etc. — skip silently

        return results;
    }

    private static ImportedProductDto? ParseJsonLdProduct(JsonElement p)
    {
        var title = Str(p, "name");
        if (string.IsNullOrWhiteSpace(title)) return null;

        var dto = new ImportedProductDto
        {
            ExternalId  = Str(p, "@id") ?? title,
            Title       = title,
            Description = StripHtml(Str(p, "description")),
            Category    = Str(p, "category"),
        };

        // Image
        if (p.TryGetProperty("image", out var img))
            dto.ImageUrl = ExtractImageUrl(img);

        // Price from offers
        if (p.TryGetProperty("offers", out var offers))
        {
            var offer = offers.ValueKind == JsonValueKind.Array && offers.GetArrayLength() > 0
                ? offers[0] : offers;
            ExtractOfferPrice(offer, dto);
        }

        return dto.BasePrice > 0 ? dto : null;
    }

    private static void ExtractOfferPrice(JsonElement offer, ImportedProductDto dto)
    {
        // price
        if (offer.TryGetProperty("price", out var pr))
        {
            if (pr.ValueKind == JsonValueKind.Number)
                dto.BasePrice = pr.GetDecimal();
            else if (TryParseDecimal(pr.GetString(), out var parsedPrice))
                dto.BasePrice = parsedPrice;
        }
        // lowPrice (AggregateOffer)
        else if (offer.TryGetProperty("lowPrice", out var lp))
        {
            if (lp.ValueKind == JsonValueKind.Number)
                dto.BasePrice = lp.GetDecimal();
            else if (TryParseDecimal(lp.GetString(), out var parsedLow))
                dto.BasePrice = parsedLow;
        }
    }

    private static string? ExtractImageUrl(JsonElement img)
    {
        if (img.ValueKind == JsonValueKind.String)
            return img.GetString();
        if (img.ValueKind == JsonValueKind.Object)
            return Str(img, "url") ?? Str(img, "contentUrl");
        if (img.ValueKind == JsonValueKind.Array && img.GetArrayLength() > 0)
            return ExtractImageUrl(img[0]);
        return null;
    }

    private static ImportedProductDto? TryExtractFromOpenGraph(string html, string url)
    {
        var title = OgMeta(html, "og:title") ?? OgMeta(html, "twitter:title");
        if (string.IsNullOrWhiteSpace(title)) return null;

        var priceStr = OgMeta(html, "product:price:amount") ??
                       OgMeta(html, "og:price:amount");
        if (!TryParseDecimal(priceStr, out var price) || price <= 0) return null;

        return new ImportedProductDto
        {
            ExternalId  = url,
            Title       = System.Net.WebUtility.HtmlDecode(title),
            Description = System.Net.WebUtility.HtmlDecode(OgMeta(html, "og:description") ?? ""),
            ImageUrl    = OgMeta(html, "og:image"),
            BasePrice   = price,
        };
    }

    private static string? OgMeta(string html, string property)
    {
        var m = Regex.Match(html,
            $@"<meta[^>]+property=[""']{Regex.Escape(property)}[""'][^>]+content=[""']([^""']+)[""']",
            RegexOptions.IgnoreCase);
        if (m.Success) return m.Groups[1].Value;
        // some sites put content before property
        m = Regex.Match(html,
            $@"<meta[^>]+content=[""']([^""']+)[""'][^>]+property=[""']{Regex.Escape(property)}[""']",
            RegexOptions.IgnoreCase);
        return m.Success ? m.Groups[1].Value : null;
    }

    private static string? FindNextPage(string html, string currentUrl)
    {
        // rel="next"
        var m = Regex.Match(html,
            @"<link[^>]+rel=[""']next[""'][^>]+href=[""']([^""']+)[""']",
            RegexOptions.IgnoreCase);
        if (m.Success) return MakeAbsolute(m.Groups[1].Value, currentUrl);

        // <a>next</a> / ›› / » / →
        m = Regex.Match(html,
            @"<a[^>]+href=[""']([^""'#]+)[""'][^>]*>(?:[^<]*(next|›|»|→)[^<]*)</a>",
            RegexOptions.IgnoreCase);
        if (m.Success) return MakeAbsolute(m.Groups[1].Value, currentUrl);

        return null;
    }

    private static List<string> FindCategoryUrls(string html, string baseUrl)
    {
        var results = new List<string>();
        var matches = Regex.Matches(html,
            @"<a[^>]+href=[""']([^""'#?]+/(?:collection|collections|category|categories|shop|products)[^""']*)[""']",
            RegexOptions.IgnoreCase);
        foreach (Match m in matches)
        {
            var abs = MakeAbsolute(m.Groups[1].Value, baseUrl);
            if (abs != null && !results.Contains(abs)) results.Add(abs);
        }
        return results;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Shared helpers
    // ═════════════════════════════════════════════════════════════════════════

    private HttpClient MakeClient() => _http.CreateClient();

    private HttpClient MakeScraperClient()
    {
        var c = _http.CreateClient();
        c.DefaultRequestHeaders.Add("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/120.0.0.0 Safari/537.36");
        c.DefaultRequestHeaders.Add("Accept",
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        c.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");
        c.Timeout = TimeSpan.FromSeconds(25);
        return c;
    }

    private static string NormaliseUrl(string url)
    {
        if (!url.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            url = "https://" + url;
        return url.TrimEnd('/');
    }

    private static void ExtractImageList(JsonElement imgs, ImportedProductDto dto)
    {
        bool first = true;
        foreach (var img in imgs.EnumerateArray())
        {
            var src = Str(img, "src") ?? Str(img, "url");
            if (src == null) continue;
            if (first) { dto.ImageUrl = src; first = false; }
            else if (dto.AdditionalImages.Count < 4) dto.AdditionalImages.Add(src);
        }
    }

    private static void Finalize(ImportPreviewResponse r)
    {
        r.TotalFound = r.Products.Count;
        r.Categories = r.Products
            .Where(p => !string.IsNullOrWhiteSpace(p.Category))
            .Select(p => p.Category!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(c => c)
            .ToList();
    }

    private static ImportPreviewResponse Err(string msg) =>
        new() { Errors = { msg } };

    private static string? Str(JsonElement el, string prop) =>
        el.TryGetProperty(prop, out var v) && v.ValueKind == JsonValueKind.String
            ? v.GetString() : null;

    private static string? ArrayFirst(JsonElement el, string arrayProp, string childProp)
    {
        if (el.TryGetProperty(arrayProp, out var arr) && arr.GetArrayLength() > 0)
            return Str(arr[0], childProp);
        return null;
    }

    private static string? StripHtml(string? html)
    {
        if (string.IsNullOrWhiteSpace(html)) return null;
        var text = Regex.Replace(html, "<[^>]+>", " ");
        text = System.Net.WebUtility.HtmlDecode(text);
        text = Regex.Replace(text, @"\s{2,}", " ").Trim();
        return string.IsNullOrWhiteSpace(text) ? null : text;
    }

    private static bool TryParseDecimal(string? s, out decimal result)
    {
        result = 0;
        if (string.IsNullOrWhiteSpace(s)) return false;
        // strip currency symbols, keep digits / . / ,
        s = Regex.Replace(s, @"[^\d.,]", "");
        // handle European format (1.234,56) vs US (1,234.56)
        if (s.Contains(',') && s.Contains('.'))
            s = s.LastIndexOf(',') > s.LastIndexOf('.') ? s.Replace(".", "").Replace(',', '.') : s.Replace(",", "");
        else if (s.Contains(',') && !s.Contains('.'))
            s = s.Replace(',', '.');
        return decimal.TryParse(s, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out result);
    }

    private static string? MakeAbsolute(string href, string baseUrl)
    {
        if (string.IsNullOrWhiteSpace(href)) return null;
        if (href.StartsWith("http", StringComparison.OrdinalIgnoreCase)) return href;
        if (href.StartsWith("//")) return "https:" + href;
        try { return new Uri(new Uri(baseUrl), href).ToString(); }
        catch { return null; }
    }
}
