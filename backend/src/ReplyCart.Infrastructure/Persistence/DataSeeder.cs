using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ReplyCart.Domain.Business;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Customers;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Identity;
using ReplyCart.Domain.Leads;
using ReplyCart.Domain.Orders;
using ReplyCart.Domain.Tenancy;

namespace ReplyCart.Infrastructure.Persistence;

// ─────────────────────────────────────────────────────────────────────────────
//  DataSeeder — creates admin + 3 demo stores (idempotent, keyed by fixed GUIDs)
//
//  Credentials
//  ──────────────────────────────────────────────────────────────────────────
//  Admin (SuperAdmin)       admin@silarai.app      Admin@2024
//  Store 1 – Boutique       owner@priyaboutique.in   Demo@1234
//  Store 2 – Bakery         hello@sugarcrumbs.in     Demo@1234
//  Store 3 – Jewelry        hello@aradhyajewels.in   Demo@1234
// ─────────────────────────────────────────────────────────────────────────────

public static class DataSeeder
{
    // ── Fixed GUIDs — NEVER change these (idempotent seeding) ─────────────────
    static readonly Guid AdminTenantId      = new("00000000-0000-0000-0000-000000000001");
    static readonly Guid SuperAdminRoleId   = new("00000000-0000-0000-0000-000000000010");
    static readonly Guid AdminUserId        = new("00000000-0000-0000-0000-000000000100");

    // Store 1 — Priya's Boutique
    static readonly Guid S1TenantId   = new("11111111-1111-1111-1111-111111111111");
    static readonly Guid S1UserId     = new("11111111-1111-1111-1111-111111111112");
    static readonly Guid S1BizId      = new("11111111-1111-1111-1111-111111111113");

    // Store 2 — Sugar & Crumbs Cake Studio
    static readonly Guid S2TenantId   = new("22222222-2222-2222-2222-222222222221");
    static readonly Guid S2UserId     = new("22222222-2222-2222-2222-222222222222");
    static readonly Guid S2BizId      = new("22222222-2222-2222-2222-222222222223");

    // Store 3 — Aradhya Jewels
    static readonly Guid S3TenantId   = new("33333333-3333-3333-3333-333333333331");
    static readonly Guid S3UserId     = new("33333333-3333-3333-3333-333333333332");
    static readonly Guid S3BizId      = new("33333333-3333-3333-3333-333333333333");

    // ── Helpers ────────────────────────────────────────────────────────────────
    static Product Prod(Guid tenantId, Guid? catId, string title, string desc, string sku,
        decimal basePrice, decimal? discPrice, bool featured, int stock, int sort) => new()
    {
        Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catId,
        Title = title, Description = desc, Sku = sku,
        BasePrice = basePrice, DiscountedPrice = discPrice,
        Status = ProductStatus.Active, IsFeatured = featured,
        StockQuantity = stock, SortOrder = sort, CreatedAt = DateTime.UtcNow,
    };

    static ProductImage Img(Guid tenantId, Guid productId, string url, bool primary = true) => new()
    {
        Id = Guid.NewGuid(), TenantId = tenantId, ProductId = productId,
        Url = url, IsPrimary = primary, SortOrder = primary ? 0 : 1,
        CreatedAt = DateTime.UtcNow,
    };

    static Customer Cust(Guid tenantId, string name, string phone, string? email,
        int orders, decimal spend, int daysAgo, SocialPlatform ch, string? city) => new()
    {
        Id = Guid.NewGuid(), TenantId = tenantId,
        Name = name, PhoneNumber = phone, Email = email,
        TotalOrders = orders, TotalSpend = spend,
        LastOrderDate = orders > 0 ? DateTime.UtcNow.AddDays(-daysAgo) : null,
        PreferredChannel = ch, City = city,
        CreatedAt = DateTime.UtcNow.AddDays(-(daysAgo + 30)),
    };

    static Lead NewLead(Guid tenantId, string custName, string phone,
        SocialPlatform ch, LeadStatus status, string note, int priority,
        Guid? productId, int hoursAgo, int? followUpDays = null) => new()
    {
        Id = Guid.NewGuid(), TenantId = tenantId,
        CustomerName = custName, CustomerPhone = phone,
        SourceChannel = ch, Status = status,
        InquiryNote = note, Priority = priority,
        InterestedProductId = productId,
        FollowUpDate = followUpDays.HasValue ? DateTime.UtcNow.AddDays(followUpDays.Value) : null,
        LastActivityDate = DateTime.UtcNow.AddHours(-hoursAgo),
        CreatedAt = DateTime.UtcNow.AddHours(-hoursAgo),
    };

    // ── Main entry point ───────────────────────────────────────────────────────
    public static async Task SeedAsync(IServiceProvider services, ILogger logger)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await SeedSubscriptionPlansAsync(db, logger);
        await SeedAdminAsync(db, logger);
        await SeedStore1_BoutiqueAsync(db, logger);
        await SeedStore2_BakeryAsync(db, logger);
        await SeedStore3_JewelryAsync(db, logger);

