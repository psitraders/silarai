using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Security;

/// <summary>
/// Server-side plan gate: tenants on the Basic (chatbot-only) plan may call
/// only chatbot, subscription and account/shell endpoints. Everything else
/// returns 403 so the sidebar hiding on the frontend is not just cosmetic.
/// SuperAdmin and anonymous/public endpoints are never affected.
/// </summary>
public class BasicPlanAccessFilter(
    AppDbContext db,
    IMemoryCache cache,
    ITenantContext tenantContext) : IAsyncAuthorizationFilter
{
    // API roots a Basic (chatbot-only) tenant is still allowed to use.
    private static readonly string[] AllowedPrefixes =
    [
        "/api/v1/auth",                   // login / profile / password / sessions
        "/api/v1/subscription",           // view + upgrade own plan
        "/api/v1/plans",                  // plan catalogue
        "/api/v1/business",               // app shell (title, language, currency)
        "/api/v1/chatbot-clients",        // tenant chatbot client management
        "/api/v1/admin/chatbot-clients",  // same controller, legacy path used by the UI
        "/api/v1/chatbot-usage",          // token consumption report
        "/api/v1/activity",               // topbar notification feed
        "/api/v1/search",                 // topbar global search
    ];

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var http = context.HttpContext;
        var user = http.User;

        // Public/anonymous endpoints are never gated — even when the browser of a
        // logged-in tenant attaches its Bearer token (e.g. public chatbot widget,
        // public storefront, Meta webhooks).
        var metadata   = context.ActionDescriptor.EndpointMetadata;
        var requiresAuth = metadata.OfType<IAuthorizeData>().Any()
                        && !metadata.OfType<IAllowAnonymous>().Any();
        if (!requiresAuth) return;

        // The platform admin is never gated.
        if (user?.Identity?.IsAuthenticated != true) return;
        if (user.IsInRole("SuperAdmin")) return;
        if (!tenantContext.IsResolved) return;

        var path = http.Request.Path.Value ?? string.Empty;
        if (!path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase)) return;
        if (AllowedPrefixes.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase))) return;

        var tenantId = tenantContext.CurrentTenantId;
        var planSlug = await cache.GetOrCreateAsync($"plan-slug:{tenantId}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2);
            var slug = await db.TenantSubscriptions
                .IgnoreQueryFilters()
                .Where(s => s.TenantId == tenantId
                         && s.Status != SubscriptionStatus.PendingApproval
                         && s.Status != SubscriptionStatus.Cancelled)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => s.Plan.Slug)
                .FirstOrDefaultAsync();
            return slug ?? "basic";   // no subscription → treated as Basic
        });

        if (planSlug == "basic")
        {
            context.Result = new ObjectResult(new
            {
                message = "Your current plan includes the AI chatbot only. Upgrade your plan to unlock the full dashboard.",
                code = "PLAN_CHATBOT_ONLY",
            })
            { StatusCode = StatusCodes.Status403Forbidden };
        }
    }
}
