using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Storefront;

public class StorefrontWishlistItem : TenantEntity
{
    public Guid StorefrontCustomerId { get; set; }
    public Guid ProductId { get; set; }

    public StorefrontCustomer? Customer { get; set; }
    public Product? Product { get; set; }
}
