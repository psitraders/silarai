using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReplyCart.Application.Chatbot.Agent;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Import;
using ReplyCart.Application.Rag;
using ReplyCart.Infrastructure.Ai;
using ReplyCart.Infrastructure.Configuration;
using ReplyCart.Infrastructure.Import;
using ReplyCart.Infrastructure.Persistence;
using ReplyCart.Infrastructure.Services;
using ReplyCart.Infrastructure.Services.Chat;
using ReplyCart.Infrastructure.Storage;
using StackExchange.Redis;

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
        // Both providers implement IAiProvider (single-shot, tenant RAG pipeline) and
        // IAgentAiProvider (tool-calling loop, Chatbot-as-a-Service). Registered against
        // both interfaces so a single instance backs either entry point.
        var aiProvider = configuration["AI:Provider"] ?? "Mock";
        if (aiProvider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase))
        {
            services.AddScoped<OpenAiProvider>();
            services.AddScoped<IAiProvider>(sp => sp.GetRequiredService<OpenAiProvider>());
            services.AddScoped<IAgentAiProvider>(sp => sp.GetRequiredService<OpenAiProvider>());
        }
        else
        {
            services.AddScoped<MockAiProvider>();
            services.AddScoped<IAiProvider>(sp => sp.GetRequiredService<MockAiProvider>());
            services.AddScoped<IAgentAiProvider>(sp => sp.GetRequiredService<MockAiProvider>());
        }

        // ── RAG / Autonomous AI ───────────────────────────────────────────────────
        services.AddScoped<RagContextBuilder>();

        // ── Storefront Chatbot — singleton so sessions survive across requests ────
        // Still used by the TENANT storefront chatbot and the tenant channel webhooks.
        // The Chatbot-as-a-Service module uses IChatSessionStore instead (below).
        services.AddSingleton<IConversationMemoryService, ConversationMemoryService>();

        // ── Chatbot-as-a-Service tool-calling agent ──────────────────────────────
        services.AddScoped<ChatbotAgent>();

        // ── Chatbot-as-a-Service session state (Redis + in-memory + SQL) ─────────
        AddChatbotSessionStore(services, configuration);

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
        services.AddHttpClient("Resend");

        // ── Custom Domain / Cloudflare for SaaS ──────────────────────────────────
        services.AddScoped<ReplyCart.Application.Common.Interfaces.ICloudflareService,
                           ReplyCart.Infrastructure.Services.CloudflareService>();

        return services;
    }

    /// <summary>
    /// Wires the Chatbot-as-a-Service session store.
    ///
    /// Registered through explicit factories rather than by type, because the Redis
    /// pieces are optional: the default ServiceProvider does not honour optional
    /// constructor parameters, so "resolve it if present, otherwise null" has to be
    /// expressed here with GetService rather than a default argument.
    ///
    /// With Redis:Enabled=false (the default, and the local-dev default) nothing Redis
    /// is registered at all and the module runs entirely on the in-process store plus
    /// the SQL archive — which is exactly the behaviour it had before, minus the
    /// per-read dictionary scan.
    /// </summary>
    private static void AddChatbotSessionStore(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RedisOptions>(configuration.GetSection(RedisOptions.SectionName));

        var redisOptions = new RedisOptions();
        configuration.GetSection(RedisOptions.SectionName).Bind(redisOptions);

        if (redisOptions.IsConfigured)
        {
            // abortConnect=False, so this never blocks or throws at start-up even if
            // Redis is unreachable — the circuit breaker handles it at call time.
            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("Redis");
                try
                {
                    var mux = ConnectionMultiplexer.Connect(redisOptions.BuildConnectionString());
                    logger.LogInformation("Redis connected for chatbot sessions ({Endpoint}).", redisOptions.Endpoint);
                    return mux;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Redis connection failed at start-up — chatbot sessions will run degraded.");
                    throw;
                }
            });

            services.AddSingleton<RedisChatSessionStore>();
        }

        services.AddSingleton<InMemoryChatSessionStore>();
        services.AddSingleton<SqlChatSessionArchive>();
        services.AddSingleton<IChatSessionArchive>(sp => sp.GetRequiredService<SqlChatSessionArchive>());
        services.AddHostedService<ChatSessionArchiveWorker>();

        services.AddSingleton<IChatSessionStore>(sp => new ResilientChatSessionStore(
            sp.GetRequiredService<InMemoryChatSessionStore>(),
            sp.GetRequiredService<IChatSessionArchive>(),
            sp.GetRequiredService<IOptions<RedisOptions>>(),
            sp.GetRequiredService<ILogger<ResilientChatSessionStore>>(),
            sp.GetService<RedisChatSessionStore>()));

        services.AddSingleton<IChatbotContextCache>(sp => new ChatbotContextCache(
            sp.GetRequiredService<IServiceScopeFactory>(),
            sp.GetRequiredService<IMemoryCache>(),
            sp.GetRequiredService<IOptions<RedisOptions>>(),
            sp.GetRequiredService<ILogger<ChatbotContextCache>>(),
            sp.GetService<IConnectionMultiplexer>()));
    }
}


