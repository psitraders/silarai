using Microsoft.EntityFrameworkCore;
using ReplyCart.Domain.Admin;
using ReplyCart.Domain.Marketing;
using ReplyCart.Domain.Ai;
using ReplyCart.Domain.Business;
using ReplyCart.Domain.Campaigns;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Config;
using ReplyCart.Domain.Conversation;
using ReplyCart.Domain.Customers;
using ReplyCart.Domain.Identity;
using ReplyCart.Domain.Leads;
using ReplyCart.Domain.Orders;
using ReplyCart.Domain.Storefront;
using ReplyCart.Domain.Tenancy;

namespace ReplyCart.Application.Common.Interfaces;

public interface IAppDbContext
{
    // Tenancy
    DbSet<Tenant> Tenants { get; }
    DbSet<TenantSubscription> TenantSubscriptions { get; }
    DbSet<SubscriptionPlan> SubscriptionPlans { get; }

    // Identity
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<UserRefreshToken> UserRefreshTokens { get; }
    DbSet<UserToken> UserTokens { get; }

    // Business
    DbSet<Domain.Business.Business> Businesses { get; }
    DbSet<StorefrontSettings> StorefrontSettings { get; }
    DbSet<SocialLink> SocialLinks { get; }

    // Catalog
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<ProductVariant> ProductVariants { get; }
    DbSet<ProductTag> ProductTags { get; }
    DbSet<Coupon> Coupons { get; }
    DbSet<ProductReview> ProductReviews { get; }

    // CRM
    DbSet<Customer> Customers { get; }
    DbSet<Lead> Leads { get; }
    DbSet<LeadNote> LeadNotes { get; }
    DbSet<LeadActivity> LeadActivities { get; }

    // Orders
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<Payment> Payments { get; }
    DbSet<OrderStatusHistory> OrderStatusHistories { get; }

    // AI
    DbSet<AiSuggestion> AiSuggestions { get; }
    DbSet<AiUsageLog> AiUsageLogs { get; }
    DbSet<ReplyTemplate> ReplyTemplates { get; }

    // Admin
    DbSet<TenantNote> TenantNotes { get; }
    DbSet<SystemAnnouncement> SystemAnnouncements { get; }
    DbSet<LandingPageConfig> LandingPageConfigs { get; }
    DbSet<PlatformSetting> PlatformSettings { get; }
    DbSet<PlatformLead> PlatformLeads { get; }

    // Marketing
    DbSet<Campaign> Campaigns { get; }
    DbSet<CampaignRecipient> CampaignRecipients { get; }
    DbSet<AbandonedCart> AbandonedCarts { get; }
    DbSet<WaTemplate> WaTemplates { get; }

    // AI Autonomous Features
    DbSet<ConversationSession> ConversationSessions { get; }
    DbSet<AutoCampaign> AutoCampaigns { get; }

    // Storefront Customer (B2C / B2B)
    DbSet<StorefrontCustomer> StorefrontCustomers { get; }
    DbSet<StorefrontWishlistItem> StorefrontWishlistItems { get; }
    DbSet<ProductWholesaleTier> ProductWholesaleTiers { get; }
    DbSet<QuoteRequest> QuoteRequests { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}


