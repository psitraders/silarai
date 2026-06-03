using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Middleware;

public class TenantResolutionMiddleware(RequestDelegate next, ILogger<TenantResolutionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext, AppDbContext db, IMemoryCache cache)
    {
        var user = context.User;

        if (user.Identity?.IsAuthenticated == true)
        {
            var tenantIdClaim = user.FindFirstValue("tid");

            logger.LogDebug("TenantResolution: authenticated={Auth}, tid={Tid}",
                user.Identity.IsAuthenticated, tenantIdClaim ?? "(null)");

            if (!Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                logger.LogWarning("TenantResolution: missing/invalid tid claim. Path={Path}", context.Request.Path);
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new
                {
                    title = "Unauthorized",
                    status = 401,
                    errors = new[] { "Invalid or missing tenant in token. Please log in again." }
                });
                return;
            }

            var cacheKey = $"tenant:{tenantId}";

            if (!cache.TryGetValue(cacheKey, out string? slug) || string.IsNullOrEmpty(slug))
            {
                var tenant = await db.Tenants.AsNoTracking()
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(t => t.Id == tenantId);

                slug = tenant?.Slug;
                if (!string.IsNullOrEmpty(slug))
                    cache.Set(cacheKey, slug, TimeSpan.FromMinutes(15));
            }

            if (!string.IsNullOrEmpty(slug))
            {
                tenantContext.SetTenant(tenantId, slug);
            }
            else
            {
                logger.LogWarning("TenantResolution: tenant {TenantId} not found in DB. Path={Path}", tenantId, context.Request.Path);
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new
                {
                    title = "Unauthorized",
                    status = 401,
                    errors = new[] { "Session expired or tenant not found. Please log in again." }
                });
                return;
            }
        }
        else
        {
            // Resolve by slug for public routes: /api/v1/public/{slug}/...
            // We look up via StorefrontSettings.Slug (not Tenant.Slug) because the
            // storefront settings page is the canonical source for the public URL slug.
            var path = context.Request.Path.Value;
            if (path != null && path.Contains("/public/"))
            {
                var segments = path.Split('/');
                var publicIndex = Array.IndexOf(segments, "public");
                if (publicIndex >= 0 && publicIndex + 1 < segments.Length)
                {
                    var slug = segments[publicIndex + 1];
                    if (!string.IsNullOrEmpty(slug))
                    {
                        var cacheKey = $"tenant-slug:{slug}";

                        if (!cache.TryGetValue(cacheKey, out Guid tenantId) || tenantId == Guid.Empty)
                        {
                            // Join StorefrontSettings → Tenants so the slug shown to the user
                            // in the settings page is always the source of truth for public URLs.
                            var resolved = await (
                                from s in db.StorefrontSettings.IgnoreQueryFilters().AsNoTracking()
                                join t in db.Tenants.AsNoTracking() on s.TenantId equals t.Id
                                where s.Slug == slug && t.IsActive && !s.IsDeleted
                                select s.TenantId
                            ).FirstOrDefaultAsync();

                            tenantId = resolved;
                            if (tenantId != Guid.Empty)
                                cache.Set(cacheKey, tenantId, TimeSpan.FromMinutes(15));
                        }

                        if (tenantId != Guid.Empty)
                            tenantContext.SetTenant(tenantId, slug);
                    }
                }
            }
        }

        await next(context);
    }
}


