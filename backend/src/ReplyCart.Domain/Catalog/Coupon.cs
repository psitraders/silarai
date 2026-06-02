using ReplyCart.Domain.Common;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Domain.Catalog;

public class Coupon : TenantEntity
{
    public string Code { get; set; } = string.Empty;       // e.g. "SAVE20"
    public CouponType Type { get; set; }
    public decimal Value { get; set; }                      // 20 = 20% or ₹20 flat
    public decimal? MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsActive { get; set; } = true;
    // BuyXGetY fields
    public int? BuyQuantity { get; set; }
    public int? GetQuantity { get; set; }
}
