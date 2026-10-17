using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Storefront;

/// <summary>
/// One per tenant. Holds the storefront builder's site document: template id,
/// style kit + overrides, palette, font pair, store behaviour (product view mode,
/// card / cart / popup layouts), header, footer and navigation menus.
/// Drafts are autosaved; shoppers only ever see <see cref="PublishedJson"/>.
/// </summary>
public class StorefrontTheme : TenantEntity
{
    public string  DraftJson     { get; set; } = "{}";
    public string? PublishedJson { get; set; }
    public DateTime? PublishedAt { get; set; }

    /// <summary>Incremented on every publish; used by the storefront to bust caches.</summary>
    public int Version { get; set; }
}
