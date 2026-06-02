using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Storefront;

public class StorefrontPage : BaseEntity
{
    public Guid   TenantId    { get; set; }
    public string Title       { get; set; } = string.Empty;
    public string Slug        { get; set; } = string.Empty;   // e.g. "about-us"
    public string Content     { get; set; } = string.Empty;   // HTML content
    public bool   IsPublished { get; set; } = true;
    public bool   ShowInNav   { get; set; } = false;
    public bool   ShowInFooter{ get; set; } = false;
    public int    SortOrder   { get; set; } = 0;
}
