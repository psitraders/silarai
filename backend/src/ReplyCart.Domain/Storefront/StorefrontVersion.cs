using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Storefront;

/// <summary>
/// A snapshot of the whole published storefront, taken on every publish (builder Phase 5a).
/// The last 10 per tenant are kept; restoring one copies it into the drafts (nothing goes
/// live until the merchant publishes again).
/// </summary>
public class StorefrontVersion : TenantEntity
{
    /// <summary><see cref="StorefrontTheme.Version"/> after the publish.</summary>
    public int Version { get; set; }
    public DateTime PublishedAt { get; set; }

    /// <summary>The published site document (theme, header, footer, menus, behaviour).</summary>
    public string SiteJson { get; set; } = "{}";

    /// <summary>
    /// JSON array of every published page at that moment:
    /// <c>[{ pageId, pageType, title, slug, isPublished, showInNav, showInFooter, sortOrder, layout }]</c>.
    /// </summary>
    public string PagesJson { get; set; } = "[]";
    public int PageCount { get; set; }
}
