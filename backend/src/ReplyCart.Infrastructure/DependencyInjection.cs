using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Import;
using ReplyCart.Application.Rag;
using ReplyCart.Infrastructure.Ai;
using ReplyCart.Infrastructure.Import;
using ReplyCart.Infrastructure.Persistence;
using ReplyCart.Infrastructure.Services;
using ReplyCart.Infrastructure.Storage;

namespace ReplyCart.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b =>
                {
                    b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                    // Retry transient failures caused by Azure SQL idle disconnects
                    b.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(10),
                        errorNumbersToAdd: null);
                }
            ));

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        services.AddScoped<ITenantContext, TenantContextService>();
        services.AddScoped<ICurrentUser, CurrentUserService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IWhatsAppService, WhatsAppService>();
        services.AddScoped<IInstagramService, InstagramService>();
        services.AddScoped<IFacebookService, FacebookService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IOtpService, TwoFactorOtpService>();
        services.AddScoped<IRazorpayService, RazorpayService>();
        services.AddScoped<IStripeService, StripeService>();
        services.AddScoped<IPayPalService, PayPalService>();
        services.AddScoped<IWhatsAppCatalogService, WhatsAppCatalogService>();
        services.AddScoped<IProductImportService, ProductImportService>();

        // ── Storage ──────────────────────────────────────────────────────────────
        var storageProvider = configuration["Storage:Provider"] ?? "Local";
        if (storageProvider.Equals("Cloudinary", StringComparison.OrdinalIgnoreCase))
            services.AddScoped<IStorageProvider, CloudinaryStorageProvider>();
        else
            services.AddScoped<IStorageProvider, LocalStorageProvider>();

        // ── AI ────────────────────────────────────────────────────────────────────
        var aiProvider = configuration["AI:Provider"] ?? "Mock";
        if (aiProvider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase))
            services.AddScoped<IAiProvider, OpenAiProvider>();
        else
            services.AddScoped<IAiProvider, MockAiProvider>();

        // ── RAG / Autonomous AI ───────────────────────────────────────────────────
        services.AddScoped<RagContextBuilder>();

        // ── Storefront Chatbot — singleton so sessions survive across requests ────
        services.AddSingleton<IConversationMemoryService, ConversationMemoryService>();

        // ── COD e-mail OTP — singleton so OTPs survive across requests ────────
        services.AddSingleton<CodOtpStore>();

        services.AddHttpContextAccessor();
        services.AddHttpClient("WhatsApp");
        services.AddHttpClient("Instagram");
        services.AddHttpClient("Facebook");
        services.AddHttpClient("OpenAI");
        services.AddHttpClient("TwoFactor");
        services.AddHttpClient("Twilio");
        services.AddHttpClient("Razorpay");
        services.AddHttpClient("Stripe");
        services.AddHttpClient("PayPal");
        services.AddHttpClient("WhatsAppCatalog");
        services.AddHttpClient("Cloudflare");

        // ── Custom Domain / Cloudflare for SaaS ──────────────────────────────────
        services.AddScoped<ReplyCart.Application.Common.Interfaces.ICloudflareService,
                           ReplyCart.Infrastructure.Services.CloudflareService>();

        return services;
    }
}
