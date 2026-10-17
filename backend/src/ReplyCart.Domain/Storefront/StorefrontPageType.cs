namespace ReplyCart.Domain.Storefront;

/// <summary>
/// Kind of storefront page. <see cref="Custom"/> is 0 so pages created by the old
/// page editor keep their meaning after the column is added.
/// Every type except Custom is unique per tenant.
/// </summary>
public enum StorefrontPageType
{
    Custom             = 0,
    Home               = 1,
    ProductTemplate    = 2,
    QuickViewTemplate  = 3,
    CollectionTemplate = 4,
    Cart               = 5,
    Search             = 6,
    NotFound           = 7,
}
