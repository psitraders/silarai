using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Admin;
using ReplyCart.Domain.Marketing;
using ReplyCart.Domain.Ai;
using ReplyCart.Domain.Business;
using ReplyCart.Domain.Campaigns;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Chatbot;
using ReplyCart.Domain.Common;
using ReplyCart.Domain.Config;
using ReplyCart.Domain.Conversation;
using ReplyCart.Domain.Customers;
using ReplyCart.Domain.Identity;
using ReplyCart.Domain.Leads;
using ReplyCart.Domain.Orders;
using ReplyCart.Domain.Storefront;
using ReplyCart.Domain.Tenancy;

namespace ReplyCart.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    private readonly ITenantContext _tenantContext;
    private readonly ICurrentUser _currentUser;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantContext tenantContext, ICurrentUser currentUser)
        : base(options)
    {
        _tenantContext = tenantContext;
        _currentUser = currentUser;
    }

    // Tenancy
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantSubscription> TenantSubscriptions => Set<TenantSubscription>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();

    // Identity
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<UserRefreshToken> UserRefreshTokens => Set<UserRefreshToken>();
    public DbSet<UserToken> UserTokens => Set<UserToken>();

    // Business
    public DbSet<Domain.Business.Business> Businesses => Set<Domain.Business.Business>();
    public DbSet<StorefrontSettings> StorefrontSettings => Set<StorefrontSettings>();
    public DbSet<SocialLink> SocialLinks => Set<SocialLink>();

    // Catalog
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductTag> ProductTags => Set<ProductTag>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();

    // CRM
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadNote> LeadNotes => Set<LeadNote>();
    public DbSet<LeadActivity> LeadActivities => Set<LeadActivity>();

    // Orders
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();

    // AI
    public DbSet<AiSuggestion> AiSuggestions => Set<AiSuggestion>();
    public DbSet<AiUsageLog> AiUsageLogs => Set<AiUsageLog>();
    public DbSet<ReplyTemplate> ReplyTemplates => Set<ReplyTemplate>();

    // Admin
    public DbSet<TenantNote> TenantNotes => Set<TenantNote>();
    public DbSet<SystemAnnouncement> SystemAnnouncements => Set<SystemAnnouncement>();
    public DbSet<LandingPageConfig> LandingPageConfigs => Set<LandingPageConfig>();
    public DbSet<PlatformSetting> PlatformSettings => Set<PlatformSetting>();
    public DbSet<PlatformLead> PlatformLeads => Set<PlatformLead>();

    // Marketing
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<CampaignRecipient> CampaignRecipients => Set<CampaignRecipient>();
    public DbSet<AbandonedCart> AbandonedCarts => Set<AbandonedCart>();
    public DbSet<WaTemplate> WaTemplates => Set<WaTemplate>();

    // Chatbot-as-a-Service (external clients)
    public DbSet<ChatbotClient>  ChatbotClients  => Set<ChatbotClient>();
    public DbSet<ChatbotProduct> ChatbotProducts => Set<ChatbotProduct>();

    // Custom pages (tenant storefront)
    public DbSet<StorefrontPage> StorefrontPages => Set<StorefrontPage>();

    // AI Autonomous Features
    public DbSet<ConversationSession> ConversationSessions => Set<ConversationSession>();
    public DbSet<AutoCampaign> AutoCampaigns => Set<AutoCampaign>();

    // Storefront Customer (B2C / B2B)
    public DbSet<StorefrontCustomer> StorefrontCustomers => Set<StorefrontCustomer>();
    public DbSet<StorefrontWishlistItem> StorefrontWishlistItems => Set<StorefrontWishlistItem>();
    public DbSet<ProductWholesaleTier> ProductWholesaleTiers => Set<ProductWholesaleTier>();
    public DbSet<QuoteRequest> QuoteRequests => Set<QuoteRequest>();

    // Safe property: returns the current tenant ID, or null if not resolved.
    // EF Core re-evaluates this on the CURRENT DbContext instance at query time
    // because the lambda in ApplyTenantFilter captures 'this'.
    private Guid? TenantFilterId => _tenantContext.IsResolved ? _tenantContext.CurrentTenantId : null;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Global soft-delete + tenant filters for all TenantEntity types.
        // IMPORTANT: Use an instance method so EF Core recognises 'this' as the
        // DbContext and re-evaluates TenantFilterId against the CURRENT instance
        // on every query (not the one captured during OnModelCreating).
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(TenantEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(AppDbContext).GetMethod(nameof(ApplyTenantFilter),
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                    .MakeGenericMethod(entityType.ClrType);
                method.Invoke(this, [modelBuilder]);
            }
        }
    }

    private void ApplyTenantFilter<T>(ModelBuilder builder) where T : TenantEntity
    {
        // EF Core re-evaluates TenantFilterId on the CURRENT DbContext instance per query.
        // When not resolved (public/seeder), TenantFilterId == null → filter is just !IsDeleted.
        // When resolved, TenantFilterId has the tenant GUID → adds tenant isolation.
        builder.Entity<T>().HasQueryFilter(e =>
            !e.IsDeleted && (TenantFilterId == null || e.TenantId == TenantFilterId));
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var userId = _currentUser.UserId;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedBy = userId;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedBy = userId;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
