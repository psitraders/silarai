namespace ReplyCart.Application.Import;

// ── Preview (fetch without saving) ───────────────────────────────────────────

public class ImportPreviewRequest
{
    /// <summary>"shopify" | "woocommerce" | "scraper"</summary>
    public string Source { get; set; } = string.Empty;

    // Shopify
    public string? ShopUrl { get; set; }        // e.g. my-store.myshopify.com
    public string? AccessToken { get; set; }    // Admin API access token

    // WooCommerce + Scraper
    public string? SiteUrl { get; set; }        // e.g. https://mysite.com
    public string? ConsumerKey { get; set; }    // WooCommerce only
    public string? ConsumerSecret { get; set; } // WooCommerce only
}

public class ImportPreviewResponse
{
    public List<ImportedProductDto> Products { get; set; } = new();
    public int TotalFound { get; set; }
    public List<string> Categories { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}

// ── Confirm (save selected products) ─────────────────────────────────────────

public class ImportConfirmRequest
{
    public List<ImportedProductDto> Products { get; set; } = new();
    public bool CreateCategories { get; set; } = true;
}

public class ImportConfirmResponse
{
    public int Imported { get; set; }
    public int Failed { get; set; }
    public List<string> Errors { get; set; } = new();
}

// ── Shared product DTO ────────────────────────────────────────────────────────

public class ImportedProductDto
{
    public string ExternalId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public string? ImageUrl { get; set; }
    public List<string> AdditionalImages { get; set; } = new();
    public string? Category { get; set; }
    public string? Sku { get; set; }
    public int? StockQuantity { get; set; }
    /// <summary>True = user has checked this row for import.</summary>
    public bool Selected { get; set; } = true;
}


