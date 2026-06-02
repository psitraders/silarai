using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Tenancy;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/subscription")]
[Authorize]
public class SubscriptionsController(AppDbContext db, ITenantContext tenantContext) : ControllerBase
{
    /// <summary>Get the current tenant's active subscription + plan details.</summary>
    [HttpGet]
    public async Task<IActionResult> GetCurrent(CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var sub = await db.TenantSubscriptions
            .IgnoreQueryFilters()
            .Include(s => s.Plan)
            .Where(s => s.TenantId == tenantId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(ct);

        var currency = await db.Businesses
            .Where(b => b.TenantId == tenantId)
            .Select(b => b.Currency)
            .FirstOrDefaultAsync(ct) ?? "INR";

        if (sub == null)
        {
            // No subscription yet — return a default "Basic" view
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
                }
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
            }
        });
    }

    /// <summary>
    /// Select / upgrade to a plan.
    /// For now this is a "request" flow — no live payment gateway.
    /// Creates/updates the subscription record with a "Trial" or pending status.
    /// </summary>
    [HttpPost("select/{planId:guid}")]
    public async Task<IActionResult> SelectPlan(Guid planId, [FromBody] SelectPlanRequest req, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        var plan = await db.SubscriptionPlans.FindAsync([planId], ct);
        if (plan == null || !plan.IsActive)
            return NotFound(new { errors = new[] { "Plan not found." } });

        // Cancel existing active subscription
        var existing = await db.TenantSubscriptions
            .IgnoreQueryFilters()
            .Where(s => s.TenantId == tenantId
                && s.Status != SubscriptionStatus.Cancelled
                && s.Status != SubscriptionStatus.Expired)
            .ToListAsync(ct);

        foreach (var s in existing)
            s.Status = SubscriptionStatus.Cancelled;

        // If free plan — just cancel old, no new subscription needed
        if (plan.MonthlyPrice == 0)
        {
            await db.SaveChangesAsync(ct);
            return Ok(new { message = $"Switched to {plan.Name} plan." });
        }

        var newSub = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = planId,
            Status = SubscriptionStatus.Trial,   // Payment gateway would flip this to Active
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(req.IsAnnual ? 365 : 30),
            IsAnnual = req.IsAnnual,
            PricePaid = req.IsAnnual ? plan.AnnualPrice : plan.MonthlyPrice,
            CreatedAt = DateTime.UtcNow,
        };
        db.TenantSubscriptions.Add(newSub);
        await db.SaveChangesAsync(ct);

        return Ok(new
        {
            message = $"Successfully subscribed to {plan.Name} plan! Our team will reach out to activate your subscription.",
            subscriptionId = newSub.Id,
            planName = plan.Name,
            endDate = newSub.EndDate,
        });
    }
}

public record SelectPlanRequest(bool IsAnnual = false);
