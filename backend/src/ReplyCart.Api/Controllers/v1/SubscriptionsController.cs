using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Tenancy;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/subscription")]
[Authorize]
public class SubscriptionsController(
    AppDbContext db,
    ITenantContext tenantContext,
    IEmailService emailService,
    IConfiguration configuration) : ControllerBase
{
    /// <summary>Get the current tenant's active subscription + plan details.</summary>
    [HttpGet]
    public async Task<IActionResult> GetCurrent(CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        // Active/Trial subscription (what the tenant currently has access to)
        var sub = await db.TenantSubscriptions
            .IgnoreQueryFilters()
            .Include(s => s.Plan)
            .Where(s => s.TenantId == tenantId
                     && s.Status != SubscriptionStatus.PendingApproval
                     && s.Status != SubscriptionStatus.Cancelled)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(ct);

        // Any pending request (to show in UI)
        var pending = await db.TenantSubscriptions
            .IgnoreQueryFilters()
            .Include(s => s.Plan)
            .Where(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.PendingApproval)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(ct);

        var currency = await db.Businesses
            .Where(b => b.TenantId == tenantId)
            .Select(b => b.Currency)
            .FirstOrDefaultAsync(ct) ?? "INR";

        if (sub == null)
        {
            // No subscription yet â€” return a default "Basic" view
            var basicPlan = await db.SubscriptionPlans
                .Where(p => p.Slug == "basic" && p.IsActive)
                .FirstOrDefaultAsync(ct);

            return Ok(new
            {
                HasSubscription = false,
                Status = "None",
                PlanName = basicPlan?.Name ?? "Basic",
                PlanSlug = basicPlan?.Slug ?? "basic",
                MonthlyPrice = basicPlan?.MonthlyPrice ?? 0,
                StartDate = (DateTime?)null,
                EndDate = (DateTime?)null,
                IsAnnual = false,
                DaysRemaining = (int?)null,
                IsExpired = false,
                Currency = currency,
                Plan = basicPlan == null ? null : new
                {
                    basicPlan.Id, basicPlan.Name, basicPlan.Slug, basicPlan.MonthlyPrice, basicPlan.AnnualPrice,
                    basicPlan.MaxProducts, basicPlan.MaxStaffUsers, basicPlan.MaxMonthlyLeads,
                    basicPlan.MaxAiSuggestionsPerMonth, basicPlan.AllowsCustomBranding,
                    basicPlan.AllowsAdvancedAnalytics, basicPlan.AllowsAiSuggestions,
                },
                PendingRequest = pending == null ? null : new
                {
                    pending.Id,
                    PlanName = pending.Plan.Name,
                    PlanSlug = pending.Plan.Slug,
                    pending.IsAnnual,
                },
            });
        }

        var daysRemaining = sub.EndDate.HasValue
            ? (int?)Math.Max(0, (sub.EndDate.Value - DateTime.UtcNow).Days)
            : null;

        return Ok(new
        {
            HasSubscription = true,
            SubscriptionId = sub.Id,
            Status = sub.Status.ToString(),
            PlanName = sub.Plan.Name,
            PlanSlug = sub.Plan.Slug,
            MonthlyPrice = sub.Plan.MonthlyPrice,
            sub.StartDate,
            sub.EndDate,
            sub.IsAnnual,
            DaysRemaining = daysRemaining,
            IsExpired = sub.Status == SubscriptionStatus.Expired
                     || (sub.EndDate.HasValue && sub.EndDate.Value < DateTime.UtcNow),
            Currency = currency,
            Plan = new
            {
                sub.Plan.Id, sub.Plan.Name, sub.Plan.Slug,
                sub.Plan.MonthlyPrice, sub.Plan.AnnualPrice,
                sub.Plan.MaxProducts, sub.Plan.MaxStaffUsers, sub.Plan.MaxMonthlyLeads,
                sub.Plan.MaxAiSuggestionsPerMonth, sub.Plan.AllowsCustomBranding,
                sub.Plan.AllowsAdvancedAnalytics, sub.Plan.AllowsAiSuggestions,
            },
            PendingRequest = pending == null ? null : new
            {
                pending.Id,
                PlanName = pending.Plan.Name,
                PlanSlug = pending.Plan.Slug,
                pending.IsAnnual,
            },
        });
    }

    /// <summary>
    /// Request a plan upgrade. Creates a PendingApproval record â€” admin must approve
    /// before features are activated.
    /// </summary>
    [HttpPost("select/{planId:guid}")]
    public async Task<IActionResult> SelectPlan(Guid planId, [FromBody] SelectPlanRequest req, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var plan = await db.SubscriptionPlans.FindAsync([planId], ct);
        if (plan == null || !plan.IsActive)
            return NotFound(new { errors = new[] { "Plan not found." } });

        // If free plan â€” cancel existing and downgrade immediately
        if (plan.MonthlyPrice == 0)
        {
            var toCancel = await db.TenantSubscriptions
                .IgnoreQueryFilters()
                .Where(s => s.TenantId == tenantId
                    && s.Status != SubscriptionStatus.Cancelled
                    && s.Status != SubscriptionStatus.Expired)
                .ToListAsync(ct);

            foreach (var s in toCancel)
                s.Status = SubscriptionStatus.Cancelled;

            await db.SaveChangesAsync(ct);
            return Ok(new { message = $"Switched to {plan.Name} plan." });
        }

        // Check if there's already a pending request for the same plan
        var alreadyPending = await db.TenantSubscriptions
            .IgnoreQueryFilters()
            .AnyAsync(s => s.TenantId == tenantId
                        && s.PlanId == planId
                        && s.Status == SubscriptionStatus.PendingApproval, ct);
        if (alreadyPending)
            return Ok(new
            {
                message = $"Your request for {plan.Name} is already pending admin approval.",
                pending = true,
            });

        // Create pending request (does NOT cancel existing subscription â€” tenant keeps current plan until approved)
        var newSub = new TenantSubscription
        {
            Id        = Guid.NewGuid(),
            TenantId  = tenantId,
            PlanId    = planId,
            Status    = SubscriptionStatus.PendingApproval,
            StartDate = DateTime.UtcNow,
            EndDate   = null,   // set by admin on approval
            IsAnnual  = req.IsAnnual,
            PricePaid = req.IsAnnual ? plan.AnnualPrice : plan.MonthlyPrice,
            CreatedAt = DateTime.UtcNow,
        };
        db.TenantSubscriptions.Add(newSub);
        await db.SaveChangesAsync(ct);

        // â”€â”€ Fire admin notification (email + no-op if SMTP not configured) â”€â”€â”€â”€
        _ = Task.Run(async () =>
        {
            try
            {
                var tenant = await db.Tenants.IgnoreQueryFilters()
                    .Where(t => t.Id == tenantId)
                    .Select(t => new { t.Name, t.ContactEmail })
                    .FirstOrDefaultAsync(CancellationToken.None);

                var adminEmail   = configuration["AdminEmail"] ?? "admin@replycart.app";
                var dashboardUrl = (configuration["FrontendUrl"] ?? "https://replycart.app").TrimEnd('/');
                var reviewUrl    = $"{dashboardUrl}/admin/tenants/{tenantId}";

                await emailService.SendUpgradeRequestNotificationAsync(
                    adminEmail:         adminEmail,
                    tenantName:         tenant?.Name         ?? "Unknown Tenant",
                    tenantEmail:        tenant?.ContactEmail ?? "",
                    requestedPlanName:  plan.Name,
                    isAnnual:           req.IsAnnual,
                    pricePaid:          newSub.PricePaid,
                    reviewUrl:          reviewUrl,
                    ct:                 CancellationToken.None);
            }
            catch { /* never fail the tenant's request due to email issues */ }
        });

        return Ok(new
        {
            message = $"Your request for {plan.Name} has been sent! Our team will review and activate it shortly.",
            pending = true,
            subscriptionId = newSub.Id,
            planName = plan.Name,
        });
    }

    // â”€â”€ Admin endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /// <summary>Admin: list all pending plan requests.</summary>
    [HttpGet("admin/pending")]
    public async Task<IActionResult> GetPendingRequests(CancellationToken ct)
    {
        // Simple admin guard â€” in production wire up an admin role claim
        if (!User.IsInRole("Admin") && !IsLocalOrSuperUser())
            return Forbid();

        var pending = await db.TenantSubscriptions
            .IgnoreQueryFilters()
            .Include(s => s.Plan)
            .Where(s => s.Status == SubscriptionStatus.PendingApproval)
            .OrderBy(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id,
                s.TenantId,
                PlanName   = s.Plan.Name,
                PlanSlug   = s.Plan.Slug,
                s.IsAnnual,
                s.PricePaid,
                s.CreatedAt,
            })
            .ToListAsync(ct);

        return Ok(pending);
    }

    /// <summary>Admin: approve a pending plan request â†’ activates it.</summary>
    [HttpPost("admin/approve/{subscriptionId:guid}")]
    public async Task<IActionResult> ApprovePlan(Guid subscriptionId, CancellationToken ct)
    {
        if (!User.IsInRole("Admin") && !IsLocalOrSuperUser())
            return Forbid();

        var sub = await db.TenantSubscriptions
            .IgnoreQueryFilters()
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId, ct);

        if (sub == null) return NotFound();
        if (sub.Status != SubscriptionStatus.PendingApproval)
            return BadRequest(new { error = "Subscription is not pending approval." });

        // Cancel existing active/trial subscriptions for this tenant
        var existing = await db.TenantSubscriptions
            .IgnoreQueryFilters()
            .Where(s => s.TenantId == sub.TenantId
                     && s.Id != sub.Id
                     && s.Status != SubscriptionStatus.Cancelled
                     && s.Status != SubscriptionStatus.Expired
                     && s.Status != SubscriptionStatus.PendingApproval)
            .ToListAsync(ct);

        foreach (var s in existing)
            s.Status = SubscriptionStatus.Cancelled;

        sub.Status    = SubscriptionStatus.Active;
        sub.StartDate = DateTime.UtcNow;
        sub.EndDate   = DateTime.UtcNow.AddDays(sub.IsAnnual ? 365 : 30);

        await db.SaveChangesAsync(ct);
        return Ok(new { message = $"Plan {sub.Plan.Name} activated for tenant {sub.TenantId}." });
    }

    /// <summary>Admin: reject a pending plan request.</summary>
    [HttpPost("admin/reject/{subscriptionId:guid}")]
    public async Task<IActionResult> RejectPlan(Guid subscriptionId, CancellationToken ct)
    {
        if (!User.IsInRole("Admin") && !IsLocalOrSuperUser())
            return Forbid();

        var sub = await db.TenantSubscriptions
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == subscriptionId, ct);

        if (sub == null) return NotFound();

        sub.Status = SubscriptionStatus.Cancelled;
        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Plan request rejected." });
    }

    private bool IsLocalOrSuperUser()
    {
        // Temporary: allow requests that carry the super-user email claim
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "";
        return email == "dhavalpoojara@gmail.com";
    }
}

public record SelectPlanRequest(bool IsAnnual = false);


