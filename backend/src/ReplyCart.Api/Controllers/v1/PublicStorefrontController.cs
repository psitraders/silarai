using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Business;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Customers;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Leads;
using ReplyCart.Domain.Marketing;
using ReplyCart.Domain.Orders;
using ReplyCart.Infrastructure.Persistence;
using ReplyCart.Infrastructure.Services;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/public/{slug}")]
public class PublicStorefrontController(
    AppDbContext db,
    ITenantContext tenantContext,
    IConfiguration configuration,
    IAiProvider aiProvider,
    IConversationMemoryService chatMemory,
    IEmailService emailService,
    CodOtpStore codOtpStore,
    ILogger<PublicStorefrontController> logger) : ControllerBase
{
    // Fallback defaults â€” only used when a tenant hasn't configured their store yet
    private const string DefaultThemeColor     = "#0F766E";
    private const string DefaultWhatsAppCta    = "Order on WhatsApp";

    private static string XmlEscape(string s) => s
        .Replace("&", "&amp;").Replace("<", "&lt;")
        .Replace(">", "&gt;").Replace("\"", "&quot;").Replace("'", "&apos;");

    /// <summary>Base URL for the merchant dashboard — always the main ReplyCart app.</summary>
    private string DashboardUrl => (configuration["FrontendUrl"] ?? "https://silarai.app").TrimEnd('/');

    /// <summary>
    /// Returns the storefront base URL for a given slug, respecting the tenant's custom domain.
    /// Custom domain takes priority; falls back to https://silarai.app/store/{slug}.
    /// </summary>
    private async Task<string> StorefrontBaseUrlAsync(string slug, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var tenant = await db.Tenants
            .Where(t => t.Id == tenantId)
            .Select(t => new { t.CustomDomain, t.CustomDomainStatus })
            .FirstOrDefaultAsync(ct);

        if (tenant?.CustomDomainStatus == "active" && !string.IsNullOrWhiteSpace(tenant.CustomDomain))
            return $"https://{tenant.CustomDomain}";

        return $"{DashboardUrl}/store/{slug}";
    }

    /// <summary>
    /// Converts a root-relative /uploads/... path to an absolute URL pointing at
    /// this Azure backend host. Old records stored before the upload-endpoint fix
    /// may have relative paths â€” this ensures the Vercel frontend can load them.
    /// </summary>
    private string? AbsoluteImageUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        if (url.StartsWith("http://") || url.StartsWith("https://")) return url; // already absolute
        return $"{Request.Scheme}://{Request.Host}{url}";
    }

    /// <summary>
    /// Strips everything except digits from a phone number so that "+91 98765-43210",
    /// "9876543210", and "91 9876543210" all map to the same canonical key.
    /// This prevents duplicate customer records caused by the AI extracting the same
    /// number in different formats across conversation turns.
    /// </summary>
    private static string NormalizePhone(string? phone)
        => new string((phone ?? string.Empty).Where(char.IsDigit).ToArray());

    /// <summary>
    /// Fetches the owner's contact email, their display name, and the store name
    /// in a single round-trip. Returns nulls gracefully if the tenant/business
    /// hasn't been set up yet â€” callers should always null-check <c>email</c>.
    /// </summary>
    private async Task<(string? email, string ownerName, string storeName)> LoadOwnerInfoAsync(
        Guid tenantId, CancellationToken ct)
    {
        var tenant = await db.Tenants
            .Where(t => t.Id == tenantId)
            .Select(t => new { t.ContactEmail, t.Name })
            .FirstOrDefaultAsync(ct);

        var bizName = await db.Businesses
            .Where(b => b.TenantId == tenantId)
            .Select(b => b.Name)
            .FirstOrDefaultAsync(ct);

        return (
            email:     tenant?.ContactEmail,
            ownerName: tenant?.Name ?? "Store Owner",
            storeName: bizName ?? tenant?.Name ?? "Your Store"
        );
    }

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

        var logoUrl   = AbsoluteImageUrl(business.LogoUrl);
        var bannerUrl = AbsoluteImageUrl(business.BannerUrl);

        // SEO â€” fall back to sensible defaults if tenant hasn't set custom values
        var seoTitle       = business.StorefrontSettings?.SeoTitle
                          ?? $"{business.Name} â€” Shop Online";
        var seoDescription = business.StorefrontSettings?.SeoDescription
                          ?? (string.IsNullOrWhiteSpace(business.Description)
                              ? $"Shop at {business.Name}. Browse our products and order easily on WhatsApp."
                              : business.Description);
        var seoImage       = bannerUrl ?? logoUrl; // best available image for OG card

        // Cache store config at CDN/browser for 5 min; serve stale for 60s while revalidating
        Response.Headers["Cache-Control"] = "public, max-age=300, stale-while-revalidate=60";
        return Ok(new
        {
            business.Name,
            business.Description,
            LogoUrl   = logoUrl,
            BannerUrl = bannerUrl,
            business.WhatsAppNumber,
            business.InstagramHandle,
            business.FacebookPageUrl,
            business.Currency,
            Slug = slug,
            ThemeColor      = business.StorefrontSettings?.ThemeColor      ?? DefaultThemeColor,
            SecondaryColor  = business.StorefrontSettings?.SecondaryColor  ?? "#134E4A",
            AccentColor     = business.StorefrontSettings?.AccentColor,
            WhatsAppCtaLabel = business.StorefrontSettings?.WhatsAppCtaLabel ?? DefaultWhatsAppCta,
            AnnouncementText = business.StorefrontSettings?.AnnouncementText,
            GA4MeasurementId = business.StorefrontSettings?.GA4MeasurementId,
            AllowsCustomBranding = allowsCustomBranding,
            SocialLinks = business.SocialLinks.Select(l => new { l.Platform, l.Url }),
            RazorpayEnabled = !string.IsNullOrWhiteSpace(business.RazorpayKeyId)
                           && !string.IsNullOrWhiteSpace(business.RazorpayKeySecret),
            RazorpayKeyId = business.RazorpayKeyId,
            // SEO / Open Graph
            SeoTitle       = seoTitle,
            SeoDescription = seoDescription,
            SeoImage       = seoImage,
            SeoKeywords    = business.StorefrontSettings?.SeoKeywords,
            ReturnPolicy   = business.StorefrontSettings?.ReturnPolicy,
            // Branding / UX
            FaviconUrl    = AbsoluteImageUrl(business.StorefrontSettings?.FaviconUrl),
            LoaderEnabled = business.StorefrontSettings?.LoaderEnabled ?? true,
            AllowPublicInquiries = business.StorefrontSettings?.AllowPublicInquiries ?? true,
        });
    }

    [HttpGet("manifest.json")]
    public async Task<IActionResult> GetPwaManifest(string slug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved)
            return NotFound();

        var business = await db.Businesses
            .Include(b => b.StorefrontSettings)
            .FirstOrDefaultAsync(ct);

        if (business == null)
            return NotFound();

        var themeColor = business.StorefrontSettings?.ThemeColor ?? DefaultThemeColor;
        var logoUrl    = AbsoluteImageUrl(business.LogoUrl); // ensure absolute for PWA icon
        var name       = business.Name ?? "Store";
        var shortName  = name.Length > 12 ? name[..12] : name;
        var desc       = business.Description ?? $"Shop at {name}";

        // Fallback icons live on the Vercel frontend â€” must be absolute URLs
        // because this manifest is served from the Azure API domain, not Vercel.
        var frontendUrl = (configuration["FrontendUrl"] ?? "https://silarai.app").TrimEnd('/');

        // Build icons array â€” use store logo if available, else fall back to ReplyCart PNGs
        object[] icons;
        if (!string.IsNullOrWhiteSpace(logoUrl))
        {
            icons =
            [
                new { src = logoUrl, sizes = "192x192", type = "image/png", purpose = "any" },
                new { src = logoUrl, sizes = "512x512", type = "image/png", purpose = "any maskable" },
            ];
        }
        else
        {
            icons =
            [
                new { src = $"{frontendUrl}/icon-192.png",     sizes = "192x192", type = "image/png", purpose = "any" },
                new { src = $"{frontendUrl}/icon-512.png",     sizes = "512x512", type = "image/png", purpose = "any" },
                new { src = $"{frontendUrl}/icon-maskable.png",sizes = "512x512", type = "image/png", purpose = "maskable" },
            ];
        }

        var manifest = new
        {
            name,
            short_name     = shortName,
            // Absolute id anchored to the Vercel frontend origin so that
            // navigator.getInstalledRelatedApps() can detect this store PWA.
            // Without an absolute id the browser resolves it against the
            // manifest URL origin (Azure), not the page origin (Vercel).
            id             = $"{frontendUrl}/{slug}",
            description    = desc,
            start_url      = $"/{slug}",
            scope          = "/",
            display        = "standalone",
            background_color = "#ffffff",
            theme_color    = themeColor,
            orientation    = "portrait-primary",
            icons,
        };

        Response.Headers["Cache-Control"] = "public, max-age=3600";
        return new JsonResult(manifest, new System.Text.Json.JsonSerializerOptions
        {
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower,
        })
        {
            ContentType = "application/manifest+json",
        };
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(string slug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved)
            return NotFound();

        // Load all active categories flat
        var all = await db.Categories
            .Where(c => !c.IsDeleted && c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new PublicCategoryFlat(
                c.Id, c.Name, c.Description, c.ImageUrl,
                c.IsFeatured, c.ParentCategoryId))
            .ToListAsync(ct);

        // Build subcategory map
        var subMap = all
            .Where(c => c.ParentCategoryId != null)
            .GroupBy(c => c.ParentCategoryId!.Value)
            .ToDictionary(
                g => g.Key,
                g => g.Select(c => new PublicSubCategoryDto(c.Id, c.Name, c.Description, c.ImageUrl)).ToList()
            );

        // Return root categories, each with their subcategories and featured flag
        var result = all
            .Where(c => c.ParentCategoryId == null)
            .Select(c => new PublicCategoryDto(
                c.Id, c.Name, c.Description, c.ImageUrl, c.IsFeatured,
                subMap.TryGetValue(c.Id, out var subs) ? subs : []))
            .ToList();

        Response.Headers["Cache-Control"] = "public, max-age=300, stale-while-revalidate=60";
        return Ok(result);
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
            // Show Active AND OutOfStock products â€” customers see the item but cannot purchase it
            .Where(p => p.Status == Domain.Enums.ProductStatus.Active
                     || p.Status == Domain.Enums.ProductStatus.OutOfStock);

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
                p.Slug,
                p.Title,
                p.Description,
                p.BasePrice,
                p.DiscountedPrice,
                p.IsFeatured,
                p.StockQuantity,
                IsOutOfStock = p.Status == Domain.Enums.ProductStatus.OutOfStock,
                PrimaryImage = p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault(),
                AllImages = p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
                CategoryName = p.Category != null ? p.Category.Name : null,
                CategoryId = p.CategoryId,
                // Lowest possible price considering variant price adjustments (null when no variants)
                MinVariantPrice = p.Variants.Any()
                    ? (p.DiscountedPrice ?? p.BasePrice) + p.Variants.Min(v => v.PriceAdjustment ?? 0)
                    : (decimal?)null
            })
            .ToListAsync(ct);

        Response.Headers["Cache-Control"] = "public, max-age=120, stale-while-revalidate=60";
        return Ok(new { items = products, totalCount, page, pageSize });
    }

    // Accepts both a slug ("rose-bouquet") and a GUID for backward compatibility
    [HttpGet("products/{productSlugOrId}")]
    public async Task<IActionResult> GetProduct(string slug, string productSlugOrId, CancellationToken ct)
    {
        if (!tenantContext.IsResolved)
            return NotFound();

        Product? product;

        if (Guid.TryParse(productSlugOrId, out var productId))
        {
            // Legacy UUID lookup (existing shareable links keep working)
            product = await db.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.Tags)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == productId
                    && (p.Status == Domain.Enums.ProductStatus.Active
                     || p.Status == Domain.Enums.ProductStatus.OutOfStock), ct);
        }
        else
        {
            // Slug lookup — case-insensitive
            product = await db.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.Tags)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Slug == productSlugOrId
                    && (p.Status == Domain.Enums.ProductStatus.Active
                     || p.Status == Domain.Enums.ProductStatus.OutOfStock), ct);
        }

        if (product == null)
            return NotFound();

        return Ok(new
        {
            product.Id,
            product.Slug,
            product.Title,
            product.Description,
            product.BasePrice,
            product.DiscountedPrice,
            product.Status,
            product.StockQuantity,
            IsOutOfStock = product.Status == Domain.Enums.ProductStatus.OutOfStock,
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
        bool isNewInquiryCustomer = false;
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
                isNewInquiryCustomer = true;
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

        // â”€â”€ Notify store owner â€” fire & forget so SMTP hiccups never fail the customer â”€â”€
        try
        {
            var (ownerEmail, ownerName, storeName) =
                await LoadOwnerInfoAsync(tenantContext.CurrentTenantId, CancellationToken.None);

            if (!string.IsNullOrWhiteSpace(ownerEmail))
            {
                // Look up the interested product title if an ID was provided
                string? productTitle = null;
                if (request.ProductId.HasValue)
                    productTitle = await db.Products
                        .Where(p => p.Id == request.ProductId.Value)
                        .Select(p => p.Title)
                        .FirstOrDefaultAsync(CancellationToken.None);

                await emailService.SendNewInquiryNotificationAsync(
                    toEmail:       ownerEmail,
                    ownerName:     ownerName,
                    storeName:     storeName,
                    customerName:  request.CustomerName,
                    customerPhone: request.CustomerPhone,
                    customerEmail: request.CustomerEmail,
                    channel:       request.Channel.ToString(),
                    productTitle:  productTitle,
                    message:       request.Message,
                    isNewCustomer: isNewInquiryCustomer,
                    ct:            CancellationToken.None);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[NOTIFY] Failed to send new-inquiry email to owner for tenant {TenantId}", tenantContext.CurrentTenantId);
        }

        return Ok(new { message = "Inquiry submitted successfully.", leadId = lead.Id });
    }

    // â”€â”€ AI Storefront Chatbot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    [HttpPost("chat")]
    public async Task<IActionResult> Chat(string slug, [FromBody] StorefrontChatRequest request, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();
        if (string.IsNullOrWhiteSpace(request.Message)) return BadRequest(new { error = "Message is required." });

        var sessionId = string.IsNullOrWhiteSpace(request.SessionId) ? Guid.NewGuid().ToString("N") : request.SessionId;

        // Load store info
        var business = await db.Businesses
            .Include(b => b.StorefrontSettings)
            .FirstOrDefaultAsync(ct);
        if (business == null) return NotFound();

        // Load all active products with category + images + variants for RAG context and card rendering
        var products = await db.Products
            .Where(p => p.Status == ProductStatus.Active)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Title)
            .ToListAsync(ct);

        // Build the RAG system prompt
        var systemPrompt = BuildChatSystemPrompt(business, products);

        // Retrieve session history
        var history = chatMemory.GetHistory(sessionId);

        ConversationReply aiReply;
        try
        {
            aiReply = await aiProvider.HandleConversationAsync(
                new ConversationRequest(systemPrompt, history, request.Message), ct);
        }
        catch
        {
            // AI unavailable â€” return a graceful fallback
            return Ok(new
            {
                sessionId,
                reply = $"Sorry, I'm having a moment! ðŸ˜… Please reach out to us on WhatsApp at {business.WhatsAppNumber ?? "our WhatsApp"} for instant help.",
                leadCreated = false,
            });
        }

        // â”€â”€ Lead / customer capture â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        bool leadCreated = false;
        if (!string.IsNullOrWhiteSpace(aiReply.ExtractedName) && !string.IsNullOrWhiteSpace(aiReply.ExtractedPhone))
        {
            // Normalize to digits-only so "+91 9876543210", "9876543210", "91-9876543210"
            // all resolve to the same canonical key â€” prevents duplicate leads/customers.
            var phone = NormalizePhone(aiReply.ExtractedPhone);
            var alreadyExists = await db.Leads
                .AnyAsync(l => l.TenantId == tenantContext.CurrentTenantId && l.CustomerPhone == phone, ct);

            if (!alreadyExists)
            {
                db.Leads.Add(new Lead
                {
                    TenantId         = tenantContext.CurrentTenantId,
                    CustomerName     = aiReply.ExtractedName.Trim(),
                    CustomerPhone    = phone,
                    SourceChannel    = SocialPlatform.Direct,
                    InquiryNote      = $"Lead captured via AI chatbot (session {sessionId}).",
                    LastActivityDate = DateTime.UtcNow,
                });

                var existingCustomer = await db.Customers
                    .FirstOrDefaultAsync(c => c.PhoneNumber == phone, ct);

                if (existingCustomer == null)
                {
                    db.Customers.Add(new Customer
                    {
                        TenantId         = tenantContext.CurrentTenantId,
                        Name             = aiReply.ExtractedName.Trim(),
                        PhoneNumber      = phone,
                        PreferredChannel = SocialPlatform.Direct,
                        TotalOrders      = 0,
                        TotalSpend       = 0,
                    });
                }

                await db.SaveChangesAsync(ct);
                leadCreated = true;

                // â”€â”€ Notify store owner of new lead â€” fire & forget â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                try
                {
                    var (ownerEmail, ownerName, storeName) =
                        await LoadOwnerInfoAsync(tenantContext.CurrentTenantId, CancellationToken.None);
                    if (!string.IsNullOrWhiteSpace(ownerEmail))
                        await emailService.SendNewLeadNotificationAsync(
                            toEmail:      ownerEmail,
                            ownerName:    ownerName,
                            storeName:    storeName,
                            customerName: aiReply.ExtractedName.Trim(),
                            customerPhone: phone,
                            ct:           CancellationToken.None);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[NOTIFY] Failed to send new-lead email for tenant {TenantId}", tenantContext.CurrentTenantId);
                }
            }
        }

        // â”€â”€ Order placement (order_ready state) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        object? orderPlaced        = null;
        object? onlinePaymentCart  = null;

        // Determine payment method early so we can relax conditions for online payment
        var earlyPaymentMethod = aiReply.ExtractedPaymentMethod?.ToLower()?.Trim();
        var earlyIsOnline = earlyPaymentMethod is "online" or "upi" or "gpay"
            or "google pay" or "phonepe" or "paytm" or "razorpay" or "card"
            or "net banking" or "netbanking" or "debit card" or "credit card";

        // For online payment we only need cart + state. For COD we need name+phone too.
        if (aiReply.StateSignal?.ToLower() == "order_ready"
            && !string.IsNullOrWhiteSpace(aiReply.ExtractedCartJson)
            && (earlyIsOnline || (!string.IsNullOrWhiteSpace(aiReply.ExtractedName)
                                 && !string.IsNullOrWhiteSpace(aiReply.ExtractedPhone))))
        {
            // â”€â”€ Programmatic data validation (AI may accept junk â€” we don't) â”€â”€â”€â”€
            // Skip name/phone/address validation for online payment (handled at Razorpay checkout)
            var rawName    = aiReply.ExtractedName?.Trim() ?? string.Empty;
            var rawPhone   = NormalizePhone(aiReply.ExtractedPhone ?? string.Empty);
            var rawAddress = aiReply.ExtractedAddress?.Trim() ?? string.Empty;

            if (!earlyIsOnline)
            {
                var nameLetters     = rawName.Where(char.IsLetter).ToArray();
                var uniqueNameChars = nameLetters.Select(char.ToLower).Distinct().Count();
                var hasVowel        = nameLetters.Any(c => "aeiouAEIOU".Contains(c));
                if (nameLetters.Length < 2 || uniqueNameChars < 2 || !hasVowel)
                {
                    var nameError = "That doesn't look like a real name. Could you please share your full name?";
                    chatMemory.AddMessages(sessionId, new ConversationMessage("user", request.Message), new ConversationMessage("assistant", nameError));
                    return Ok(new { sessionId, reply = nameError, leadCreated, mentionedProducts = Array.Empty<object>(), orderPlaced = (object?)null, onlinePaymentCart = (object?)null, slug });
                }
                var phoneDigitsEarly = rawPhone;
                if (phoneDigitsEarly.Length < 10 || phoneDigitsEarly.Length > 15)
                {
                    var phoneError = phoneDigitsEarly.Length > 15
                        ? "That number seems too long. Please share a valid 10-digit mobile number"
                        : "That doesn't look like a valid phone number. Could you please share your 10-digit mobile number?";
                    chatMemory.AddMessages(sessionId, new ConversationMessage("user", request.Message), new ConversationMessage("assistant", phoneError));
                    return Ok(new { sessionId, reply = phoneError, leadCreated, mentionedProducts = Array.Empty<object>(), orderPlaced = (object?)null, onlinePaymentCart = (object?)null, slug });
                }
                var addressLettersAndDigits = rawAddress.Where(c => char.IsLetterOrDigit(c)).Count();
                var addressHasSpace         = rawAddress.Contains(' ');
                var addressHasDigit         = rawAddress.Any(char.IsDigit);
                if (addressLettersAndDigits < 8 || !addressHasSpace || !addressHasDigit)
                {
                    var addressError = "That doesn't look like a complete delivery address. Please include your door/flat number, street, and area.";
                    chatMemory.AddMessages(sessionId, new ConversationMessage("user", request.Message), new ConversationMessage("assistant", addressError));
                    return Ok(new { sessionId, reply = addressError, leadCreated, mentionedProducts = Array.Empty<object>(), orderPlaced = (object?)null, onlinePaymentCart = (object?)null, slug });
                }
            }

            List<AiCartItem>? aiCart = null;
            try
            {
                aiCart = JsonSerializer.Deserialize<List<AiCartItem>>(
                    aiReply.ExtractedCartJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch { /* ignore malformed cart JSON */ }

            // Server is the price authority — overwrite the AI's unit_price with the
            // real catalogue price (base/discounted + variant adjustment) so the total
            // the customer sees and pays is always correct.
            if (aiCart != null && aiCart.Count > 0)
            {
                aiCart = aiCart.Select(i =>
                {
                    var p = Guid.TryParse(i.ProductId, out var pid)
                        ? products.FirstOrDefault(x => x.Id == pid)
                        : null;
                    p ??= products.FirstOrDefault(x =>
                        string.Equals(x.Title.Trim(), i.Title.Trim(), StringComparison.OrdinalIgnoreCase));
                    return p == null ? i : i with { UnitPrice = ResolveUnitPrice(p, i.VariantInfo) };
                }).ToList();
            }

            var paymentMethodEarly = aiReply.ExtractedPaymentMethod?.ToLower()?.Trim();
            var isOnlineEarly = paymentMethodEarly is "online" or "upi" or "gpay"
                or "google pay" or "phonepe" or "paytm" or "razorpay" or "card"
                or "net banking" or "netbanking" or "debit card" or "credit card";
            if ((aiCart == null || aiCart.Count == 0) && isOnlineEarly)
            {
                var retryMsg = "I lost track of your cart! Could you tell me which product and quantity you want? I will set up your payment right away.";
                chatMemory.AddMessages(sessionId,
                    new ConversationMessage("user",      request.Message),
                    new ConversationMessage("assistant", retryMsg));
                return Ok(new { sessionId, reply = retryMsg, leadCreated, mentionedProducts = Array.Empty<object>(), orderPlaced = (object?)null, onlinePaymentCart = (object?)null, slug });
            }
            if (aiCart != null && aiCart.Count > 0)
            {
                var paymentMethod    = aiReply.ExtractedPaymentMethod?.ToLower()?.Trim();
                var tenantId        = tenantContext.CurrentTenantId;
                // Treat any digital payment as "online" â€” the AI may output "upi", "gpay",
                // "phonepe", "paytm", "razorpay", "card", etc.
                var isOnlinePayment = paymentMethod is "online" or "upi" or "gpay"
                    or "google pay" or "phonepe" or "paytm" or "razorpay" or "card"
                    or "net banking" or "netbanking" or "debit card" or "credit card";

                if (isOnlinePayment)
                {
                    // Return cart items so the frontend can redirect to Razorpay checkout
                    onlinePaymentCart = new
                    {
                        items = aiCart.Select(i => new
                        {
                            productId   = i.ProductId,
                            title       = i.Title,
                            variantInfo = i.VariantInfo,
                            qty         = i.Qty,
                            unitPrice   = i.UnitPrice,
                        }).ToList(),
                        customerName  = aiReply.ExtractedName?.Trim(),
                        customerPhone = aiReply.ExtractedPhone?.Trim(),
                        address       = aiReply.ExtractedAddress?.Trim(),
                    };
                }
                else
                {
                    // â”€â”€ Stock validation (match cart items to loaded products) â”€â”€â”€â”€
                    // products is already in EF tracking so modifications will save
                    string? stockError = null;
                    foreach (var cartItem in aiCart)
                    {
                        var dbProduct = Guid.TryParse(cartItem.ProductId, out var cartPid)
                            ? products.FirstOrDefault(p => p.Id == cartPid)
                            : null;

                        // Fall back to title match if ID wasn't found
                        dbProduct ??= products.FirstOrDefault(p =>
                            string.Equals(p.Title.Trim(), cartItem.Title.Trim(), StringComparison.OrdinalIgnoreCase));

                        if (dbProduct == null) continue;

                        if (dbProduct.Status == ProductStatus.OutOfStock)
                        {
                            stockError = $"Sorry, '{dbProduct.Title}' is currently out of stock. Would you like to choose a different product?";
                            break;
                        }

                        if (dbProduct.StockQuantity.HasValue && cartItem.Qty > dbProduct.StockQuantity.Value)
                        {
                            stockError = dbProduct.StockQuantity.Value > 0
                                ? $"Sorry, we only have {dbProduct.StockQuantity.Value} unit(s) of '{dbProduct.Title}' available right now (you requested {cartItem.Qty}). Would you like to order {dbProduct.StockQuantity.Value} instead?"
                                : $"Sorry, '{dbProduct.Title}' is out of stock. Would you like to choose a different product?";
                            break;
                        }
                    }

                    if (stockError != null)
                    {
                        // Override the AI reply with the stock error and skip order placement
                        chatMemory.AddMessages(sessionId,
                            new ConversationMessage("user",      request.Message),
                            new ConversationMessage("assistant", stockError));

                        return Ok(new
                        {
                            sessionId,
                            reply             = stockError,
                            leadCreated,
                            mentionedProducts = Array.Empty<object>(),
                            orderPlaced       = (object?)null,
                            onlinePaymentCart = (object?)null,
                            slug,
                        });
                    }

                    // â”€â”€ Instead of placing immediately, request email OTP verification â”€â”€
                    var chatTotalAmount = aiCart.Sum(i => i.Qty * i.UnitPrice);

                    // Return a "pending" signal â€” the frontend will collect email + OTP,
                    // then call POST /chat/confirm-cod-order to actually place the order.
                    orderPlaced = null;
                    onlinePaymentCart = null;

                    chatMemory.AddMessages(sessionId,
                        new ConversationMessage("user",      request.Message),
                        new ConversationMessage("assistant", aiReply.ReplyText ?? string.Empty));

                    return Ok(new
                    {
                        sessionId,
                        reply        = aiReply.ReplyText ?? string.Empty,
                        leadCreated,
                        mentionedProducts = Array.Empty<object>(),
                        orderPlaced       = (object?)null,
                        onlinePaymentCart = (object?)null,
                        slug,
                        // â† this signals the frontend to show the email OTP form
                        pendingCodOrder = new
                        {
                            name        = aiReply.ExtractedName!.Trim(),
                            phone       = rawPhone,
                            address     = aiReply.ExtractedAddress?.Trim() ?? string.Empty,
                            totalAmount = chatTotalAmount,
                            cart        = aiCart.Select(i => new
                            {
                                productId   = i.ProductId,
                                title       = i.Title,
                                variantInfo = i.VariantInfo,
                                qty         = i.Qty,
                                unitPrice   = i.UnitPrice,
                            }).ToList(),
                        },
                    });
                }
            }
        }

        // -- Detect mentioned products for mini-cards --
        // Skip cards entirely when an order was just placed.
        var replyLower    = aiReply.ReplyText.ToLowerInvariant();
        var msgLower      = request.Message.ToLowerInvariant();

        // Helper: does the reply contain enough words from this product title?
        static bool TitleMatchesReply(string titleLower, string replyLower)
        {
            if (replyLower.Contains(titleLower)) return true;
            var words = titleLower.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                  .Where(w => w.Length >= 4).ToArray();
            if (words.Length == 0) return false;
            var matchCount = words.Count(w => replyLower.Contains(w));
            return matchCount >= Math.Min(2, words.Length);
        }

        // When user asks to browse/see featured products, show them directly
        var browseTrigger = msgLower.Contains("featured") || msgLower.Contains("browse")
                         || msgLower.Contains("all product") || msgLower.Contains("show product");

        var productPool = (orderPlaced != null || onlinePaymentCart != null)
            ? []
            : browseTrigger
                ? products.Where(p => p.IsFeatured).ToList()   // featured products when browsing
                : products.Where(p => TitleMatchesReply(p.Title.ToLowerInvariant(), replyLower)).ToList();

        var mentionedProducts = productPool
            .Take(4)
            .Select(p =>
            {
                var img = p.Images.OrderBy(i => i.SortOrder).FirstOrDefault(i => i.IsPrimary)
                       ?? p.Images.OrderBy(i => i.SortOrder).FirstOrDefault();
                var minVariantPrice = p.Variants.Any(v => v.IsAvailable)
                    ? (p.DiscountedPrice ?? p.BasePrice) + p.Variants.Where(v => v.IsAvailable).Min(v => v.PriceAdjustment ?? 0)
                    : (decimal?)null;
                return new
                {
                    id              = p.Id,
                    title           = p.Title,
                    basePrice       = p.BasePrice,
                    discountedPrice = p.DiscountedPrice,
                    minVariantPrice,
                    primaryImage    = AbsoluteImageUrl(img?.Url),
                    categoryName    = p.Category?.Name,
                    isFeatured      = p.IsFeatured,
                };
            })
            .ToList();

        // Persist turn to session memory
        chatMemory.AddMessages(sessionId,
            new ConversationMessage("user",      request.Message),
            new ConversationMessage("assistant", aiReply.ReplyText));

        return Ok(new
        {
            sessionId,
            reply             = aiReply.ReplyText,
            leadCreated,
            mentionedProducts,
            orderPlaced,
            onlinePaymentCart,
            slug,
        });
    }

    /// <summary>Builds the RAG system prompt from store info and full product catalog (with variants).</summary>
    private static string BuildChatSystemPrompt(Business business, List<Product> products)
    {
        var sb       = new StringBuilder();
        var currency = business.Currency ?? "INR";

        sb.AppendLine($"You are a friendly, helpful AI shopping assistant for '{business.Name}'.");
        sb.AppendLine("Always reply in the same language the customer uses (Hindi/Hinglish/English). Be warm, concise, and action-oriented.");

        if (!string.IsNullOrWhiteSpace(business.Description))
            sb.AppendLine($"About the store: {business.Description}");

        if (!string.IsNullOrWhiteSpace(business.DeliveryInfo))
            sb.AppendLine($"Delivery info: {business.DeliveryInfo}");

        if (!string.IsNullOrWhiteSpace(business.AiStoreContext))
            sb.AppendLine($"Store policies/FAQ: {business.AiStoreContext}");

        sb.AppendLine();
        sb.AppendLine("=== PRODUCT CATALOG ===");
        sb.AppendLine("(Use the exact Product ID when building the cart JSON â€” copy it character-for-character)");
        sb.AppendLine();

        if (products.Count == 0)
        {
            sb.AppendLine("(No products are available at this time.)");
        }
        else
        {
            foreach (var p in products)
            {
                var category  = p.Category?.Name ?? "General";
                var basePrice = p.DiscountedPrice ?? p.BasePrice;
                var priceStr  = p.DiscountedPrice.HasValue
                    ? $"{p.BasePrice:F0} (sale: {p.DiscountedPrice.Value:F0})"
                    : $"{p.BasePrice:F0}";

                sb.Append($"â€¢ [Product ID: {p.Id}] [{category}] {p.Title} â€” {currency} {priceStr}");
                if (!string.IsNullOrWhiteSpace(p.Description))
                    sb.Append($" | {p.Description.Replace("\n", " ")}");
                sb.AppendLine();

                // List available variants with final prices
                var availableVariants = p.Variants.Where(v => v.IsAvailable).ToList();
                if (availableVariants.Count > 0)
                {
                    sb.AppendLine($"  Variants (ask customer to choose ONE):");
                    foreach (var v in availableVariants)
                    {
                        var finalPrice  = basePrice + (v.PriceAdjustment ?? 0);
                        var adjDisplay  = v.PriceAdjustment.HasValue && v.PriceAdjustment != 0
                            ? (v.PriceAdjustment > 0 ? $", +{currency} {v.PriceAdjustment:F0}" : $", -{currency} {Math.Abs(v.PriceAdjustment.Value):F0}")
                            : "";
                        sb.AppendLine($"    - {v.Name}: {v.Value} â†’ {currency} {finalPrice:F0}{adjDisplay}");
                    }
                }
            }
        }

        sb.AppendLine();
        sb.AppendLine("=== FORMATTING RULES (CRITICAL â€” follow exactly) ===");
        sb.AppendLine("â€¢ Write in plain conversational text ONLY â€” like a WhatsApp message.");
        sb.AppendLine("â€¢ NEVER use markdown: no **bold**, no *italic*, no # headings, no - bullet lists, no `code`.");
        sb.AppendLine("PRODUCT CARD RULE: When recommending products, say only the product name naturally. NEVER list products with descriptions, prices, ingredients or specs. The app shows product cards with full details automatically.");
        sb.AppendLine("â€¢ For order summaries write a single flowing sentence, e.g.: \"Your order: 2 packs of Hair Colour (Red) to JHGHJGDABD, COD â€” does that look right?\"");
        sb.AppendLine("â€¢ Do NOT repeat the customer's exact input back to them in quotes unless clarifying a typo.");
        sb.AppendLine();
        sb.AppendLine("=== INPUT VALIDATION RULES (CRITICAL â€” enforce before proceeding) ===");
        sb.AppendLine("Phone number:");
        sb.AppendLine("  â€¢ Must contain at least 10 digits (Indian mobile number).");
        sb.AppendLine("  â€¢ If the customer gives fewer than 10 digits, or random letters like 'PPPPP' or 'ABCDE', say:");
        sb.AppendLine("    \"That doesn't look like a valid phone number. Could you share your 10-digit mobile number? ðŸ“±\"");
        sb.AppendLine("  â€¢ Do NOT proceed or save the phone until it has at least 10 digits.");
        sb.AppendLine("Name:");
        sb.AppendLine("  â€¢ Must look like a real person's name â€” at least 2 characters, contains actual letters, not random repeated letters.");
        sb.AppendLine("  â€¢ If the name looks fake (e.g., 'DDDD', 'XXXX', single letters, only numbers), say:");
        sb.AppendLine("    \"Could you share your real name so I can address your order correctly? ðŸ˜Š\"");
        sb.AppendLine("  â€¢ Do NOT proceed with a name that is clearly not a real name.");
        sb.AppendLine("Address:");
        sb.AppendLine("  â€¢ Must be at least 10 characters and look like an actual address (house/area/city).");
        sb.AppendLine("  â€¢ If it looks like random text, ask for a proper delivery address.");
        sb.AppendLine();
        sb.AppendLine("=== CONVERSATION FLOW ===");
        sb.AppendLine("Step 1. Greet and help customer browse / answer questions.");
        sb.AppendLine("Step 2. When customer wants to order a specific product:");
        sb.AppendLine("   a) If product has variants â€” show the options with prices and ask which they want.");
        sb.AppendLine("   b) Ask for quantity.");
        sb.AppendLine("Step 3. Collect full name, delivery address, phone â€” validate each before moving on.");
        sb.AppendLine("Step 4. Ask payment method: Cash on Delivery (COD) or Online Payment (UPI / GPay / PhonePe / Paytm / card).");
        sb.AppendLine("Step 5. Confirm order in ONE plain sentence and ask customer to confirm.");
        sb.AppendLine("Step 6. Once customer says yes / confirm / ok â€” ALWAYS output the FULL order_ready JSON (name, phone, address, payment_method, cart). NEVER reply with plain text at this step.");
        sb.AppendLine();
        sb.AppendLine("=== JSON STATES ===");
        sb.AppendLine("When name + phone are both valid (but order not yet confirmed):");
        sb.AppendLine("  {\"reply\":\"...\",\"state\":\"lead_captured\",\"name\":\"<name>\",\"phone\":\"<phone>\"}");
        sb.AppendLine("When customer confirms the order:");
        sb.AppendLine("  ONLINE payment: {\"reply\":\"Great! Click below to pay online.\",\"state\":\"order_ready\",\"name\":\"<name>\",\"phone\":\"<phone>\",\"address\":\"<address>\",\"payment_method\":\"online\",\"cart\":[{\"product_id\":\"<ID>\",\"title\":\"<title>\",\"variant_info\":null,\"qty\":1,\"unit_price\":100}]}");
        sb.AppendLine("  COD payment:    {\"reply\":\"Your order has been placed!\",\"state\":\"order_ready\",\"name\":\"<name>\",\"phone\":\"<phone>\",\"address\":\"<address>\",\"payment_method\":\"cod\",\"cart\":[{\"product_id\":\"<ID>\",\"title\":\"<title>\",\"variant_info\":null,\"qty\":1,\"unit_price\":100}]}");
        sb.AppendLine("  CRITICAL: payment_method MUST match what customer chose. Online/UPI/GPay/card = online. Cash = cod.");
        sb.AppendLine("  CRITICAL: cart array is REQUIRED and MUST include every item ordered with exact product_id, title, qty, and unit_price. Never output an empty cart array.");
        sb.AppendLine("  Use payment_method: \"online\" for ANY digital payment: UPI, GPay, PhonePe, Paytm, Razorpay, debit/credit card, net banking â€” all map to \"online\".");
        sb.AppendLine("  Use payment_method: \"cod\" ONLY for Cash on Delivery.");
        sb.AppendLine("CRITICAL: The order_ready JSON is MANDATORY when confirming an order. If customer says 'yes', 'confirm', 'ok', 'proceed', 'place order' or similar after seeing order summary, you MUST output the full JSON immediately.");
        sb.AppendLine("For all other turns: output plain text only (no JSON, no markdown).");

        return sb.ToString();
    }

    // â”€â”€ Coupon validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                    ? $"â‚¹{coupon.Value} off applied!"
                    : $"Buy {coupon.BuyQuantity} Get {coupon.GetQuantity} free!"
        });
    }

    // â”€â”€ Product reviews (public) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

        // Verify the reviewer has actually ordered this product
        if (!string.IsNullOrWhiteSpace(request.ReviewerPhone))
        {
            var hasPurchased = await db.Orders
                .Where(o => o.TenantId == tenantContext.CurrentTenantId
                         && o.CustomerPhone == request.ReviewerPhone.Trim())
                .AnyAsync(o => o.Items.Any(i => i.ProductId == productId), ct);

            if (!hasPurchased)
                return BadRequest(new { errors = new[] { "You can only review products you have purchased." } });
        }

        db.ProductReviews.Add(new ProductReview
        {
            TenantId = tenantContext.CurrentTenantId,
            ProductId = productId,
            ReviewerName = request.ReviewerName.Trim(),
            ReviewerEmail = request.ReviewerEmail?.Trim(),
            Rating = request.Rating,
            Comment = request.Comment?.Trim(),
            IsApproved = false
        });
        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Thank you! Your review is pending approval." });
    }

    // â”€â”€ COD orders (public) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // â”€â”€ Chat COD confirm â€” place order after OTP verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // ── Server-side price authority ───────────────────────────────────────────
    // Never trust the unit price supplied by the AI or the client. Recompute every
    // line item from the catalogue: (discounted ?? base) price + matched variant
    // adjustment. Prevents wrong order totals (e.g. AI quoting ₹9400 but writing ₹4900).
    private static decimal ResolveUnitPrice(Domain.Catalog.Product product, string? variantInfo)
    {
        var basePrice = product.DiscountedPrice ?? product.BasePrice;
        var variants  = product.Variants?.Where(v => v.IsAvailable).ToList();
        if (variants == null || variants.Count == 0 || string.IsNullOrWhiteSpace(variantInfo))
            return basePrice;

        var vi = variantInfo.Trim().ToLowerInvariant();
        var match = variants.FirstOrDefault(v =>
                (!string.IsNullOrWhiteSpace(v.Value) && vi.Contains(v.Value.Trim().ToLowerInvariant()))
             || (!string.IsNullOrWhiteSpace(v.Name)  && vi.Contains(v.Name.Trim().ToLowerInvariant())));
        return basePrice + (match?.PriceAdjustment ?? 0);
    }

    [HttpPost("chat/confirm-cod-order")]
    public async Task<IActionResult> ConfirmChatCodOrder(
        string slug,
        [FromBody] ConfirmChatCodRequest req,
        CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        // Verify OTP
        if (string.IsNullOrWhiteSpace(req.CustomerEmail))
            return BadRequest(new { error = "Email is required." });
        if (string.IsNullOrWhiteSpace(req.EmailOtp))
            return BadRequest(new { error = "Verification code is required." });
        if (!codOtpStore.Verify(req.CustomerEmail, req.EmailOtp))
            return BadRequest(new { error = "Invalid or expired verification code. Please request a new one." });

        if (req.Cart == null || !req.Cart.Any())
            return BadRequest(new { error = "Cart is empty." });

        var tenantId    = tenantContext.CurrentTenantId;

        // Server is the price authority — recompute every line from the catalogue,
        // never trust the client-supplied unit price.
        var codProducts = await db.Products
            .Where(p => p.TenantId == tenantId)
            .Include(p => p.Variants)
            .ToListAsync(ct);
        decimal ResolveCartPrice(ChatCartItem i)
        {
            var p = Guid.TryParse(i.ProductId, out var pid) ? codProducts.FirstOrDefault(x => x.Id == pid) : null;
            p ??= codProducts.FirstOrDefault(x => string.Equals(x.Title.Trim(), i.Title.Trim(), StringComparison.OrdinalIgnoreCase));
            return p == null ? i.UnitPrice : ResolveUnitPrice(p, i.VariantInfo);
        }
        var pricedCart  = req.Cart.Select(i => new { Item = i, Unit = ResolveCartPrice(i) }).ToList();
        var totalAmount = pricedCart.Sum(x => x.Unit * x.Item.Qty);
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        // Normalize phone to digits-only so the lookup is consistent regardless of
        // how the AI formatted the number in different turns (e.g. "+91 9876543210" vs "9876543210").
        var normalizedPhone = NormalizePhone(req.CustomerPhone);

        // Customer upsert â€” search by normalized phone (global EF filter already scopes to tenant)
        Customer? customer = string.IsNullOrEmpty(normalizedPhone)
            ? null
            : await db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == normalizedPhone, ct);

        if (customer != null)
        {
            customer.TotalOrders++;
            customer.TotalSpend   += totalAmount;
            customer.LastOrderDate = DateTime.UtcNow;
            customer.Email         = req.CustomerEmail.Trim();
            if (!string.IsNullOrWhiteSpace(req.CustomerName))
                customer.Name = req.CustomerName.Trim();
        }
        else
        {
            customer = new Customer
            {
                TenantId         = tenantId,
                Name             = req.CustomerName.Trim(),
                PhoneNumber      = normalizedPhone,
                Email            = req.CustomerEmail.Trim(),
                PreferredChannel = SocialPlatform.Direct,
                TotalOrders      = 1,
                TotalSpend       = totalAmount,
                LastOrderDate    = DateTime.UtcNow,
            };
            db.Customers.Add(customer);
        }

        var orderItems = pricedCart.Select(x => new OrderItem
        {
            TenantId     = tenantId,
            ProductId    = Guid.TryParse(x.Item.ProductId, out var pid) ? pid : Guid.Empty,
            ProductTitle = x.Item.Title,
            VariantInfo  = x.Item.VariantInfo,
            Quantity     = x.Item.Qty,
            UnitPrice    = x.Unit,
            TotalPrice   = x.Unit * x.Item.Qty,
        }).ToList();

        var order = new Order
        {
            TenantId        = tenantId,
            OrderNumber     = orderNumber,
            CustomerId      = customer.Id,
            SourceChannel   = SocialPlatform.Direct,
            CustomerName    = req.CustomerName.Trim(),
            CustomerPhone   = req.CustomerPhone.Trim(),
            DeliveryAddress = req.DeliveryAddress?.Trim(),
            Notes           = "Order placed via AI chatbot (email verified)",
            TotalAmount     = totalAmount,
            Status          = OrderStatus.New,
            PaymentStatus   = PaymentStatus.Pending,
            Items           = orderItems,
        };

        order.StatusHistory.Add(new OrderStatusHistory
        {
            TenantId   = tenantId,
            OrderId    = order.Id,
            FromStatus = OrderStatus.New,
            ToStatus   = OrderStatus.New,
            Note       = "COD order placed via AI chatbot (email verified)",
        });

        db.Orders.Add(order);

        // Decrement stock (reuse the already-loaded catalogue)
        foreach (var cartItem in req.Cart)
        {
            var dbProd = Guid.TryParse(cartItem.ProductId, out var spid)
                ? codProducts.FirstOrDefault(p => p.Id == spid)
                : codProducts.FirstOrDefault(p =>
                    string.Equals(p.Title.Trim(), cartItem.Title.Trim(), StringComparison.OrdinalIgnoreCase));

            if (dbProd?.StockQuantity != null)
            {
                dbProd.StockQuantity = Math.Max(0, dbProd.StockQuantity.Value - cartItem.Qty);
                if (dbProd.StockQuantity <= 0 && dbProd.Status == ProductStatus.Active)
                    dbProd.Status = ProductStatus.OutOfStock;
            }
        }

        await db.SaveChangesAsync(ct);

        // â”€â”€ Notify store owner â€” fire & forget â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        try
        {
            var (ownerEmail, ownerName, storeName) =
                await LoadOwnerInfoAsync(tenantId, CancellationToken.None);

            if (!string.IsNullOrWhiteSpace(ownerEmail))
            {
                var notifItems = pricedCart.Select(x =>
                    new OrderNotificationItem(x.Item.Title, x.Item.VariantInfo, x.Item.Qty, x.Unit));

                await emailService.SendNewOrderNotificationAsync(
                    toEmail:         ownerEmail,
                    ownerName:       ownerName,
                    storeName:       storeName,
                    orderNumber:     order.OrderNumber,
                    customerName:    req.CustomerName.Trim(),
                    customerPhone:   normalizedPhone,
                    customerEmail:   req.CustomerEmail.Trim(),
                    deliveryAddress: req.DeliveryAddress?.Trim(),
                    totalAmount:     totalAmount,
                    currency:        "INR",
                    items:           notifItems,
                    source:          "AI Chatbot",
                    isNewCustomer:   customer.TotalOrders == 1,
                    manageOrderUrl:  $"{DashboardUrl}/orders/{order.Id}",
                    ct:              CancellationToken.None);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[NOTIFY] Failed to send new-order email for order {OrderNumber}", order.OrderNumber);
        }

        // â”€â”€ Customer order confirmation / bill â€” fire & forget â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        try
        {
            if (!string.IsNullOrWhiteSpace(req.CustomerEmail))
            {
                var confItems    = pricedCart.Select(x => new OrderNotificationItem(x.Item.Title, x.Item.VariantInfo, x.Item.Qty, x.Unit));
                var sfBase       = await StorefrontBaseUrlAsync(slug, CancellationToken.None);
                var trackingUrl  = $"{sfBase}/order-confirmation/{order.Id}";
                var (_, _, sName) = await LoadOwnerInfoAsync(tenantId, CancellationToken.None);

                await emailService.SendOrderConfirmationAsync(
                    toEmail:         req.CustomerEmail.Trim(),
                    toName:          req.CustomerName.Trim(),
                    storeName:       sName,
                    orderNumber:     order.OrderNumber,
                    deliveryAddress: req.DeliveryAddress?.Trim(),
                    totalAmount:     totalAmount,
                    currency:        "INR",
                    items:           confItems,
                    trackingUrl:     trackingUrl,
                    ct:              CancellationToken.None);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[CONFIRM] Failed to send order confirmation email for order {OrderNumber}", order.OrderNumber);
        }

        return Ok(new { orderId = order.Id, orderNumber = order.OrderNumber, totalAmount, slug });
    }

    // â”€â”€ COD email OTP â€” send â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    [HttpPost("cod-otp/send")]
    public async Task<IActionResult> SendCodOtp(
        string slug,
        [FromBody] SendCodOtpRequest request,
        CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { error = "Email is required." });

        // Fetch store name for the email template
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);
        var storeName = business?.Name ?? slug;

        var otp = codOtpStore.Generate(request.Email);

        try
        {
            await emailService.SendCodOtpAsync(
                request.Email.Trim(),
                request.CustomerName?.Trim() ?? "Customer",
                storeName,
                otp,
                ct);
        }
        catch
        {
            return StatusCode(500, new { error = "Failed to send verification email. Please try again." });
        }

        return Ok(new { message = "Verification code sent." });
    }

    [HttpPost("cod-order")]
    public async Task<IActionResult> PlaceCodOrder(string slug, [FromBody] CodOrderRequest request, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        if (string.IsNullOrWhiteSpace(request.CustomerName))
            return BadRequest(new { errors = new[] { "Customer name is required." } });
        if (request.Items == null || !request.Items.Any())
            return BadRequest(new { errors = new[] { "Order must contain at least one item." } });

        // â”€â”€ Email OTP verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (string.IsNullOrWhiteSpace(request.CustomerEmail))
            return BadRequest(new { errors = new[] { "Email verification is required for COD orders." } });
        if (string.IsNullOrWhiteSpace(request.EmailOtp))
            return BadRequest(new { errors = new[] { "Please enter the verification code sent to your email." } });
        if (!codOtpStore.Verify(request.CustomerEmail, request.EmailOtp))
            return BadRequest(new { errors = new[] { "Invalid or expired verification code. Please request a new one." } });

        var tenantId = tenantContext.CurrentTenantId;

        // Stock validation
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await db.Products
            .Where(p => productIds.Contains(p.Id) && p.TenantId == tenantId)
            .Include(p => p.Variants)
            .ToListAsync(ct);

        foreach (var item in request.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product == null)
                return BadRequest(new { errors = new[] { "Product not found." } });
            if (product.Status == ProductStatus.OutOfStock)
                return BadRequest(new { errors = new[] { $"'{product.Title}' is out of stock." } });
            if (product.StockQuantity.HasValue && item.Quantity > product.StockQuantity.Value)
                return BadRequest(new { errors = new[] { $"Only {product.StockQuantity.Value} of '{product.Title}' available." } });
        }

        // Server is the price authority — recompute from the catalogue, not the client.
        decimal ResolveItemPrice(CodOrderItemRequest i)
        {
            var p = products.FirstOrDefault(x => x.Id == i.ProductId);
            return p == null ? i.UnitPrice : ResolveUnitPrice(p, i.VariantInfo);
        }
        var pricedItems = request.Items.Select(i => new { Item = i, Unit = ResolveItemPrice(i) }).ToList();
        var totalAmount = pricedItems.Sum(x => x.Unit * x.Item.Quantity);
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        // Customer upsert â€” normalize phone to digits-only for consistent lookup
        var codNormalizedPhone = NormalizePhone(request.CustomerPhone);
        Customer? customer = string.IsNullOrEmpty(codNormalizedPhone)
            ? null
            : await db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == codNormalizedPhone, ct);

        if (customer != null)
        {
            customer.TotalOrders += 1;
            customer.TotalSpend += totalAmount;
            customer.LastOrderDate = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(request.CustomerEmail))
                customer.Email = request.CustomerEmail.Trim();
        }
        else
        {
            customer = new Customer
            {
                TenantId = tenantId,
                Name = request.CustomerName.Trim(),
                PhoneNumber = codNormalizedPhone,
                Email = request.CustomerEmail?.Trim(),
                TotalOrders = 1,
                TotalSpend = totalAmount,
                LastOrderDate = DateTime.UtcNow,
                PreferredChannel = SocialPlatform.WhatsApp,
            };
            db.Customers.Add(customer);
        }

        var items = pricedItems.Select(x => new OrderItem
        {
            TenantId = tenantId,
            ProductId = x.Item.ProductId,
            ProductTitle = x.Item.ProductTitle,
            VariantInfo = x.Item.VariantInfo,
            Quantity = x.Item.Quantity,
            UnitPrice = x.Unit,
            TotalPrice = x.Unit * x.Item.Quantity
        }).ToList();

        var order = new Order
        {
            TenantId = tenantId,
            OrderNumber = orderNumber,
            CustomerId = customer.Id,
            SourceChannel = SocialPlatform.WhatsApp,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone?.Trim(),
            DeliveryAddress = request.DeliveryAddress?.Trim(),
            Notes = request.Notes?.Trim(),
            TotalAmount = totalAmount,
            Status = OrderStatus.New,
            PaymentStatus = PaymentStatus.Pending,
            Items = items
        };

        order.StatusHistory.Add(new OrderStatusHistory
        {
            TenantId = tenantId,
            OrderId = order.Id,
            FromStatus = OrderStatus.New,
            ToStatus = OrderStatus.New,
            Note = "COD order placed via storefront"
        });

        db.Orders.Add(order);

        // Decrement stock
        foreach (var item in request.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product?.StockQuantity != null)
            {
                product.StockQuantity = Math.Max(0, product.StockQuantity.Value - item.Quantity);
                if (product.StockQuantity <= 0 && product.Status == ProductStatus.Active)
                    product.Status = ProductStatus.OutOfStock;
            }
        }

        await db.SaveChangesAsync(ct);

        // â”€â”€ Notify store owner + send customer confirmation â€” fire & forget â”€â”€â”€â”€â”€â”€
        try
        {
            var (ownerEmail, ownerName, storeName) =
                await LoadOwnerInfoAsync(tenantId, CancellationToken.None);

            // Determine store currency
            var currency = await db.Businesses
                .Where(b => b.TenantId == tenantId)
                .Select(b => b.Currency)
                .FirstOrDefaultAsync(CancellationToken.None) ?? "INR";

            var notifItems = pricedItems
                .Select(x => new OrderNotificationItem(x.Item.ProductTitle, x.Item.VariantInfo, x.Item.Quantity, x.Unit))
                .ToList();

            // Owner email
            if (!string.IsNullOrWhiteSpace(ownerEmail))
            {
                await emailService.SendNewOrderNotificationAsync(
                    toEmail:         ownerEmail,
                    ownerName:       ownerName,
                    storeName:       storeName,
                    orderNumber:     order.OrderNumber,
                    customerName:    request.CustomerName.Trim(),
                    customerPhone:   codNormalizedPhone,
                    customerEmail:   request.CustomerEmail?.Trim(),
                    deliveryAddress: request.DeliveryAddress?.Trim(),
                    totalAmount:     totalAmount,
                    currency:        currency,
                    items:           notifItems,
                    source:          "Storefront",
                    isNewCustomer:   customer.TotalOrders == 1,
                    manageOrderUrl:  $"{DashboardUrl}/orders/{order.Id}",
                    ct:              CancellationToken.None);
            }

            // Customer confirmation email
            if (!string.IsNullOrWhiteSpace(request.CustomerEmail))
            {
                var sfBase      = await StorefrontBaseUrlAsync(slug, CancellationToken.None);
                var trackingUrl = $"{sfBase}/order-confirmation/{order.Id}";

                await emailService.SendOrderConfirmationAsync(
                    toEmail:         request.CustomerEmail.Trim(),
                    toName:          request.CustomerName.Trim(),
                    storeName:       storeName,
                    orderNumber:     order.OrderNumber,
                    deliveryAddress: request.DeliveryAddress?.Trim(),
                    totalAmount:     totalAmount,
                    currency:        currency,
                    items:           notifItems,
                    trackingUrl:     trackingUrl,
                    ct:              CancellationToken.None);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[NOTIFY] Failed to send order emails for order {OrderNumber}", order.OrderNumber);
        }

        return Ok(new { orderId = order.Id, orderNumber = order.OrderNumber, totalAmount });
    }

    // â”€â”€ Public order detail (order ID is access token) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    [HttpGet("orders/{orderId:guid}")]
    public async Task<IActionResult> GetPublicOrder(string slug, Guid orderId, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        var o = await db.Orders
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == orderId && x.TenantId == tenantContext.CurrentTenantId, ct);

        if (o == null) return NotFound();

        return Ok(new
        {
            o.Id,
            o.OrderNumber,
            o.CustomerName,
            o.CustomerPhone,
            o.DeliveryAddress,
            o.Notes,
            o.TotalAmount,
            Status = o.Status.ToString(),
            PaymentStatus = o.PaymentStatus.ToString(),
            o.CreatedAt,
            Items = o.Items.Select(i => new
            {
                i.ProductId,
                i.ProductTitle,
                i.VariantInfo,
                i.Quantity,
                i.UnitPrice,
                i.TotalPrice
            })
        });
    }

    // â”€â”€ Public invoice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    [HttpGet("orders/{orderId:guid}/invoice")]
    public async Task<IActionResult> GetPublicInvoice(string slug, Guid orderId, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        var o = await db.Orders
            .Include(x => x.Items)
            .Include(x => x.Payments)
            .Include(x => x.StatusHistory.OrderByDescending(h => h.CreatedAt))
            .FirstOrDefaultAsync(x => x.Id == orderId && x.TenantId == tenantContext.CurrentTenantId, ct);

        if (o == null) return NotFound();

        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        var tenant = await db.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantContext.CurrentTenantId, ct);

        var dto = new Application.Orders.Queries.OrderDetailDto(
            o.Id, o.OrderNumber, o.CustomerName, o.CustomerPhone,
            o.TotalAmount, o.Status.ToString(), o.PaymentStatus.ToString(),
            o.SourceChannel.ToString(), o.Notes, o.DeliveryAddress, o.CreatedAt,
            o.Items.Select(i => new Application.Orders.Queries.OrderItemDto(i.Id, i.ProductId, i.ProductTitle, i.VariantInfo, i.Quantity, i.UnitPrice, i.TotalPrice)).ToList(),
            o.Payments.OrderByDescending(p => p.PaidAt).Select(p => new Application.Orders.Queries.OrderPaymentDto(p.Id, p.Amount, p.Method, p.ReferenceNumber, p.PaidAt)).ToList(),
            o.StatusHistory.Select(h => new Application.Orders.Queries.OrderHistoryDto(h.Id, h.FromStatus.ToString(), h.ToStatus.ToString(), h.Note, h.CreatedAt)).ToList()
        );

        var storeInfo = new InvoiceHelper.StoreInfo(
            Name:         business?.Name ?? tenant?.Name ?? slug,
            LogoUrl:      business?.LogoUrl,
            WhatsApp:     business?.WhatsAppNumber,
            ContactEmail: tenant?.ContactEmail,
            Currency:     business?.Currency ?? "INR"
        );

        return Content(InvoiceHelper.BuildHtml(dto, storeInfo), "text/html");
    }

    // ── sitemap.xml ───────────────────────────────────────────────────────────

    [HttpGet("sitemap.xml")]
    public async Task<IActionResult> Sitemap(string slug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        var baseUrl = await StorefrontBaseUrlAsync(slug, ct);

        var products = await db.Products
            .Where(p => p.Status == Domain.Enums.ProductStatus.Active
                     || p.Status == Domain.Enums.ProductStatus.OutOfStock)
            .Select(p => new
            {
                p.Id, p.Slug, p.Title, p.UpdatedAt,
                // Up to 5 images per product for image sitemap
                Images = p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).Take(5).ToList()
            })
            .ToListAsync(ct);

        var categories = await db.Categories
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.SortOrder)
            .Select(c => new { c.Name })
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"");
        sb.AppendLine("        xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">");

        // ── Homepage ─────────────────────────────────────────────────────────
        sb.AppendLine("  <url>");
        sb.AppendLine($"    <loc>{baseUrl}/</loc>");
        sb.AppendLine("    <changefreq>daily</changefreq>");
        sb.AppendLine("    <priority>1.0</priority>");
        sb.AppendLine("  </url>");

        // ── Category pages ────────────────────────────────────────────────────
        foreach (var cat in categories)
        {
            var catSlug = string.Join("-",
                cat.Name.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>{baseUrl}/category/{catSlug}</loc>");
            sb.AppendLine("    <changefreq>weekly</changefreq>");
            sb.AppendLine("    <priority>0.7</priority>");
            sb.AppendLine("  </url>");
        }

        // ── Products (with image sitemap) ────────────────────────────────────
        foreach (var p in products)
        {
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>{baseUrl}/products/{p.Slug ?? p.Id.ToString()}</loc>");
            if (p.UpdatedAt != default)
                sb.AppendLine($"    <lastmod>{p.UpdatedAt:yyyy-MM-dd}</lastmod>");
            sb.AppendLine("    <changefreq>weekly</changefreq>");
            sb.AppendLine("    <priority>0.8</priority>");
            foreach (var imgUrl in p.Images.Where(u => !string.IsNullOrWhiteSpace(u)))
            {
                sb.AppendLine("    <image:image>");
                sb.AppendLine($"      <image:loc>{imgUrl}</image:loc>");
                sb.AppendLine($"      <image:title>{XmlEscape(p.Title)}</image:title>");
                sb.AppendLine("    </image:image>");
            }
            sb.AppendLine("  </url>");
        }

        sb.AppendLine("</urlset>");

        Response.Headers["Cache-Control"] = "public, max-age=3600";
        return Content(sb.ToString(), "application/xml", Encoding.UTF8);
    }

    // ── feed.xml — Google Shopping / Merchant Center product feed ────────────

    [HttpGet("feed.xml")]
    public async Task<IActionResult> GoogleShoppingFeed(string slug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        var baseUrl  = await StorefrontBaseUrlAsync(slug, ct);
        var business = await db.Businesses
            .Include(b => b.StorefrontSettings)
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);
        if (business is null) return NotFound();

        var currency    = business.Currency ?? "INR";
        var brandName   = business.Name;
        var storeDesc   = business.StorefrontSettings?.SeoDescription
                       ?? business.Description
                       ?? $"Shop at {brandName}";

        var products = await db.Products
            .Where(p => p.Status == Domain.Enums.ProductStatus.Active
                     || p.Status == Domain.Enums.ProductStatus.OutOfStock)
            .Select(p => new
            {
                p.Id,
                p.Slug,
                p.Title,
                p.Description,
                p.BasePrice,
                p.DiscountedPrice,
                p.Status,
                p.StockQuantity,
                CategoryName = p.Category != null ? p.Category.Name : null,
                PrimaryImage = p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault(),
            })
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<rss version=\"2.0\" xmlns:g=\"http://base.google.com/ns/1.0\">");
        sb.AppendLine("  <channel>");
        sb.AppendLine($"    <title>{XmlEscape(brandName)}</title>");
        sb.AppendLine($"    <link>{baseUrl}/</link>");
        sb.AppendLine($"    <description>{XmlEscape(storeDesc)}</description>");

        foreach (var p in products)
        {
            var productUrl   = $"{baseUrl}/products/{p.Slug ?? p.Id.ToString()}";
            var availability = p.Status == Domain.Enums.ProductStatus.OutOfStock
                               || (p.StockQuantity.HasValue && p.StockQuantity <= 0)
                               ? "out of stock"
                               : "in stock";
            var price        = (p.DiscountedPrice.HasValue && p.DiscountedPrice < p.BasePrice
                                ? p.DiscountedPrice.Value
                                : p.BasePrice);
            var desc         = string.IsNullOrWhiteSpace(p.Description)
                               ? p.Title
                               : p.Description;
            // Strip HTML tags from description if any
            var cleanDesc    = System.Text.RegularExpressions.Regex.Replace(desc, "<[^>]+>", " ").Trim();
            if (cleanDesc.Length > 5000) cleanDesc = cleanDesc[..5000];

            sb.AppendLine("    <item>");
            sb.AppendLine($"      <g:id>{XmlEscape(p.Id.ToString())}</g:id>");
            sb.AppendLine($"      <g:title>{XmlEscape(p.Title)}</g:title>");
            sb.AppendLine($"      <g:description>{XmlEscape(cleanDesc)}</g:description>");
            sb.AppendLine($"      <g:link>{XmlEscape(productUrl)}</g:link>");
            if (!string.IsNullOrWhiteSpace(p.PrimaryImage))
                sb.AppendLine($"      <g:image_link>{XmlEscape(p.PrimaryImage)}</g:image_link>");
            sb.AppendLine($"      <g:condition>new</g:condition>");
            sb.AppendLine($"      <g:availability>{availability}</g:availability>");
            sb.AppendLine($"      <g:price>{price:F2} {currency}</g:price>");
            if (p.DiscountedPrice.HasValue && p.DiscountedPrice < p.BasePrice)
                sb.AppendLine($"      <g:sale_price>{p.DiscountedPrice.Value:F2} {currency}</g:sale_price>");
            sb.AppendLine($"      <g:brand>{XmlEscape(brandName)}</g:brand>");
            if (!string.IsNullOrWhiteSpace(p.CategoryName))
                sb.AppendLine($"      <g:product_type>{XmlEscape(p.CategoryName)}</g:product_type>");
            sb.AppendLine("    </item>");
        }

        sb.AppendLine("  </channel>");
        sb.AppendLine("</rss>");

        Response.Headers["Cache-Control"] = "public, max-age=3600";
        return Content(sb.ToString(), "application/xml", Encoding.UTF8);
    }

    // ── robots.txt ────────────────────────────────────────────────────────────

    [HttpGet("robots.txt")]
    public async Task<IActionResult> RobotsTxt(string slug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        // Sitemap URL always points to this backend — the backend is always reachable
        // regardless of whether the tenant uses a custom domain. The custom-domain
        // Worker will also expose /sitemap.xml at the merchant's own domain once the
        // storefront-proxy Worker script is updated to route that path to the backend.
        var sitemapUrl = $"{Request.Scheme}://{Request.Host}/api/v1/public/{slug}/sitemap.xml";

        var content = $"""
            User-agent: *
            Allow: /

            Sitemap: {sitemapUrl}
            """;

        Response.Headers["Cache-Control"] = "public, max-age=86400";
        return Content(content, "text/plain");
    }

    // ── favicon.svg — generated icon with store initials + brand colour ───────
    // Used as the fallback favicon when the merchant has not uploaded one.
    // Google Search indexes real HTTP URLs; data: URIs are ignored by crawlers.

    [HttpGet("favicon.svg")]
    public async Task<IActionResult> FaviconSvg(string slug, CancellationToken ct)
    {
        if (!tenantContext.IsResolved) return NotFound();

        var settings = await db.StorefrontSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Slug == slug, ct);

        var business = await db.Businesses
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        // If a real favicon is uploaded, redirect to it so Google fetches the actual image
        if (!string.IsNullOrEmpty(settings?.FaviconUrl))
        {
            Response.Headers["Cache-Control"] = "public, max-age=3600";
            return Redirect(settings.FaviconUrl);
        }
        if (!string.IsNullOrEmpty(business?.LogoUrl))
        {
            Response.Headers["Cache-Control"] = "public, max-age=3600";
            return Redirect(business.LogoUrl);
        }

        // Generate an SVG monogram (2 initials on theme-coloured background)
        var name       = business?.Name ?? slug;
        var initials   = string.Concat(
                             name.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                 .Take(2)
                                 .Select(w => char.ToUpper(w[0])));
        if (string.IsNullOrEmpty(initials)) initials = slug.Length >= 2
            ? slug[..2].ToUpper() : slug.ToUpper();

        var color = settings?.ThemeColor ?? "#0F766E";

        var svg = $"""
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
              <rect width="64" height="64" rx="14" fill="{color}"/>
              <text x="32" y="44" font-size="26" font-family="Arial,sans-serif" font-weight="bold"
                    fill="white" text-anchor="middle">{System.Net.WebUtility.HtmlEncode(initials)}</text>
            </svg>
            """;

        Response.Headers["Cache-Control"] = "public, max-age=86400";
        return Content(svg.Trim(), "image/svg+xml");
    }

    // ── Custom pages ──────────────────────────────────────────────────────────

    /// <summary>Returns all published pages for nav/footer links.</summary>
    [HttpGet("pages")]
    public async Task<IActionResult> GetPages(string slug, CancellationToken ct)
    {
        var tenant = await ResolveTenant(slug, ct);
        if (tenant == null) return NotFound();

        var pages = await db.StorefrontPages
            .Where(p => p.TenantId == tenant.Id && p.IsPublished)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Title)
            .Select(p => new { p.Id, p.Title, p.Slug, p.ShowInNav, p.ShowInFooter })
            .ToListAsync(ct);

        return Ok(pages);
    }

    /// <summary>Returns a single page by its slug.</summary>
    [HttpGet("pages/{pageSlug}")]
    public async Task<IActionResult> GetPage(string slug, string pageSlug, CancellationToken ct)
    {
        var tenant = await ResolveTenant(slug, ct);
        if (tenant == null) return NotFound();

        var page = await db.StorefrontPages
            .Where(p => p.TenantId == tenant.Id && p.Slug == pageSlug && p.IsPublished)
            .Select(p => new { p.Id, p.Title, p.Slug, p.Content, p.UpdatedAt })
            .FirstOrDefaultAsync(ct);

        if (page == null) return NotFound();
        return Ok(page);
    }

    private async Task<Domain.Tenancy.Tenant?> ResolveTenant(string slug, CancellationToken ct) =>
        await db.Tenants.FirstOrDefaultAsync(t => t.Slug == slug, ct);
}

