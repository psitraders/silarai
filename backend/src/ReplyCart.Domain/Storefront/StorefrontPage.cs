using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Storefront;

/// <summary>
/// A storefront page built with the storefront builder (Home, any number of custom
/// pages, and one "system" design per page type such as the product page or popup).
/// Layouts are stored as JSON documents (sections → blocks) that the backend never
/// interprets beyond the envelope and the smart values (see specs/storefront-builder.md).
/// </summary>
public class StorefrontPage : TenantEntity
{
    public string Title       { get; set; } = string.Empty;
    public string Slug        { get; set; } = string.Empty;   // e.g. "about-us"

    /// <summary>Custom (default for pages created before the builder), Home, or a system template.</summary>
    public StorefrontPageType PageType { get; set; } = StorefrontPageType.Custom;

    /// <summary>Builder layout being edited (autosaved). Null until the page is first saved in the builder.</summary>
    public string? DraftLayoutJson     { get; set; }

    /// <summary>Layout shoppers see. Only set by publish.</summary>
    public string? PublishedLayoutJson { get; set; }
    public DateTime? PublishedAt       { get; set; }

    public bool   IsPublished { get; set; } = true;
    public bool   ShowInNav   { get; set; } = false;
    public bool   ShowInFooter{ get; set; } = false;
    public int    SortOrder   { get; set; } = 0;

    // Per-page SEO (falls back to store-level SEO when empty)
    public string? SeoTitle       { get; set; }
    public string? SeoDescription { get; set; }
    public string? OgImageUrl     { get; set; }
}
