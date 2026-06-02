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

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider services, ILogger logger)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // ── Subscription Plans (always seeded, global) ────────────────────────
        if (!await db.SubscriptionPlans.AnyAsync())
        {
            logger.LogInformation("Seeding subscription plans...");

            var planBasicId = Guid.NewGuid();
            var planProId = Guid.NewGuid();
            var planProfessionalId = Guid.NewGuid();

            db.SubscriptionPlans.AddRange(
                new SubscriptionPlan
                {
                    Id = planBasicId, Name = "Basic", Slug = "basic", SortOrder = 1,
                    Description = "Perfect for small boutiques just getting started.",
                    MonthlyPrice = 200, AnnualPrice = 1800,
                    MaxProducts = 50, MaxStaffUsers = 1, MaxMonthlyLeads = 100,
                    MaxAiSuggestionsPerMonth = 0,
                    AllowsCustomBranding = false, AllowsAdvancedAnalytics = false, AllowsAiSuggestions = false,
                    IsActive = true, CreatedAt = DateTime.UtcNow,
                },
                new SubscriptionPlan
                {
                    Id = planProId, Name = "Pro", Slug = "pro", SortOrder = 2,
                    Description = "For growing stores ready to scale with AI and integrations.",
                    MonthlyPrice = 999, AnnualPrice = 8999,
                    MaxProducts = 500, MaxStaffUsers = 3, MaxMonthlyLeads = 1000,
                    MaxAiSuggestionsPerMonth = 200,
                    AllowsCustomBranding = true, AllowsAdvancedAnalytics = true, AllowsAiSuggestions = true,
                    IsActive = true, CreatedAt = DateTime.UtcNow,
                },
                new SubscriptionPlan
                {
                    Id = planProfessionalId, Name = "Professional", Slug = "professional", SortOrder = 3,
                    Description = "Unlimited power for established businesses with full automation.",
                    MonthlyPrice = 2499, AnnualPrice = 21999,
                    MaxProducts = int.MaxValue, MaxStaffUsers = int.MaxValue, MaxMonthlyLeads = int.MaxValue,
                    MaxAiSuggestionsPerMonth = int.MaxValue,
                    AllowsCustomBranding = true, AllowsAdvancedAnalytics = true, AllowsAiSuggestions = true,
                    IsActive = true, CreatedAt = DateTime.UtcNow,
                }
            );

            await db.SaveChangesAsync();
            logger.LogInformation("Subscription plans seeded.");
        }

        // ── Admin Tenant + SuperAdmin Role + Admin User (always seeded) ───────
        var adminTenantId = new Guid("00000000-0000-0000-0000-000000000001");
        var superAdminRoleId = new Guid("00000000-0000-0000-0000-000000000010");
        var adminUserId = new Guid("00000000-0000-0000-0000-000000000100");

        var adminTenantExists = await db.Tenants.IgnoreQueryFilters()
            .AnyAsync(t => t.Id == adminTenantId);

        if (!adminTenantExists)
        {
            logger.LogInformation("Seeding admin tenant, role, and user...");

            db.Tenants.Add(new Tenant
            {
                Id = adminTenantId,
                Name = "ReplyCart System",
                Slug = "admin-system",
                ContactEmail = "system@replycart.app",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            });

            db.Roles.Add(new Role
            {
                Id = superAdminRoleId,
                Name = "SuperAdmin",
                Description = "Full platform access",
                CreatedAt = DateTime.UtcNow,
            });

            db.Users.Add(new User
            {
                Id = adminUserId,
                TenantId = adminTenantId,
                Name = "ReplyCart Admin",
                Email = "admin@replycart.app",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@2024"),
                IsActive = true,
                IsEmailVerified = true,
                CreatedAt = DateTime.UtcNow,
            });

            db.UserRoles.Add(new UserRole
            {
                Id = Guid.NewGuid(),
                UserId = adminUserId,
                RoleId = superAdminRoleId,
                CreatedAt = DateTime.UtcNow,
            });

            await db.SaveChangesAsync();
            logger.LogInformation("Admin tenant/role/user seeded. Login: admin@replycart.app / Admin@2024");
        }

        // ── Demo tenant data (only if no non-admin tenants exist) ────────────
        var hasNonAdminTenants = await db.Tenants.IgnoreQueryFilters()
            .Where(t => t.Slug != "admin-system")
            .AnyAsync();

        if (hasNonAdminTenants)
        {
            logger.LogInformation("Non-admin tenant data already exists — skipping demo seed.");
            return;
        }

        logger.LogInformation("Seeding sample store data...");

        // Grab the pro plan ID for the demo subscription
        var planProSlug = await db.SubscriptionPlans
            .Where(p => p.Slug == "pro")
            .Select(p => p.Id)
            .FirstOrDefaultAsync();

        // ── Tenant ────────────────────────────────────────────────────────────
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Priya's Boutique",
            Slug = "priya-boutique",
            ContactEmail = "priya@priyaboutique.in",
            ContactPhone = "+919876543210",
            IsActive = true,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow,
        };
        db.Tenants.Add(tenant);

        // ── Subscription (demo tenant starts on Pro trial) ────────────────────
        db.TenantSubscriptions.Add(new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = planProSlug,
            Status = SubscriptionStatus.Trial,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            IsAnnual = false,
            PricePaid = 0,
            CreatedAt = DateTime.UtcNow,
        });

        // ── User (owner) ──────────────────────────────────────────────────────
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            TenantId = tenantId,
            Name = "Priya Sharma",
            Email = "priya@priyaboutique.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@1234"),
            Phone = "+919876543210",
            IsActive = true,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow,
        };
        db.Users.Add(user);

        // ── Business ──────────────────────────────────────────────────────────
        var businessId = Guid.NewGuid();
        var business = new Business
        {
            Id = businessId,
            TenantId = tenantId,
            Name = "Priya's Boutique",
            Category = "Fashion & Clothing",
            Description = "Premium ethnic and fusion wear for women. Handcrafted with love from Jaipur.",
            LogoUrl = "https://ui-avatars.com/api/?name=Priya+Boutique&background=0f766e&color=fff&size=128",
            WhatsAppNumber = "919876543210",
            InstagramHandle = "@priyaboutique",
            FacebookPageUrl = "https://facebook.com/priyaboutique",
            Currency = "INR",
            WelcomeText = "Welcome to Priya's Boutique! Browse our handcrafted ethnic wear.",
            DeliveryInfo = "Free shipping on orders above ₹999. Delivered in 3-5 business days.",
            IsOnboardingComplete = true,
            CreatedAt = DateTime.UtcNow,
        };
        db.Businesses.Add(business);

        // ── Storefront Settings ────────────────────────────────────────────────
        db.StorefrontSettings.Add(new StorefrontSettings
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            BusinessId = businessId,
            Slug = "priya-boutique",
            ThemeColor = "#0f766e",
            SeoTitle = "Priya's Boutique — Ethnic Wear from Jaipur",
            SeoDescription = "Shop premium handcrafted ethnic and fusion wear. Sarees, kurtis, lehengas and more.",
            WhatsAppCtaLabel = "Order on WhatsApp",
            InstagramCtaLabel = "Follow on Instagram",
            FacebookCtaLabel = "Like on Facebook",
            ShowOutOfStockProducts = false,
            AllowPublicInquiries = true,
            CreatedAt = DateTime.UtcNow,
        });

        // ── Categories ────────────────────────────────────────────────────────
        var catSarees = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Sarees", SortOrder = 1, IsActive = true, CreatedAt = DateTime.UtcNow };
        var catKurtis = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Kurtis", SortOrder = 2, IsActive = true, CreatedAt = DateTime.UtcNow };
        var catLehengas = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Lehengas", SortOrder = 3, IsActive = true, CreatedAt = DateTime.UtcNow };
        var catJewellery = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Jewellery", SortOrder = 4, IsActive = true, CreatedAt = DateTime.UtcNow };
        var catDupatta = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Dupattas & Stoles", SortOrder = 5, IsActive = true, CreatedAt = DateTime.UtcNow };
        db.Categories.AddRange(catSarees, catKurtis, catLehengas, catJewellery, catDupatta);

        // ── Products ──────────────────────────────────────────────────────────
        var products = new List<Product>
        {
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catSarees.Id,
                Title = "Banarasi Silk Saree — Royal Blue",
                Description = "Handwoven pure Banarasi silk saree with zari work. Perfect for weddings and festive occasions.",
                Sku = "SAR-BAN-001", BasePrice = 4500, DiscountedPrice = 3999,
                Status = ProductStatus.Active, IsFeatured = true, StockQuantity = 12, SortOrder = 1, CreatedAt = DateTime.UtcNow,
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catSarees.Id,
                Title = "Chiffon Printed Saree — Floral Pink",
                Description = "Lightweight chiffon saree with all-over floral print. Comes with matching blouse piece.",
                Sku = "SAR-CHF-002", BasePrice = 1200, DiscountedPrice = 999,
                Status = ProductStatus.Active, IsFeatured = false, StockQuantity = 25, SortOrder = 2, CreatedAt = DateTime.UtcNow,
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catKurtis.Id,
                Title = "Anarkali Kurti — Teal Green",
                Description = "Floor-length anarkali kurti in pure cotton with block print. Available in S-XXL.",
                Sku = "KUR-ANK-001", BasePrice = 1500, DiscountedPrice = 1299,
                Status = ProductStatus.Active, IsFeatured = true, StockQuantity = 30, SortOrder = 3, CreatedAt = DateTime.UtcNow,
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catKurtis.Id,
                Title = "Straight Kurti Set — Lavender",
                Description = "3-piece straight kurti set with palazzo and dupatta in premium rayon fabric.",
                Sku = "KUR-SET-002", BasePrice = 1800, DiscountedPrice = 1599,
                Status = ProductStatus.Active, IsFeatured = true, StockQuantity = 18, SortOrder = 4, CreatedAt = DateTime.UtcNow,
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catLehengas.Id,
                Title = "Bridal Lehenga — Crimson Red",
                Description = "Heavy embroidered bridal lehenga with dupatta. Made-to-order available.",
                Sku = "LEH-BRI-001", BasePrice = 18000, DiscountedPrice = 15999,
                Status = ProductStatus.Active, IsFeatured = true, StockQuantity = 5, SortOrder = 5, CreatedAt = DateTime.UtcNow,
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catLehengas.Id,
                Title = "Party Lehenga — Mint Green",
                Description = "Semi-stitched lehenga choli for parties and functions. Net fabric with sequin work.",
                Sku = "LEH-PAR-002", BasePrice = 3500, DiscountedPrice = 2999,
                Status = ProductStatus.Active, IsFeatured = false, StockQuantity = 10, SortOrder = 6, CreatedAt = DateTime.UtcNow,
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catJewellery.Id,
                Title = "Kundan Necklace Set",
                Description = "Traditional kundan necklace with earrings. Gold-plated with stone setting.",
                Sku = "JWL-KUN-001", BasePrice = 2200, DiscountedPrice = 1899,
                Status = ProductStatus.Active, IsFeatured = true, StockQuantity = 20, SortOrder = 7, CreatedAt = DateTime.UtcNow,
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catJewellery.Id,
                Title = "Oxidised Silver Bangles — Set of 8",
                Description = "Handcrafted oxidised silver bangles. One-size fits all with adjustable opening.",
                Sku = "JWL-BAN-002", BasePrice = 650, DiscountedPrice = null,
                Status = ProductStatus.Active, IsFeatured = false, StockQuantity = 40, SortOrder = 8, CreatedAt = DateTime.UtcNow,
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catDupatta.Id,
                Title = "Bandhani Dupatta — Yellow",
                Description = "Pure cotton bandhani dupatta from Rajasthan. Hand-tied tie-dye print.",
                Sku = "DUP-BAN-001", BasePrice = 450, DiscountedPrice = 399,
                Status = ProductStatus.Active, IsFeatured = false, StockQuantity = 35, SortOrder = 9, CreatedAt = DateTime.UtcNow,
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId, CategoryId = catSarees.Id,
                Title = "Kanjivaram Silk Saree — Maroon Gold",
                Description = "Authentic Kanjivaram silk saree with traditional temple border and zari pallu.",
                Sku = "SAR-KAN-003", BasePrice = 8500, DiscountedPrice = 7499,
                Status = ProductStatus.Active, IsFeatured = true, StockQuantity = 8, SortOrder = 10, CreatedAt = DateTime.UtcNow,
            },
        };
        db.Products.AddRange(products);

        // ── Customers ─────────────────────────────────────────────────────────
        var customers = new List<Customer>
        {
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Ananya Gupta", PhoneNumber = "919811223344", Email = "ananya@gmail.com", TotalOrders = 3, TotalSpend = 8700, LastOrderDate = DateTime.UtcNow.AddDays(-10), PreferredChannel = SocialPlatform.WhatsApp, City = "Delhi", CreatedAt = DateTime.UtcNow.AddDays(-90) },
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Meera Patel", PhoneNumber = "919922334455", Email = "meera.patel@gmail.com", TotalOrders = 5, TotalSpend = 14200, LastOrderDate = DateTime.UtcNow.AddDays(-3), PreferredChannel = SocialPlatform.Instagram, City = "Ahmedabad", CreatedAt = DateTime.UtcNow.AddDays(-120) },
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Sunita Rao", PhoneNumber = "919833445566", Email = null, TotalOrders = 1, TotalSpend = 3999, LastOrderDate = DateTime.UtcNow.AddDays(-25), PreferredChannel = SocialPlatform.WhatsApp, City = "Hyderabad", CreatedAt = DateTime.UtcNow.AddDays(-30) },
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Kavita Singh", PhoneNumber = "919744556677", Email = "kavita@yahoo.com", TotalOrders = 2, TotalSpend = 5600, LastOrderDate = DateTime.UtcNow.AddDays(-15), PreferredChannel = SocialPlatform.Facebook, City = "Mumbai", CreatedAt = DateTime.UtcNow.AddDays(-60) },
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Deepika Nair", PhoneNumber = "919655667788", Email = "deepika.nair@outlook.com", TotalOrders = 4, TotalSpend = 11500, LastOrderDate = DateTime.UtcNow.AddDays(-7), PreferredChannel = SocialPlatform.WhatsApp, City = "Kochi", CreatedAt = DateTime.UtcNow.AddDays(-100) },
        };
        db.Customers.AddRange(customers);

        // ── Leads ─────────────────────────────────────────────────────────────
        var leads = new List<Lead>
        {
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId,
                CustomerName = "Riya Shah", CustomerPhone = "919900112233",
                SourceChannel = SocialPlatform.WhatsApp, Status = LeadStatus.NewInquiry,
                InquiryNote = "Hi, I saw your Banarasi saree. What sizes are available and can you do custom blouse?",
                Priority = 2, InterestedProductId = products[0].Id,
                LastActivityDate = DateTime.UtcNow.AddHours(-2), CreatedAt = DateTime.UtcNow.AddHours(-2),
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId,
                CustomerName = "Pooja Mehta", CustomerPhone = "919811009988",
                SourceChannel = SocialPlatform.Instagram, Status = LeadStatus.Interested,
                InquiryNote = "Interested in the bridal lehenga. Budget around 15k. Can you share more options?",
                Priority = 3, InterestedProductId = products[4].Id,
                FollowUpDate = DateTime.UtcNow.AddDays(1),
                LastActivityDate = DateTime.UtcNow.AddHours(-5), CreatedAt = DateTime.UtcNow.AddDays(-1),
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId,
                CustomerName = "Nisha Verma", CustomerPhone = "919722334411",
                SourceChannel = SocialPlatform.WhatsApp, Status = LeadStatus.FollowUpPending,
                InquiryNote = "I want to order 3 kurtis for a family function. Can I get bulk discount?",
                Priority = 2, InterestedProductId = products[2].Id,
                LastActivityDate = DateTime.UtcNow.AddDays(-1), CreatedAt = DateTime.UtcNow.AddDays(-3),
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId,
                CustomerName = "Lakshmi R", CustomerPhone = "919633221100",
                SourceChannel = SocialPlatform.WhatsApp, Status = LeadStatus.NewInquiry,
                InquiryNote = "Do you have Kanjivaram sarees below 5000?",
                Priority = 1, InterestedProductId = products[9].Id,
                LastActivityDate = DateTime.UtcNow.AddMinutes(-30), CreatedAt = DateTime.UtcNow.AddMinutes(-30),
            },
            new() {
                Id = Guid.NewGuid(), TenantId = tenantId,
                CustomerName = "Anjali Sharma", CustomerPhone = "919544332211",
                SourceChannel = SocialPlatform.Facebook, Status = LeadStatus.Lost,
                InquiryNote = "Looking for bridesmaid outfits, but found something cheaper elsewhere.",
                Priority = 1, FollowUpDate = null,
                LastActivityDate = DateTime.UtcNow.AddDays(-10), CreatedAt = DateTime.UtcNow.AddDays(-14),
            },
        };
        db.Leads.AddRange(leads);

        // ── Orders ────────────────────────────────────────────────────────────
        var order1Id = Guid.NewGuid();
        var order1 = new Order
        {
            Id = order1Id, TenantId = tenantId,
            OrderNumber = "RC-2026-0001",
            CustomerId = customers[0].Id,
            CustomerName = customers[0].Name, CustomerPhone = customers[0].PhoneNumber,
            Status = OrderStatus.Delivered, PaymentStatus = PaymentStatus.Paid,
            SourceChannel = SocialPlatform.WhatsApp, TotalAmount = 3999,
            Notes = "Customer requested gift wrapping.",
            CreatedAt = DateTime.UtcNow.AddDays(-10),
        };
        db.Orders.Add(order1);
        db.OrderItems.Add(new OrderItem { Id = Guid.NewGuid(), TenantId = tenantId, OrderId = order1Id, ProductId = products[1].Id, ProductTitle = products[1].Title, Quantity = 1, UnitPrice = 3999, TotalPrice = 3999, CreatedAt = order1.CreatedAt });
        db.Payments.Add(new Payment { Id = Guid.NewGuid(), TenantId = tenantId, OrderId = order1Id, Amount = 3999, Method = "UPI", ReferenceNumber = "UPI202600001", PaidAt = order1.CreatedAt.AddHours(2), CreatedAt = order1.CreatedAt });

        var order2Id = Guid.NewGuid();
        var order2 = new Order
        {
            Id = order2Id, TenantId = tenantId,
            OrderNumber = "RC-2026-0002",
            CustomerId = customers[1].Id,
            CustomerName = customers[1].Name, CustomerPhone = customers[1].PhoneNumber,
            Status = OrderStatus.Paid, PaymentStatus = PaymentStatus.Paid,
            SourceChannel = SocialPlatform.Instagram, TotalAmount = 5298,
            CreatedAt = DateTime.UtcNow.AddDays(-3),
        };
        db.Orders.Add(order2);
        db.OrderItems.AddRange(
            new OrderItem { Id = Guid.NewGuid(), TenantId = tenantId, OrderId = order2Id, ProductId = products[2].Id, ProductTitle = products[2].Title, Quantity = 2, UnitPrice = 1299, TotalPrice = 2598, CreatedAt = order2.CreatedAt },
            new OrderItem { Id = Guid.NewGuid(), TenantId = tenantId, OrderId = order2Id, ProductId = products[8].Id, ProductTitle = products[8].Title, Quantity = 2, UnitPrice = 1350, TotalPrice = 2700, CreatedAt = order2.CreatedAt }
        );
        db.Payments.Add(new Payment { Id = Guid.NewGuid(), TenantId = tenantId, OrderId = order2Id, Amount = 5298, Method = "Bank Transfer", PaidAt = order2.CreatedAt.AddHours(1), CreatedAt = order2.CreatedAt });

        var order3Id = Guid.NewGuid();
        var order3 = new Order
        {
            Id = order3Id, TenantId = tenantId,
            OrderNumber = "RC-2026-0003",
            CustomerId = customers[4].Id,
            CustomerName = customers[4].Name, CustomerPhone = customers[4].PhoneNumber,
            Status = OrderStatus.New, PaymentStatus = PaymentStatus.Pending,
            SourceChannel = SocialPlatform.WhatsApp, TotalAmount = 7499,
            Notes = "Customer will pay via NEFT. Awaiting confirmation.",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
        };
        db.Orders.Add(order3);
        db.OrderItems.Add(new OrderItem { Id = Guid.NewGuid(), TenantId = tenantId, OrderId = order3Id, ProductId = products[9].Id, ProductTitle = products[9].Title, Quantity = 1, UnitPrice = 7499, TotalPrice = 7499, CreatedAt = order3.CreatedAt });

        // ── Status histories ──────────────────────────────────────────────────
        db.OrderStatusHistories.AddRange(
            new OrderStatusHistory { Id = Guid.NewGuid(), TenantId = tenantId, OrderId = order1Id, FromStatus = OrderStatus.New, ToStatus = OrderStatus.Confirmed, ChangedBy = userId, CreatedAt = order1.CreatedAt.AddHours(1) },
            new OrderStatusHistory { Id = Guid.NewGuid(), TenantId = tenantId, OrderId = order1Id, FromStatus = OrderStatus.Confirmed, ToStatus = OrderStatus.Packed, ChangedBy = userId, CreatedAt = order1.CreatedAt.AddDays(1) },
            new OrderStatusHistory { Id = Guid.NewGuid(), TenantId = tenantId, OrderId = order1Id, FromStatus = OrderStatus.Packed, ToStatus = OrderStatus.Delivered, ChangedBy = userId, CreatedAt = order1.CreatedAt.AddDays(4) }
        );

        await db.SaveChangesAsync();
        logger.LogInformation("Sample data seeded successfully. Login: priya@priyaboutique.in / Demo@1234");
    }
}
