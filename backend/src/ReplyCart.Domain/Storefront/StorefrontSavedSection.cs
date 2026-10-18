using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Storefront;

/// <summary>
/// A section the merchant saved to reuse on other pages (builder Phase 5a). Inserting it adds
/// a copy — saved sections are not linked, so editing a copy never changes the others.
/// </summary>
public class StorefrontSavedSection : TenantEntity
{
    public string Name { get; set; } = string.Empty;

    /// <summary>Section pack id, e.g. "hero" (for the gallery card).</summary>
    public string SectionType { get; set; } = string.Empty;

    /// <summary>The section instance (validated like a page section).</summary>
    public string SectionJson { get; set; } = "{}";
}