        logger.LogInformation("=== DataSeeder complete ===");
        logger.LogInformation("  Admin:    admin@silarai.app      / Admin@2024");
        logger.LogInformation("  Store 1:  owner@priyaboutique.in   / Demo@1234  → /priya-boutique");
        logger.LogInformation("  Store 2:  hello@sugarcrumbs.in     / Demo@1234  → /sugar-crumbs");
        logger.LogInformation("  Store 3:  hello@aradhyajewels.in   / Demo@1234  → /aradhya-jewels");
    }

    // ── Subscription plans ─────────────────────────────────────────────────────
    static async Task SeedSubscriptionPlansAsync(AppDbContext db, ILogger logger)
    {
        if (await db.SubscriptionPlans.AnyAsync()) return;

        logger.LogInformation("Seeding subscription plans...");
        db.SubscriptionPlans.AddRange(
            new SubscriptionPlan
            {
                Id = Guid.NewGuid(), Name = "Basic", Slug = "basic", SortOrder = 1,
                Description = "Perfect for small boutiques just getting started.",
                MonthlyPrice = 200, AnnualPrice = 1800,
                MaxProducts = 50, MaxStaffUsers = 1, MaxMonthlyLeads = 100,
                MaxAiSuggestionsPerMonth = 0,
                AllowsCustomBranding = false, AllowsAdvancedAnalytics = false, AllowsAiSuggestions = false,
                IsActive = true, CreatedAt = DateTime.UtcNow,
            },
            new SubscriptionPlan
            {
                Id = Guid.NewGuid(), Name = "Pro", Slug = "pro", SortOrder = 2,
                Description = "For growing stores ready to scale with AI and integrations.",
                MonthlyPrice = 999, AnnualPrice = 8999,
                MaxProducts = 500, MaxStaffUsers = 3, MaxMonthlyLeads = 1000,
                MaxAiSuggestionsPerMonth = 200,
                AllowsCustomBranding = true, AllowsAdvancedAnalytics = true, AllowsAiSuggestions = true,
                IsActive = true, CreatedAt = DateTime.UtcNow,
            },
            new SubscriptionPlan
            {
                Id = Guid.NewGuid(), Name = "Professional", Slug = "professional", SortOrder = 3,
                Description = "Unlimited power for established businesses with full automation.",
                MonthlyPrice = 2499, AnnualPrice = 21999,
                MaxProducts = int.MaxValue, MaxStaffUsers = int.MaxValue, MaxMonthlyLeads = int.MaxValue,
                MaxAiSuggestionsPerMonth = int.MaxValue,
                AllowsCustomBranding = true, AllowsAdvancedAnalytics = true, AllowsAiSuggestions = true,
                IsActive = true, CreatedAt = DateTime.UtcNow,
            }
        );
        await db.SaveChangesAsync();
    }

    // ── Admin ──────────────────────────────────────────────────────────────────
    static async Task SeedAdminAsync(AppDbContext db, ILogger logger)
    {
        var exists = await db.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Id == AdminTenantId);
        if (exists) return;

        logger.LogInformation("Seeding admin tenant...");
        db.Tenants.Add(new Tenant
        {
            Id = AdminTenantId, Name = "Silarai System", Slug = "admin-system",
            ContactEmail = "system@silarai.app", IsActive = true, IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow,
        });
        db.Roles.Add(new Role
        {
            Id = SuperAdminRoleId, Name = "SuperAdmin",
            Description = "Full platform access", CreatedAt = DateTime.UtcNow,
        });
        db.Users.Add(new User
        {
            Id = AdminUserId, TenantId = AdminTenantId,
            Name = "Silarai Admin", Email = "admin@silarai.app",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@2024"),
            IsActive = true, IsEmailVerified = true, CreatedAt = DateTime.UtcNow,
        });
        db.UserRoles.Add(new UserRole
        {
            Id = Guid.NewGuid(), UserId = AdminUserId, RoleId = SuperAdminRoleId,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  STORE 1 — Priya's Boutique (Women's Ethnic Fashion)
    //  URL:   /priya-boutique
    //  Login: owner@priyaboutique.in / Demo@1234
    //  Theme: #DB2777 (boutique pink)
    // ══════════════════════════════════════════════════════════════════════════
    static async Task SeedStore1_BoutiqueAsync(AppDbContext db, ILogger logger)
    {
        if (await db.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Id == S1TenantId)) return;
        logger.LogInformation("Seeding Store 1 — Priya's Boutique...");

        var planId = await db.SubscriptionPlans.Where(p => p.Slug == "pro").Select(p => p.Id).FirstAsync();
        var now = DateTime.UtcNow;

        // ── Tenant + user + subscription ──────────────────────────────────────
        db.Tenants.Add(new Tenant
        {
            Id = S1TenantId, Name = "Priya's Boutique", Slug = "priya-boutique",
            ContactEmail = "owner@priyaboutique.in", ContactPhone = "+910000000001",
            IsActive = true, IsEmailVerified = true, CreatedAt = now,
        });
        db.TenantSubscriptions.Add(new TenantSubscription
        {
            Id = Guid.NewGuid(), TenantId = S1TenantId, PlanId = planId,
            Status = SubscriptionStatus.Trial, StartDate = now,
            EndDate = now.AddDays(30), IsAnnual = false, PricePaid = 0, CreatedAt = now,
        });
        db.Users.Add(new User
        {
            Id = S1UserId, TenantId = S1TenantId, Name = "Priya Sharma",
            Email = "owner@priyaboutique.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@1234"),
            Phone = "+910000000001", IsActive = true, IsEmailVerified = true, CreatedAt = now,
        });

        // ── Business + Storefront ─────────────────────────────────────────────
        db.Businesses.Add(new Business
        {
            Id = S1BizId, TenantId = S1TenantId,
            Name = "Priya's Boutique",
            Category = "Fashion & Clothing",
            Description = "Handcrafted ethnic & fusion wear for the modern Indian woman. Curated from artisans across Jaipur, Surat & Varanasi.",
            LogoUrl = "https://ui-avatars.com/api/?name=Priya+Boutique&background=DB2777&color=fff&size=128&bold=true",
            BannerUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop",
            WhatsAppNumber = "910000000001",
            InstagramHandle = "@priyasboutique",
            FacebookPageUrl = "https://facebook.com/priyasboutique",
            Currency = "INR",
            WelcomeText = "Namaste! 🙏 Welcome to Priya's Boutique — where every outfit tells a story.",
            DeliveryInfo = "Free shipping on orders above ₹999. Delivered in 3-5 business days across India.",
            IsOnboardingComplete = true, CreatedAt = now,
        });
        db.StorefrontSettings.Add(new StorefrontSettings
        {
            Id = Guid.NewGuid(), TenantId = S1TenantId, BusinessId = S1BizId,
            Slug = "priya-boutique", ThemeColor = "#DB2777",
            SeoTitle = "Priya's Boutique — Ethnic & Fusion Wear for Women",
            SeoDescription = "Shop sarees, kurtis, lehengas and accessories. Handcrafted from Jaipur with love. Free shipping above ₹999.",
            WhatsAppCtaLabel = "Order on WhatsApp 💬",
            InstagramCtaLabel = "Follow for New Arrivals",
            FacebookCtaLabel = "Like our Page",
            ShowOutOfStockProducts = false,
            AllowPublicInquiries = true,
            AnnouncementText = "🌸 New Festive Collection is LIVE! Get 10% off your first order — DM us on WhatsApp!",
            CreatedAt = now,
        });

        // ── Categories ────────────────────────────────────────────────────────
        var c1 = new Category { Id = Guid.NewGuid(), TenantId = S1TenantId, Name = "Sarees", Description = "Silk, chiffon, Banarasi & more", SortOrder = 1, IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=400&h=400&fit=crop", CreatedAt = now };
        var c2 = new Category { Id = Guid.NewGuid(), TenantId = S1TenantId, Name = "Kurtis & Sets", Description = "Anarkali, straight & co-ord sets", SortOrder = 2, IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop", CreatedAt = now };
        var c3 = new Category { Id = Guid.NewGuid(), TenantId = S1TenantId, Name = "Lehengas", Description = "Bridal & party lehengas", SortOrder = 3, IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=400&h=400&fit=crop", CreatedAt = now };
        var c4 = new Category { Id = Guid.NewGuid(), TenantId = S1TenantId, Name = "Dupattas & Stoles", Description = "Bandhani, embroidered & printed", SortOrder = 4, IsActive = true, CreatedAt = now };
        var c5 = new Category { Id = Guid.NewGuid(), TenantId = S1TenantId, Name = "Accessories", Description = "Jewellery, bags & more", SortOrder = 5, IsActive = true, CreatedAt = now };
        db.Categories.AddRange(c1, c2, c3, c4, c5);

        // ── Products ──────────────────────────────────────────────────────────
        var p1  = Prod(S1TenantId, c1.Id, "Banarasi Silk Saree — Royal Blue",    "Handwoven pure Banarasi silk with zari weave. Perfect for weddings and festive occasions. Comes with unstitched blouse piece.",      "SAR-BAN-001", 4500,  3999, true,  8, 1);
        var p2  = Prod(S1TenantId, c1.Id, "Kanjivaram Silk Saree — Maroon Gold", "Authentic Kanjivaram with temple border and heavy zari pallu. A true heirloom piece.",                                               "SAR-KAN-002", 8500,  7499, true,  5, 2);
        var p3  = Prod(S1TenantId, c1.Id, "Chiffon Printed Saree — Floral Pink", "Lightweight chiffon with all-over floral print. Easy to drape, perfect for day events. Includes matching blouse piece.",             "SAR-CHF-003", 1200,   999, false, 25, 3);
        var p4  = Prod(S1TenantId, c2.Id, "Anarkali Kurti — Teal Green",         "Floor-length anarkali in pure cotton with hand block print. Breathable & comfortable. Available S–XXL.",                             "KUR-ANK-001", 1500,  1299, true,  30, 4);
        var p5  = Prod(S1TenantId, c2.Id, "Straight Kurti Set — Lavender 3Pc",   "3-piece set: straight kurti + palazzo + dupatta in premium rayon. Office-ready elegance.",                                          "KUR-SET-002", 1800,  1599, true,  18, 5);
        var p6  = Prod(S1TenantId, c2.Id, "Floral Peplum Kurta — Peach",         "Short peplum kurta with printed sharara. Trendy fusion silhouette for brunches and events.",                                         "KUR-PEP-003", 1350,  1199, false, 22, 6);
        var p7  = Prod(S1TenantId, c3.Id, "Bridal Lehenga — Crimson Red",        "Heavy embroidered bridal lehenga with dupatta. Hand-embellished zari & mirror work. Made-to-order available in 15-20 days.",         "LEH-BRI-001",18000, 15999, true,  4, 7);
        var p8  = Prod(S1TenantId, c3.Id, "Party Lehenga — Mint Green Sequin",   "Semi-stitched lehenga choli with sequin & thread embroidery. Net fabric, glamorous finish.",                                        "LEH-PAR-002", 3500,  2999, true,  10, 8);
        var p9  = Prod(S1TenantId, c4.Id, "Bandhani Dupatta — Saffron Yellow",   "Hand-tied bandhani dupatta from Rajasthan. Pure cotton, vibrant saffron with contrasting dots.",                                   "DUP-BAN-001",  450,   399, false, 35, 9);
        var p10 = Prod(S1TenantId, c5.Id, "Kundan Necklace Set — Gold Plated",   "Traditional kundan choker necklace with matching earrings and maang tikka. Gold-plated brass base.",                               "ACC-KUN-001", 2200,  1899, true,  20, 10);
        db.Products.AddRange(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10);

        // ── Product Images ────────────────────────────────────────────────────
        db.ProductImages.AddRange(
            Img(S1TenantId, p1.Id,  "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=750&fit=crop"),
            Img(S1TenantId, p2.Id,  "https://images.unsplash.com/photo-1519748771451-a94c596fad67?w=600&h=750&fit=crop"),
            Img(S1TenantId, p3.Id,  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=750&fit=crop"),
            Img(S1TenantId, p4.Id,  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=750&fit=crop"),
            Img(S1TenantId, p5.Id,  "https://picsum.photos/seed/lavender-kurti/600/750"),
            Img(S1TenantId, p6.Id,  "https://picsum.photos/seed/peach-peplum/600/750"),
            Img(S1TenantId, p7.Id,  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=750&fit=crop"),
            Img(S1TenantId, p8.Id,  "https://picsum.photos/seed/mint-lehenga/600/750"),
            Img(S1TenantId, p9.Id,  "https://picsum.photos/seed/bandhani-dupatta/600/750"),
            Img(S1TenantId, p10.Id, "https://images.unsplash.com/photo-1573408301185-9519f94815d1?w=600&h=750&fit=crop")
        );

        // ── Customers ─────────────────────────────────────────────────────────
        var cu1 = Cust(S1TenantId, "Ananya Gupta",   "910000001001", "ananya@gmail.com",        3,  8700m, 10, SocialPlatform.WhatsApp,  "Delhi");
        var cu2 = Cust(S1TenantId, "Meera Patel",    "910000001002", "meera.patel@gmail.com",   5, 14200m,  3, SocialPlatform.Instagram, "Ahmedabad");
        var cu3 = Cust(S1TenantId, "Sunita Rao",     "910000001003", null,                      1,  3999m, 25, SocialPlatform.WhatsApp,  "Hyderabad");
        var cu4 = Cust(S1TenantId, "Kavita Singh",   "910000001004", "kavita@yahoo.com",        2,  5600m, 15, SocialPlatform.Facebook,  "Mumbai");
        var cu5 = Cust(S1TenantId, "Deepika Nair",   "910000001005", "deepika.nair@outlook.com",4, 11500m,  7, SocialPlatform.WhatsApp,  "Kochi");
        db.Customers.AddRange(cu1, cu2, cu3, cu4, cu5);

        // ── Leads ─────────────────────────────────────────────────────────────
        db.Leads.AddRange(
            NewLead(S1TenantId, "Riya Shah",       "910000001011", SocialPlatform.WhatsApp,  LeadStatus.NewInquiry,     "Hi! Saw your Banarasi saree. What sizes available? Can you do custom blouse stitching?",                         2, p1.Id,  2),
            NewLead(S1TenantId, "Pooja Mehta",     "910000001012", SocialPlatform.Instagram, LeadStatus.Interested,     "Interested in the bridal lehenga. Budget ~15k. Can you share more options and delivery timeline?",               3, p7.Id,  5,  1),
            NewLead(S1TenantId, "Nisha Verma",     "910000001013", SocialPlatform.WhatsApp,  LeadStatus.FollowUpPending,"Want to order 3 kurtis for a family function. Can I get bulk discount?",                                        2, p4.Id, 24),
            NewLead(S1TenantId, "Lakshmi Iyer",    "910000001014", SocialPlatform.WhatsApp,  LeadStatus.NewInquiry,     "Do you have Kanjivaram sarees below ₹5000?",                                                                    1, p2.Id,  0),
            NewLead(S1TenantId, "Anjali Sharma",   "910000001015", SocialPlatform.Facebook,  LeadStatus.Lost,           "Was looking for bridesmaid outfits but found something cheaper elsewhere. Will check again next season!",        1, null,  240)
        );

        // ── Orders ────────────────────────────────────────────────────────────
        var ord1Id = Guid.NewGuid();
        db.Orders.Add(new Order
        {
            Id = ord1Id, TenantId = S1TenantId, OrderNumber = "PB-2026-0001",
            CustomerId = cu1.Id, CustomerName = cu1.Name, CustomerPhone = cu1.PhoneNumber,
            Status = OrderStatus.Delivered, PaymentStatus = PaymentStatus.Paid,
            SourceChannel = SocialPlatform.WhatsApp, TotalAmount = 3999m,
            Notes = "Customer requested gift wrapping.", CreatedAt = now.AddDays(-10),
        });
        db.OrderItems.Add(new OrderItem { Id = Guid.NewGuid(), TenantId = S1TenantId, OrderId = ord1Id, ProductId = p3.Id, ProductTitle = p3.Title, Quantity = 1, UnitPrice = 3999m, TotalPrice = 3999m, CreatedAt = now.AddDays(-10) });
        db.Payments.Add(new Payment { Id = Guid.NewGuid(), TenantId = S1TenantId, OrderId = ord1Id, Amount = 3999m, Method = "UPI", ReferenceNumber = "UPI2026PB001", PaidAt = now.AddDays(-10).AddHours(2), CreatedAt = now.AddDays(-10) });
        db.OrderStatusHistories.AddRange(
            new OrderStatusHistory { Id = Guid.NewGuid(), TenantId = S1TenantId, OrderId = ord1Id, FromStatus = OrderStatus.New, ToStatus = OrderStatus.Confirmed,  ChangedBy = S1UserId, CreatedAt = now.AddDays(-10).AddHours(1) },
            new OrderStatusHistory { Id = Guid.NewGuid(), TenantId = S1TenantId, OrderId = ord1Id, FromStatus = OrderStatus.Confirmed, ToStatus = OrderStatus.Packed,     ChangedBy = S1UserId, CreatedAt = now.AddDays(-9) },
            new OrderStatusHistory { Id = Guid.NewGuid(), TenantId = S1TenantId, OrderId = ord1Id, FromStatus = OrderStatus.Packed,    ToStatus = OrderStatus.Delivered,   ChangedBy = S1UserId, CreatedAt = now.AddDays(-7) }
        );

        var ord2Id = Guid.NewGuid();
        db.Orders.Add(new Order
        {
            Id = ord2Id, TenantId = S1TenantId, OrderNumber = "PB-2026-0002",
            CustomerId = cu2.Id, CustomerName = cu2.Name, CustomerPhone = cu2.PhoneNumber,
            Status = OrderStatus.Paid, PaymentStatus = PaymentStatus.Paid,
            SourceChannel = SocialPlatform.Instagram, TotalAmount = 2898m,
            CreatedAt = now.AddDays(-3),
        });
        db.OrderItems.AddRange(
            new OrderItem { Id = Guid.NewGuid(), TenantId = S1TenantId, OrderId = ord2Id, ProductId = p4.Id, ProductTitle = p4.Title, Quantity = 1, UnitPrice = 1299m, TotalPrice = 1299m, CreatedAt = now.AddDays(-3) },
            new OrderItem { Id = Guid.NewGuid(), TenantId = S1TenantId, OrderId = ord2Id, ProductId = p6.Id, ProductTitle = p6.Title, Quantity = 1, UnitPrice = 1199m, TotalPrice = 1199m, CreatedAt = now.AddDays(-3) },
            new OrderItem { Id = Guid.NewGuid(), TenantId = S1TenantId, OrderId = ord2Id, ProductId = p9.Id, ProductTitle = p9.Title, Quantity = 1, UnitPrice = 399m,  TotalPrice = 399m,  CreatedAt = now.AddDays(-3) }
        );
        db.Payments.Add(new Payment { Id = Guid.NewGuid(), TenantId = S1TenantId, OrderId = ord2Id, Amount = 2898m, Method = "Bank Transfer", PaidAt = now.AddDays(-3).AddHours(1), CreatedAt = now.AddDays(-3) });

        var ord3Id = Guid.NewGuid();
        db.Orders.Add(new Order
        {
            Id = ord3Id, TenantId = S1TenantId, OrderNumber = "PB-2026-0003",
            CustomerId = cu5.Id, CustomerName = cu5.Name, CustomerPhone = cu5.PhoneNumber,
            Status = OrderStatus.New, PaymentStatus = PaymentStatus.Pending,
            SourceChannel = SocialPlatform.WhatsApp, TotalAmount = 15999m,
            Notes = "Bridal lehenga — customer will pay 50% advance. Delivery in 20 days.",
            CreatedAt = now.AddDays(-1),
        });
        db.OrderItems.Add(new OrderItem { Id = Guid.NewGuid(), TenantId = S1TenantId, OrderId = ord3Id, ProductId = p7.Id, ProductTitle = p7.Title, Quantity = 1, UnitPrice = 15999m, TotalPrice = 15999m, CreatedAt = now.AddDays(-1) });

        await db.SaveChangesAsync();
        logger.LogInformation("Store 1 (Priya's Boutique) seeded.");
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  STORE 2 — Sugar & Crumbs Cake Studio (Premium Home Bakery)
    //  URL:   /sugar-crumbs
    //  Login: hello@sugarcrumbs.in / Demo@1234
    //  Theme: #EA580C (warm orange)
    // ══════════════════════════════════════════════════════════════════════════
    static async Task SeedStore2_BakeryAsync(AppDbContext db, ILogger logger)
    {
        if (await db.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Id == S2TenantId)) return;
        logger.LogInformation("Seeding Store 2 — Sugar & Crumbs Cake Studio...");

        var planId = await db.SubscriptionPlans.Where(p => p.Slug == "pro").Select(p => p.Id).FirstAsync();
        var now = DateTime.UtcNow;

        // ── Tenant + user + subscription ──────────────────────────────────────
        db.Tenants.Add(new Tenant
        {
            Id = S2TenantId, Name = "Sugar & Crumbs Cake Studio", Slug = "sugar-crumbs",
            ContactEmail = "hello@sugarcrumbs.in", ContactPhone = "+910000000002",
            IsActive = true, IsEmailVerified = true, CreatedAt = now,
        });
        db.TenantSubscriptions.Add(new TenantSubscription
        {
            Id = Guid.NewGuid(), TenantId = S2TenantId, PlanId = planId,
            Status = SubscriptionStatus.Trial, StartDate = now,
            EndDate = now.AddDays(30), IsAnnual = false, PricePaid = 0, CreatedAt = now,
        });
        db.Users.Add(new User
        {
            Id = S2UserId, TenantId = S2TenantId, Name = "Shreya Kapoor",
            Email = "hello@sugarcrumbs.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@1234"),
            Phone = "+910000000002", IsActive = true, IsEmailVerified = true, CreatedAt = now,
        });

        // ── Business + Storefront ─────────────────────────────────────────────
        db.Businesses.Add(new Business
        {
            Id = S2BizId, TenantId = S2TenantId,
            Name = "Sugar & Crumbs Cake Studio",
            Category = "Food & Bakery",
            Description = "Handcrafted custom cakes, cupcakes & desserts made with love. 100% eggless options available. Based in Bengaluru.",
            LogoUrl = "https://ui-avatars.com/api/?name=Sugar+Crumbs&background=EA580C&color=fff&size=128&bold=true",
            BannerUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=400&fit=crop",
            WhatsAppNumber = "910000000002",
            InstagramHandle = "@sugarandcrumbs.blr",
            Currency = "INR",
            WelcomeText = "Hello, sweet tooth! 🍰 Every cake is baked fresh to order with the finest ingredients.",
            DeliveryInfo = "Home delivery within Bengaluru (5km radius). Pre-orders required 48 hours in advance. Same-day delivery available for select items.",
            IsOnboardingComplete = true, CreatedAt = now,
        });
        db.StorefrontSettings.Add(new StorefrontSettings
        {
            Id = Guid.NewGuid(), TenantId = S2TenantId, BusinessId = S2BizId,
            Slug = "sugar-crumbs", ThemeColor = "#EA580C",
            SeoTitle = "Sugar & Crumbs Cake Studio — Custom Cakes in Bengaluru",
            SeoDescription = "Order custom cakes, cupcakes, cookies and dessert hampers. 100% eggless available. Free delivery within 5km of Indiranagar, Bengaluru.",
            WhatsAppCtaLabel = "Order Your Cake 🎂",
            InstagramCtaLabel = "See Our Creations",
            FacebookCtaLabel = "Follow on Facebook",
            ShowOutOfStockProducts = false,
            AllowPublicInquiries = true,
            AnnouncementText = "🎂 Birthday coming up? Pre-order your custom cake today! 48hr advance booking required. Call/WhatsApp us!",
            CreatedAt = now,
        });

        // ── Categories ────────────────────────────────────────────────────────
        var b1 = new Category { Id = Guid.NewGuid(), TenantId = S2TenantId, Name = "Custom Cakes",       Description = "Personalized cakes for every occasion",    SortOrder = 1, IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop", CreatedAt = now };
        var b2 = new Category { Id = Guid.NewGuid(), TenantId = S2TenantId, Name = "Cupcakes & Muffins", Description = "Bite-sized indulgences",                   SortOrder = 2, IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=400&fit=crop", CreatedAt = now };
        var b3 = new Category { Id = Guid.NewGuid(), TenantId = S2TenantId, Name = "Cookies & Brownies", Description = "Baked fresh, packed with love",            SortOrder = 3, IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop", CreatedAt = now };
        var b4 = new Category { Id = Guid.NewGuid(), TenantId = S2TenantId, Name = "Festive Specials",   Description = "Diwali, Christmas & seasonal treats",      SortOrder = 4, IsActive = true, CreatedAt = now };
        var b5 = new Category { Id = Guid.NewGuid(), TenantId = S2TenantId, Name = "Dessert Hampers",    Description = "Gift hampers & celebration boxes",         SortOrder = 5, IsActive = true, CreatedAt = now };
        db.Categories.AddRange(b1, b2, b3, b4, b5);

        // ── Products ──────────────────────────────────────────────────────────
        var bp1  = Prod(S2TenantId, b1.Id, "Truffle Fantasy Cake — 1 kg",         "Rich Belgian dark chocolate truffle cake with whipped cream frosting and ganache drip. Serves 8–10 people. Customise message free.",           "CAK-TRF-001",  950,   849, true,  15, 1);
        var bp2  = Prod(S2TenantId, b1.Id, "Strawberry Dream Cake — 1 kg",        "Fresh strawberry compote layered with vanilla sponge and cream cheese frosting. Light, fruity and utterly delicious.",                         "CAK-STR-002",  850,   749, true,  15, 2);
        var bp3  = Prod(S2TenantId, b1.Id, "Designer Fondant Cake — 500g",        "Custom fondant cake with your theme, character or design. Price varies by complexity. DM for quote. Minimum 72hr lead time.",                  "CAK-FON-003", 1500,  null, true,   8, 3);
        var bp4  = Prod(S2TenantId, b1.Id, "Red Velvet Cake — 500g",              "Classic red velvet with cream cheese frosting. Gorgeous slice reveal, perfect for anniversaries.",                                             "CAK-RVL-004",  649,   599, false, 20, 4);
        var bp5  = Prod(S2TenantId, b2.Id, "Chocolate Fudge Cupcakes — Box of 6", "Moist chocolate cupcakes with silky fudge frosting and sprinkles. Eggless available.",                                                        "CUP-CHO-001",  450,   399, true,  30, 5);
        var bp6  = Prod(S2TenantId, b2.Id, "Rainbow Swirl Cupcakes — Box of 6",   "Soft vanilla cupcakes with multi-colour buttercream swirl. Perfect for kids' birthdays and gender reveals.",                                  "CUP-RNB-002",  480,  null, false, 25, 6);
        var bp7  = Prod(S2TenantId, b3.Id, "Fudge Brownies — Box of 9",           "Gooey, fudgy brownies with a crinkle top. Made with premium Callebaut chocolate. Each approx. 60g.",                                         "BRW-FDG-001",  380,   349, true,  40, 7);
        var bp8  = Prod(S2TenantId, b3.Id, "Assorted Cookies — Box of 12",        "12 cookies in 4 flavours: butter, chocolate chip, oatmeal raisin & double choco. Perfect gifting option.",                                   "COK-AST-002",  320,  null, false, 50, 8);
        var bp9  = Prod(S2TenantId, b4.Id, "Diwali Dry Fruit Mithai Box — 500g",  "Handcrafted cashew barfi, kaju rolls and almond laddoos. Premium festive packaging. Order by Nov 1 to guarantee Diwali delivery.",            "FES-DIW-001",  699,   629, true,  20, 9);
        var bp10 = Prod(S2TenantId, b5.Id, "Birthday Celebration Hamper",         "Includes 1 small chocolate cake (300g) + 6 cupcakes + 9 brownies + personalised card. The perfect surprise package!",                        "HAM-BDY-001", 1499,  1299, true,  10, 10);
        db.Products.AddRange(bp1, bp2, bp3, bp4, bp5, bp6, bp7, bp8, bp9, bp10);

        // ── Product Images ────────────────────────────────────────────────────
        db.ProductImages.AddRange(
            Img(S2TenantId, bp1.Id,  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&h=750&fit=crop"),
            Img(S2TenantId, bp2.Id,  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=750&fit=crop"),
            Img(S2TenantId, bp3.Id,  "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&h=750&fit=crop"),
            Img(S2TenantId, bp4.Id,  "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&h=750&fit=crop"),
            Img(S2TenantId, bp5.Id,  "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=750&fit=crop"),
            Img(S2TenantId, bp6.Id,  "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&h=750&fit=crop"),
            Img(S2TenantId, bp7.Id,  "https://images.unsplash.com/photo-1589309736404-2d7c5abef7c2?w=600&h=750&fit=crop"),
            Img(S2TenantId, bp8.Id,  "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=750&fit=crop"),
            Img(S2TenantId, bp9.Id,  "https://images.unsplash.com/photo-1605290591168-2c63b7c3c6ab?w=600&h=750&fit=crop"),
            Img(S2TenantId, bp10.Id, "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&h=750&fit=crop")
        );

        // ── Customers ─────────────────────────────────────────────────────────
        var bc1 = Cust(S2TenantId, "Neha Agarwal",   "910000002001", "neha.agarwal@gmail.com",     4,  5600m, 7,  SocialPlatform.Instagram, "Bengaluru");
        var bc2 = Cust(S2TenantId, "Kiran Desai",    "910000002002", "kiran.desai@outlook.com",    2,  2400m, 20, SocialPlatform.WhatsApp,  "Bengaluru");
        var bc3 = Cust(S2TenantId, "Arjun Mehta",    "910000002003", null,                         1,  1499m, 35, SocialPlatform.WhatsApp,  "Bengaluru");
        var bc4 = Cust(S2TenantId, "Sana Khan",      "910000002004", "sana.k@yahoo.com",           6, 9200m,  3,  SocialPlatform.Instagram, "Bengaluru");
        db.Customers.AddRange(bc1, bc2, bc3, bc4);

        // ── Leads ─────────────────────────────────────────────────────────────
        db.Leads.AddRange(
            NewLead(S2TenantId, "Rohit Sharma",   "910000002011", SocialPlatform.WhatsApp,  LeadStatus.NewInquiry,     "Hi! I want to order a custom fondant cake for my daughter's 5th birthday. Theme: Frozen Princess. Budget ₹2000. Delivery on 15th.",    3, bp3.Id,  1),
            NewLead(S2TenantId, "Priti Nair",     "910000002012", SocialPlatform.Instagram, LeadStatus.Interested,     "Love your rainbow cupcakes! Can I order 24 cupcakes for my office party? Need by Friday.",                                               2, bp6.Id,  3,  2),
            NewLead(S2TenantId, "Vinay Kumar",    "910000002013", SocialPlatform.WhatsApp,  LeadStatus.FollowUpPending,"Interested in the Diwali hamper. Need 10 boxes for corporate gifting. Can you give bulk pricing?",                                        2, bp9.Id, 48),
            NewLead(S2TenantId, "Anita Joshi",    "910000002014", SocialPlatform.WhatsApp,  LeadStatus.OrderConfirmed, "Ordered 2kg chocolate truffle for anniversary. Loved it! Will order again next month.",                                                  1, bp1.Id,  72)
        );

        // ── Orders ────────────────────────────────────────────────────────────
        var bo1Id = Guid.NewGuid();
        db.Orders.Add(new Order
        {
            Id = bo1Id, TenantId = S2TenantId, OrderNumber = "SC-2026-0001",
            CustomerId = bc4.Id, CustomerName = bc4.Name, CustomerPhone = bc4.PhoneNumber,
            Status = OrderStatus.Delivered, PaymentStatus = PaymentStatus.Paid,
            SourceChannel = SocialPlatform.Instagram, TotalAmount = 2547m,
            Notes = "Birthday surprise — please pack with ribbon and add 'Happy Birthday Sana' card.",
            CreatedAt = now.AddDays(-7),
        });
        db.OrderItems.AddRange(
            new OrderItem { Id = Guid.NewGuid(), TenantId = S2TenantId, OrderId = bo1Id, ProductId = bp1.Id, ProductTitle = bp1.Title, Quantity = 1, UnitPrice = 849m, TotalPrice = 849m, CreatedAt = now.AddDays(-7) },
            new OrderItem { Id = Guid.NewGuid(), TenantId = S2TenantId, OrderId = bo1Id, ProductId = bp5.Id, ProductTitle = bp5.Title, Quantity = 2, UnitPrice = 399m, TotalPrice = 798m, CreatedAt = now.AddDays(-7) },
            new OrderItem { Id = Guid.NewGuid(), TenantId = S2TenantId, OrderId = bo1Id, ProductId = bp7.Id, ProductTitle = bp7.Title, Quantity = 2, UnitPrice = 349m, TotalPrice = 698m, CreatedAt = now.AddDays(-7) },
            new OrderItem { Id = Guid.NewGuid(), TenantId = S2TenantId, OrderId = bo1Id, ProductId = bp8.Id, ProductTitle = bp8.Title, Quantity = 1, UnitPrice = 320m, TotalPrice = 320m, CreatedAt = now.AddDays(-7) }
        );
        db.Payments.Add(new Payment { Id = Guid.NewGuid(), TenantId = S2TenantId, OrderId = bo1Id, Amount = 2547m, Method = "UPI", PaidAt = now.AddDays(-7).AddHours(1), CreatedAt = now.AddDays(-7) });

        var bo2Id = Guid.NewGuid();
        db.Orders.Add(new Order
        {
            Id = bo2Id, TenantId = S2TenantId, OrderNumber = "SC-2026-0002",
            CustomerId = bc1.Id, CustomerName = bc1.Name, CustomerPhone = bc1.PhoneNumber,
            Status = OrderStatus.New, PaymentStatus = PaymentStatus.Pending,
            SourceChannel = SocialPlatform.WhatsApp, TotalAmount = 1299m,
            Notes = "Birthday hamper. Delivery on 20th. Please add custom message card.",
            CreatedAt = now.AddDays(-1),
        });
        db.OrderItems.Add(new OrderItem { Id = Guid.NewGuid(), TenantId = S2TenantId, OrderId = bo2Id, ProductId = bp10.Id, ProductTitle = bp10.Title, Quantity = 1, UnitPrice = 1299m, TotalPrice = 1299m, CreatedAt = now.AddDays(-1) });

        await db.SaveChangesAsync();
        logger.LogInformation("Store 2 (Sugar & Crumbs) seeded.");
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  STORE 3 — Aradhya Jewels (Handmade Jewelry & Accessories)
    //  URL:   /aradhya-jewels
    //  Login: hello@aradhyajewels.in / Demo@1234
    //  Theme: #7C3AED (premium violet)
    // ══════════════════════════════════════════════════════════════════════════
    static async Task SeedStore3_JewelryAsync(AppDbContext db, ILogger logger)
    {
        if (await db.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Id == S3TenantId)) return;
        logger.LogInformation("Seeding Store 3 — Aradhya Jewels...");

        var planId = await db.SubscriptionPlans.Where(p => p.Slug == "pro").Select(p => p.Id).FirstAsync();
        var now = DateTime.UtcNow;

        // ── Tenant + user + subscription ──────────────────────────────────────
        db.Tenants.Add(new Tenant
        {
            Id = S3TenantId, Name = "Aradhya Jewels", Slug = "aradhya-jewels",
            ContactEmail = "hello@aradhyajewels.in", ContactPhone = "+910000000003",
            IsActive = true, IsEmailVerified = true, CreatedAt = now,
        });
        db.TenantSubscriptions.Add(new TenantSubscription
        {
            Id = Guid.NewGuid(), TenantId = S3TenantId, PlanId = planId,
            Status = SubscriptionStatus.Trial, StartDate = now,
            EndDate = now.AddDays(30), IsAnnual = false, PricePaid = 0, CreatedAt = now,
        });
        db.Users.Add(new User
        {
            Id = S3UserId, TenantId = S3TenantId, Name = "Aradhya Jain",
            Email = "hello@aradhyajewels.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@1234"),
            Phone = "+910000000003", IsActive = true, IsEmailVerified = true, CreatedAt = now,
        });

        // ── Business + Storefront ─────────────────────────────────────────────
        db.Businesses.Add(new Business
        {
            Id = S3BizId, TenantId = S3TenantId,
            Name = "Aradhya Jewels",
            Category = "Jewelry & Accessories",
            Description = "Handcrafted silver & oxidised jewelry made by artisans in Jaipur. Each piece is unique, ethically made and nickel-free.",
            LogoUrl = "https://ui-avatars.com/api/?name=Aradhya+Jewels&background=7C3AED&color=fff&size=128&bold=true",
            BannerUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=400&fit=crop",
            WhatsAppNumber = "910000000003",
            InstagramHandle = "@aradhyajewels",
            FacebookPageUrl = "https://facebook.com/aradhyajewels",
            Currency = "INR",
            WelcomeText = "Welcome to Aradhya Jewels ✨ Every piece is a work of art, crafted by hand.",
            DeliveryInfo = "Free shipping Pan-India on orders above ₹499. Delivered in 5-7 business days. Express delivery available.",
            IsOnboardingComplete = true, CreatedAt = now,
        });
        db.StorefrontSettings.Add(new StorefrontSettings
        {
            Id = Guid.NewGuid(), TenantId = S3TenantId, BusinessId = S3BizId,
            Slug = "aradhya-jewels", ThemeColor = "#7C3AED",
            SeoTitle = "Aradhya Jewels — Handcrafted Silver & Oxidised Jewelry",
            SeoDescription = "Shop handcrafted oxidised silver jewelry, kundan sets, terracotta earrings and more. Nickel-free, ethically made. Ships Pan-India.",
            WhatsAppCtaLabel = "Chat & Order on WhatsApp ✨",
            InstagramCtaLabel = "Follow for New Arrivals",
            FacebookCtaLabel = "Like on Facebook",
            ShowOutOfStockProducts = false,
            AllowPublicInquiries = true,
            AnnouncementText = "✨ Festive Sale — Flat 15% off on all Kundan & Meenakari sets! Use code FESTIVE15 on WhatsApp orders.",
            CreatedAt = now,
        });

        // ── Categories ────────────────────────────────────────────────────────
        var j1 = new Category { Id = Guid.NewGuid(), TenantId = S3TenantId, Name = "Necklaces & Sets",   Description = "Statement & layered necklace sets", SortOrder = 1, IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop", CreatedAt = now };
        var j2 = new Category { Id = Guid.NewGuid(), TenantId = S3TenantId, Name = "Earrings",           Description = "Jhumkas, chandbalis & danglers",    SortOrder = 2, IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=400&h=400&fit=crop", CreatedAt = now };
        var j3 = new Category { Id = Guid.NewGuid(), TenantId = S3TenantId, Name = "Bangles & Bracelets",Description = "Oxidised, kundan & beaded bangles", SortOrder = 3, IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1573408301185-9519f94815d1?w=400&h=400&fit=crop", CreatedAt = now };
        var j4 = new Category { Id = Guid.NewGuid(), TenantId = S3TenantId, Name = "Rings",              Description = "Adjustable & statement rings",      SortOrder = 4, IsActive = true, CreatedAt = now };
        var j5 = new Category { Id = Guid.NewGuid(), TenantId = S3TenantId, Name = "Anklets & Maang Tikka", Description = "Traditional payal & tikka",     SortOrder = 5, IsActive = true, CreatedAt = now };
        db.Categories.AddRange(j1, j2, j3, j4, j5);

        // ── Products ──────────────────────────────────────────────────────────
        var jp1  = Prod(S3TenantId, j1.Id, "Kundan Choker Necklace Set",          "Royal kundan choker with matching earrings and maang tikka. Gold-plated brass base, hand-set Kundan stones. Bridal favourite.",                "JWL-KCH-001", 2200,  1899, true,  15, 1);
        var jp2  = Prod(S3TenantId, j1.Id, "Oxidised Silver Layered Necklace",    "3-layer oxidised silver necklace with turquoise stone drops. Bohemian style, perfect for ethnic & fusion outfits.",                          "JWL-OXL-002",  850,   749, true,  25, 2);
        var jp3  = Prod(S3TenantId, j1.Id, "Meenakari Peacock Necklace Set",      "Traditional meenakari enamel work peacock design with earrings. Vibrant colours, lightweight and nickel-free.",                              "JWL-MEE-003", 1500,  1299, true,  12, 3);
        var jp4  = Prod(S3TenantId, j2.Id, "Temple Jhumka Earrings — Gold Tone",  "Classic temple jhumka with intricate filigree work. Gold-tone plating, tiny ghungroo bells at the base. One-size.",                          "JWL-JHM-001",  650,   549, true,  40, 4);
        var jp5  = Prod(S3TenantId, j2.Id, "Oxidised Chandbali Earrings",         "Moon-shaped chandbali earrings with antique silver finish and pearl drops. Lightweight for all-day wear.",                                   "JWL-CHD-002",  480,  null, false, 35, 5);
        var jp6  = Prod(S3TenantId, j2.Id, "Terracotta Hoop Earrings — Painted",  "Handpainted terracotta hoops with folk art motifs. Each pair is unique and one-of-a-kind. Extremely lightweight.",                          "JWL-TER-003",  350,   299, false, 50, 6);
        var jp7  = Prod(S3TenantId, j3.Id, "Oxidised Silver Bangles — Set of 8",  "Handcrafted oxidised silver-tone bangles with floral relief work. One-size-fits-most (adjustable). Nickel-free.",                           "JWL-BNG-001",  650,  null, true,  30, 7);
        var jp8  = Prod(S3TenantId, j3.Id, "Kundan Bracelet — Floral Motif",      "Delicate kundan stone bracelet on a gold-tone chain. Single-piece, adjustable length. Perfect gifting option.",                             "JWL-KBR-002",  799,   699, false, 20, 8);
        var jp9  = Prod(S3TenantId, j4.Id, "Adjustable Oxidised Ring — Boho Leaf","Oxidised silver ring with leaf motif. Fully adjustable, unisex. Great for ethnic and casual styling.",                                      "JWL-RNG-001",  280,   249, false, 60, 9);
        var jp10 = Prod(S3TenantId, j5.Id, "Silver Anklet Pair — Ghungroo Bell",  "Traditional silver-tone ghungroo anklet pair. Adjustable clasp, nickel-free, lightweight. The jingle adds a lovely charm.",                 "JWL-ANK-001",  550,   499, true,  45, 10);
        db.Products.AddRange(jp1, jp2, jp3, jp4, jp5, jp6, jp7, jp8, jp9, jp10);

        // ── Product Images ────────────────────────────────────────────────────
        db.ProductImages.AddRange(
            Img(S3TenantId, jp1.Id,  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=750&fit=crop"),
            Img(S3TenantId, jp2.Id,  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=750&fit=crop"),
            Img(S3TenantId, jp3.Id,  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=750&fit=crop"),
            Img(S3TenantId, jp4.Id,  "https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=600&h=750&fit=crop"),
            Img(S3TenantId, jp5.Id,  "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=750&fit=crop"),
            Img(S3TenantId, jp6.Id,  "https://picsum.photos/seed/terracotta-earring/600/750"),
            Img(S3TenantId, jp7.Id,  "https://images.unsplash.com/photo-1573408301185-9519f94815d1?w=600&h=750&fit=crop"),
            Img(S3TenantId, jp8.Id,  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=750&fit=crop"),
            Img(S3TenantId, jp9.Id,  "https://picsum.photos/seed/boho-ring/600/750"),
            Img(S3TenantId, jp10.Id, "https://images.unsplash.com/photo-1601121141499-f1b64929b0d9?w=600&h=750&fit=crop")
        );

        // ── Customers ─────────────────────────────────────────────────────────
        var jc1 = Cust(S3TenantId, "Divya Menon",     "910000003001", "divya.menon@gmail.com",    5,  7200m,  5, SocialPlatform.Instagram, "Chennai");
        var jc2 = Cust(S3TenantId, "Shreya Bhatia",   "910000003002", "shreya@outlook.com",       3,  3800m, 18, SocialPlatform.WhatsApp,  "Jaipur");
        var jc3 = Cust(S3TenantId, "Fatima Shaikh",   "910000003003", null,                       2,  2100m, 30, SocialPlatform.WhatsApp,  "Mumbai");
        var jc4 = Cust(S3TenantId, "Aishwarya Kumar", "910000003004", "aish.k@gmail.com",         7, 12400m,  2, SocialPlatform.Instagram, "Bengaluru");
        db.Customers.AddRange(jc1, jc2, jc3, jc4);

        // ── Leads ─────────────────────────────────────────────────────────────
        db.Leads.AddRange(
            NewLead(S3TenantId, "Tanvi Sharma",   "910000003011", SocialPlatform.Instagram, LeadStatus.NewInquiry,     "Hi! Absolutely love your Kundan choker. Is it bridal? What's the actual colour? Can I see more pictures?",                               3, jp1.Id,  1),
            NewLead(S3TenantId, "Rashida Bano",   "910000003012", SocialPlatform.WhatsApp,  LeadStatus.Interested,     "Looking for a full bridal set — necklace, earrings, bangles. Budget ₹5000. Can you customise?",                                          3, jp3.Id,  6,  1),
            NewLead(S3TenantId, "Nandita Rao",    "910000003013", SocialPlatform.WhatsApp,  LeadStatus.FollowUpPending,"I ordered the oxidised bangles last month. Looking for matching earrings. What do you recommend?",                                        2, jp7.Id, 36),
            NewLead(S3TenantId, "Geeta Pillai",   "910000003014", SocialPlatform.Facebook,  LeadStatus.NewInquiry,     "Do you do corporate gifting? Need 50 pieces of small jewelry items for employee gifts. Budget ₹200-300 per piece.",                       2, null,   2),
            NewLead(S3TenantId, "Meena Joshi",    "910000003015", SocialPlatform.Instagram, LeadStatus.OrderConfirmed, "Ordered the terracotta earrings. They look exactly like the photos! Will definitely order again.",                                         1, jp6.Id, 120)
        );

        // ── Orders ────────────────────────────────────────────────────────────
        var jo1Id = Guid.NewGuid();
        db.Orders.Add(new Order
        {
            Id = jo1Id, TenantId = S3TenantId, OrderNumber = "AJ-2026-0001",
            CustomerId = jc4.Id, CustomerName = jc4.Name, CustomerPhone = jc4.PhoneNumber,
            Status = OrderStatus.Delivered, PaymentStatus = PaymentStatus.Paid,
            SourceChannel = SocialPlatform.Instagram, TotalAmount = 3146m,
            Notes = "Shipped in jewelry gift box. Customer very happy — repeat buyer.",
            CreatedAt = now.AddDays(-5),
        });
        db.OrderItems.AddRange(
            new OrderItem { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo1Id, ProductId = jp1.Id, ProductTitle = jp1.Title, Quantity = 1, UnitPrice = 1899m, TotalPrice = 1899m, CreatedAt = now.AddDays(-5) },
            new OrderItem { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo1Id, ProductId = jp7.Id, ProductTitle = jp7.Title, Quantity = 1, UnitPrice = 650m,  TotalPrice = 650m,  CreatedAt = now.AddDays(-5) },
            new OrderItem { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo1Id, ProductId = jp10.Id,ProductTitle = jp10.Title,Quantity = 1, UnitPrice = 499m,  TotalPrice = 499m,  CreatedAt = now.AddDays(-5) },
            new OrderItem { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo1Id, ProductId = jp9.Id, ProductTitle = jp9.Title, Quantity = 1, UnitPrice = 249m,  TotalPrice = 249m,  CreatedAt = now.AddDays(-5) }
        );
        db.Payments.Add(new Payment { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo1Id, Amount = 3146m, Method = "UPI", PaidAt = now.AddDays(-5).AddHours(2), CreatedAt = now.AddDays(-5) });
        db.OrderStatusHistories.AddRange(
            new OrderStatusHistory { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo1Id, FromStatus = OrderStatus.New, ToStatus = OrderStatus.Confirmed,  ChangedBy = S3UserId, CreatedAt = now.AddDays(-5).AddHours(1) },
            new OrderStatusHistory { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo1Id, FromStatus = OrderStatus.Confirmed, ToStatus = OrderStatus.Packed,     ChangedBy = S3UserId, CreatedAt = now.AddDays(-4) },
            new OrderStatusHistory { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo1Id, FromStatus = OrderStatus.Packed,    ToStatus = OrderStatus.Delivered,   ChangedBy = S3UserId, CreatedAt = now.AddDays(-2) }
        );

        var jo2Id = Guid.NewGuid();
        db.Orders.Add(new Order
        {
            Id = jo2Id, TenantId = S3TenantId, OrderNumber = "AJ-2026-0002",
            CustomerId = jc1.Id, CustomerName = jc1.Name, CustomerPhone = jc1.PhoneNumber,
            Status = OrderStatus.Confirmed, PaymentStatus = PaymentStatus.Paid,
            SourceChannel = SocialPlatform.WhatsApp, TotalAmount = 2048m,
            Notes = "Wedding set order. Delivery needed by the 25th.",
            CreatedAt = now.AddDays(-2),
        });
        db.OrderItems.AddRange(
            new OrderItem { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo2Id, ProductId = jp3.Id, ProductTitle = jp3.Title, Quantity = 1, UnitPrice = 1299m, TotalPrice = 1299m, CreatedAt = now.AddDays(-2) },
            new OrderItem { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo2Id, ProductId = jp4.Id, ProductTitle = jp4.Title, Quantity = 1, UnitPrice = 549m,  TotalPrice = 549m,  CreatedAt = now.AddDays(-2) },
            new OrderItem { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo2Id, ProductId = jp9.Id, ProductTitle = jp9.Title, Quantity = 1, UnitPrice = 249m,  TotalPrice = 249m,  CreatedAt = now.AddDays(-2) }
        );
        db.Payments.Add(new Payment { Id = Guid.NewGuid(), TenantId = S3TenantId, OrderId = jo2Id, Amount = 2048m, Method = "GPay", PaidAt = now.AddDays(-2).AddHours(3), CreatedAt = now.AddDays(-2) });

        await db.SaveChangesAsync();
        logger.LogInformation("Store 3 (Aradhya Jewels) seeded.");
    }
}

