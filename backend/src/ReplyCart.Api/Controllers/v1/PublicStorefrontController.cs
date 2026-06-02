using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Customers;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Leads;
using ReplyCart.Domain.Marketing;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/public/{slug}")]
public class PublicStorefrontController(AppDbContext db, ITenantContext tenantContext) : ControllerBase
{
    // Fallback defaults — only used when a tenant hasn't configured their store yet
    private const string DefaultThemeColor     = "#0F766E";
    private const string DefaultWhatsAppCta    = "Order on WhatsApp";

    [HttpGet]
    public async Task<IActionResult> GetStorefront(string slug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved)
            return NotFound();

        var business = await db.Businesses
            .Include(b => b.StorefrontSettings)
            .Include(b => b.SocialLinks)
            .FirstOrDefaultAsync(ct);

        if (business == null)
            return NotFound();

        // Check if the tenant's subscription plan allows custom branding (hide "Powered by ReplyCart")
        var allowsCustomBranding = await db.TenantSubscriptions
            .Where(ts => ts.TenantId == tenantContext.CurrentTenantId
                      && (ts.Status == ReplyCart.Domain.Enums.SubscriptionStatus.Active
                       || ts.Status == ReplyCart.Domain.Enums.SubscriptionStatus.Trial))
            .Join(db.SubscriptionPlans, ts => ts.PlanId, p => p.Id, (ts, p) => p.AllowsCustomBranding)
            .FirstOrDefaultAsync(ct);

        return Ok(new
        {
            business.Name,
            business.Description,
            business.LogoUrl,
            business.BannerUrl,
            business.WhatsAppNumber,
            business.InstagramHandle,
            business.FacebookPageUrl,
            business.Currency,
            Slug = slug,
            ThemeColor = business.StorefrontSettings?.ThemeColor ?? DefaultThemeColor,
            WhatsAppCtaLabel = business.StorefrontSettings?.WhatsAppCtaLabel ?? DefaultWhatsAppCta,
            AnnouncementText = business.StorefrontSettings?.AnnouncementText,
            AllowsCustomBranding = allowsCustomBranding,
            SocialLinks = business.SocialLinks.Select(l => new { l.Platform, l.Url }),
            RazorpayEnabled = !string.IsNullOrWhiteSpace(business.RazorpayKeyId)
                           && !string.IsNullOrWhiteSpace(business.RazorpayKeySecret),
            RazorpayKeyId = business.RazorpayKeyId
        });
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(string slug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved)
            return NotFound();

