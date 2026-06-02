using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Catalog;

public class ProductTag : TenantEntity
{
    public Guid ProductId { get; set; }
    public string Tag { get; set; } = string.Empty;

    public Product Product { get; set; } = null!;
}
