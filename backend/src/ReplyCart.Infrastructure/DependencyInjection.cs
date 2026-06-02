using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Ai;
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
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)
            ));

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        services.AddScoped<ITenantContext, TenantContextService>();
        services.AddScoped<ICurrentUser, CurrentUserService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IWhatsAppService, WhatsAppService>();
        services.AddScoped<IInstagramService, InstagramService>();
        services.AddScoped<IFacebookService, FacebookService>();

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

        services.AddHttpContextAccessor();
        services.AddHttpClient("WhatsApp");
        services.AddHttpClient("Instagram");
        services.AddHttpClient("Facebook");
        services.AddHttpClient("OpenAI");

        return services;
    }
}