        var categories = await db.Categories
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.SortOrder)
            .Select(c => new { c.Id, c.Name, c.Description, c.ImageUrl })
            .ToListAsync(ct);

        return Ok(categories);
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts(
        string slug,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? search = null,
        [FromQuery] string? sort = null,   // "price_asc" | "price_desc" | "newest"
        [FromQuery] bool? inStockOnly = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        if (!tenantContext.IsResolved)
            return NotFound();

        var query = db.Products
            .Include(p => p.Images)
            .Include(p => p.Category)
            .Where(p => p.Status == Domain.Enums.ProductStatus.Active);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.Title.Contains(search) || (p.Description != null && p.Description.Contains(search)));

        if (inStockOnly == true)
            query = query.Where(p => p.StockQuantity == null || p.StockQuantity > 0);

        query = sort switch
        {
            "price_asc" => query.OrderBy(p => p.DiscountedPrice ?? p.BasePrice),
            "price_desc" => query.OrderByDescending(p => p.DiscountedPrice ?? p.BasePrice),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.IsFeatured).ThenBy(p => p.SortOrder)
        };

        var totalCount = await query.CountAsync(ct);
        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Description,
                p.BasePrice,
                p.DiscountedPrice,
                p.IsFeatured,
                p.StockQuantity,
                PrimaryImage = p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault(),
                AllImages = p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
                CategoryName = p.Category != null ? p.Category.Name : null,
                CategoryId = p.CategoryId
            })
            .ToListAsync(ct);

        return Ok(new { items = products, totalCount, page, pageSize });
    }

    [HttpGet("products/{productId:guid}")]
    public async Task<IActionResult> GetProduct(string slug, Guid productId, CancellationToken ct)
    {
        if (!tenantContext.IsResolved)
            return NotFound();

        var product = await db.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Tags)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == productId && p.Status == Domain.Enums.ProductStatus.Active, ct);

        if (product == null)
            return NotFound();

        return Ok(new
        {
            product.Id,
            product.Title,
            product.Description,
            product.BasePrice,
            product.DiscountedPrice,
            product.Status,
            product.StockQuantity,
            Images = product.Images.OrderBy(i => i.SortOrder).Select(i => new { i.Url, i.IsPrimary }),
            Variants = product.Variants.Where(v => v.IsAvailable).Select(v => new { v.Name, v.Value, v.PriceAdjustment }),
            Tags = product.Tags.Select(t => t.Tag),
            CategoryName = product.Category?.Name
        });
    }

    [HttpPost("inquiry")]
    public async Task<IActionResult> SubmitInquiry(string slug, [FromBody] PublicInquiryRequest request, CancellationToken ct)
    {
        if (!tenantContext.IsResolved)
            return NotFound();

        var lead = new Lead
        {
            TenantId = tenantContext.CurrentTenantId,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            CustomerEmail = request.CustomerEmail,
            SourceChannel = request.Channel,
            InterestedProductId = request.ProductId,
            InquiryNote = request.Message,
            LastActivityDate = DateTime.UtcNow
        };
        db.Leads.Add(lead);

        // Upsert a potential customer from the inquiry.
        // Create a record whenever a name is provided, even without a phone number.
        if (!string.IsNullOrWhiteSpace(request.CustomerName))
        {
            Customer? existing = null;

            if (!string.IsNullOrWhiteSpace(request.CustomerPhone))
            {
                existing = await db.Customers
                    .FirstOrDefaultAsync(c => c.PhoneNumber == request.CustomerPhone, ct);
            }

            if (existing == null)
            {
                db.Customers.Add(new Customer
                {
                    TenantId = tenantContext.CurrentTenantId,
                    Name = request.CustomerName,
                    PhoneNumber = request.CustomerPhone ?? string.Empty,
                    Email = request.CustomerEmail,
                    PreferredChannel = request.Channel,
                    TotalOrders = 0,
                    TotalSpend = 0,
                });
            }
        }

        await db.SaveChangesAsync(ct);

        // Track abandoned cart if cart items were provided
        if (request.CartItems != null && request.CartItems.Any() && !string.IsNullOrWhiteSpace(request.CustomerPhone))
        {
            var cartTotal = request.CartItems.Sum(i => i.UnitPrice * i.Quantity);
            db.AbandonedCarts.Add(new AbandonedCart
            {
                TenantId = tenantContext.CurrentTenantId,
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                CustomerEmail = request.CustomerEmail,
                CartItemsJson = JsonSerializer.Serialize(request.CartItems),
                CartTotal = cartTotal,
                ItemCount = request.CartItems.Sum(i => i.Quantity),
                StoreSlug = slug
            });
            await db.SaveChangesAsync(ct);
        }

        return Ok(new { message = "Inquiry submitted successfully.", leadId = lead.Id });
    }

    // ── Coupon validation ──────────────────────────────────────────────────────
    [HttpPost("validate-coupon")]
    public async Task<IActionResult> ValidateCoupon(string slug, [FromBody] ValidateCouponRequest request, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        var code = request.Code?.Trim().ToUpperInvariant();
        if (string.IsNullOrEmpty(code))
            return BadRequest(new { errors = new[] { "Coupon code is required." } });

        var coupon = await db.Coupons.FirstOrDefaultAsync(c =>
            c.TenantId == tenantContext.CurrentTenantId &&
            c.Code == code &&
            c.IsActive, ct);

        if (coupon == null)
            return BadRequest(new { errors = new[] { "Invalid or expired coupon code." } });

        var now = DateTime.UtcNow;
        if (coupon.ValidFrom.HasValue && coupon.ValidFrom > now)
            return BadRequest(new { errors = new[] { "This coupon is not valid yet." } });
        if (coupon.ValidTo.HasValue && coupon.ValidTo < now)
            return BadRequest(new { errors = new[] { "This coupon has expired." } });
        if (coupon.MaxUses.HasValue && coupon.UsedCount >= coupon.MaxUses)
            return BadRequest(new { errors = new[] { "This coupon has reached its usage limit." } });
        if (coupon.MinOrderAmount.HasValue && request.OrderTotal < coupon.MinOrderAmount)
            return BadRequest(new { errors = new[] { $"Minimum order amount of {coupon.MinOrderAmount:0.##} required." } });

        decimal discount = coupon.Type switch
        {
            CouponType.Percentage => Math.Round(request.OrderTotal * coupon.Value / 100, 2),
            CouponType.Flat => Math.Min(coupon.Value, request.OrderTotal),
            CouponType.BuyXGetY => 0, // handled client-side for item count
            _ => 0
        };

        return Ok(new
        {
            coupon.Code, coupon.Type, coupon.Value, discount,
            coupon.BuyQuantity, coupon.GetQuantity,
            message = coupon.Type == CouponType.Percentage
                ? $"{coupon.Value}% off applied!"
                : coupon.Type == CouponType.Flat
                    ? $"₹{coupon.Value} off applied!"
                    : $"Buy {coupon.BuyQuantity} Get {coupon.GetQuantity} free!"
        });
    }

    // ── Product reviews (public) ───────────────────────────────────────────────
    [HttpGet("products/{productId:guid}/reviews")]
    public async Task<IActionResult> GetProductReviews(string slug, Guid productId, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        var reviews = await db.ProductReviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new { r.Id, r.ReviewerName, r.Rating, r.Comment, r.CreatedAt })
            .ToListAsync(ct);

        var avg = reviews.Any() ? reviews.Average(r => r.Rating) : 0.0;
        return Ok(new { items = reviews, averageRating = Math.Round(avg, 1), totalCount = reviews.Count });
    }

    [HttpPost("products/{productId:guid}/reviews")]
    public async Task<IActionResult> SubmitReview(string slug, Guid productId, [FromBody] SubmitReviewRequest request, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        if (request.Rating < 1 || request.Rating > 5)
            return BadRequest(new { errors = new[] { "Rating must be between 1 and 5." } });

        var product = await db.Products.AnyAsync(p => p.Id == productId, ct);
        if (!product) return NotFound();

        db.ProductReviews.Add(new ProductReview
        {
            TenantId = tenantContext.CurrentTenantId,
            ProductId = productId,
            ReviewerName = request.ReviewerName.Trim(),
            ReviewerEmail = request.ReviewerEmail?.Trim(),
            Rating = request.Rating,
            Comment = request.Comment?.Trim(),
            IsApproved = false // requires merchant approval
        });
        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Thank you! Your review is pending approval." });
    }
}

public record PublicInquiryRequest(
    string CustomerName,
    string? CustomerPhone,
    string? CustomerEmail,
    SocialPlatform Channel,
    Guid? ProductId,
    string? Message,
    IEnumerable<CartItemRequest>? CartItems = null
);
public record CartItemRequest(string ProductTitle, decimal UnitPrice, int Quantity, string? VariantInfo);
public record ValidateCouponRequest(string Code, decimal OrderTotal);
public record SubmitReviewRequest(string ReviewerName, string? ReviewerEmail, int Rating, string? Comment);
