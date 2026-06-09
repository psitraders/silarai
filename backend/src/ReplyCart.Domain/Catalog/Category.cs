using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Catalog;

public class Category : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // ── Subcategory support ───────────────────────────────────────────────────
    /// <summary>
    /// Null = root category. Non-null = subcategory of the specified parent.
    /// Max depth supported is 1 level (category → subcategory only).
    /// </summary>
    public Guid? ParentCategoryId { get; set; }

    /// <summary>
    /// When true this category appears in the storefront top navigation.
    /// Only meaningful on root categories (ParentCategoryId == null).
    /// </summary>
    public bool IsFeatured { get; set; }

    // ── Navigation ────────────────────────────────────────────────────────────
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = [];
    public ICollection<Product> Products { get; set; } = [];
}
