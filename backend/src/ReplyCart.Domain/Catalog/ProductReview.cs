using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Catalog;

public class ProductReview : TenantEntity
{
    public Guid ProductId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string? ReviewerEmail { get; set; }
    public int Rating { get; set; }        // 1–5
    public string? Comment { get; set; }
    public bool IsApproved { get; set; } = false;

    public Product Product { get; set; } = null!;
}