// ── Category DTOs for public storefront ──────────────────────────────────────
internal record PublicCategoryFlat(Guid Id, string Name, string? Description, string? ImageUrl, bool IsFeatured, Guid? ParentCategoryId);
public record PublicSubCategoryDto(Guid Id, string Name, string? Description, string? ImageUrl);
public record PublicCategoryDto(Guid Id, string Name, string? Description, string? ImageUrl, bool IsFeatured, List<PublicSubCategoryDto> SubCategories);

public record StorefrontChatRequest(string? SessionId, string Message);

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
public record SubmitReviewRequest(string ReviewerName, string? ReviewerEmail, string? ReviewerPhone, int Rating, string? Comment);
public record CodOrderRequest(
    string CustomerName,
    string? CustomerPhone,
    string? CustomerEmail,   // required for OTP verification
    string? EmailOtp,        // 6-digit code the customer entered
    string? DeliveryAddress,
    string? Notes,
    IEnumerable<CodOrderItemRequest> Items
);
public record CodOrderItemRequest(Guid ProductId, string ProductTitle, string? VariantInfo, int Quantity, decimal UnitPrice);
public record SendCodOtpRequest(string Email, string? CustomerName);
public record ConfirmChatCodRequest(
    string CustomerName,
    string CustomerPhone,
    string CustomerEmail,
    string EmailOtp,
    string? DeliveryAddress,
    IEnumerable<ChatCartItem> Cart
);
public record ChatCartItem(string ProductId, string Title, string? VariantInfo, int Qty, decimal UnitPrice);

/// <summary>Cart item as extracted by the AI in the order_ready state JSON.</summary>
public record AiCartItem(
    [property: System.Text.Json.Serialization.JsonPropertyName("product_id")] string ProductId,
    [property: System.Text.Json.Serialization.JsonPropertyName("title")]      string Title,
    [property: System.Text.Json.Serialization.JsonPropertyName("variant_info")] string? VariantInfo,
    [property: System.Text.Json.Serialization.JsonPropertyName("qty")]        int Qty,
    [property: System.Text.Json.Serialization.JsonPropertyName("unit_price")] decimal UnitPrice
);




