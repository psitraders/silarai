using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Tenancy;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/admin/tenants")]
[Authorize(Roles = "SuperAdmin")]
public class AdminTenantsController(AppDbContext db) : ControllerBase
{
    /// <summary>Paginated list of all tenants (bypasses tenant isolation).</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var query = db.Tenants.IgnoreQueryFilters().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(t =>
                t.Name.ToLower().Contains(s) ||
                t.ContactEmail.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync(ct);

        var tenants = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Slug,
                t.ContactEmail,
                t.ContactPhone,
                t.IsActive,
                t.CreatedAt,
                CurrentPlan = db.TenantSubscriptions
                    .IgnoreQueryFilters()
                    .Where(s => s.TenantId == t.Id)
                    .OrderByDescending(s => s.CreatedAt)
                    .Select(s => new
                    {
                        PlanName = s.Plan.Name,
                        PlanSlug = s.Plan.Slug,
                        Status = s.Status.ToString(),
                        s.EndDate,
                        DaysRemaining = s.EndDate != null
                            ? (int?)Math.Max(0, (int)(s.EndDate.Value - DateTime.UtcNow).TotalDays)
                            : (int?)null,
                    })
                    .FirstOrDefault(),
                ProductCount = db.Products.IgnoreQueryFilters().Count(p => p.TenantId == t.Id && !p.IsDeleted),
                LeadCount = db.Leads.IgnoreQueryFilters().Count(l => l.TenantId == t.Id && !l.IsDeleted),
                OrderCount = db.Orders.IgnoreQueryFilters().Count(o => o.TenantId == t.Id && !o.IsDeleted),
            })
            .ToListAsync(ct);

        return Ok(new { items = tenants, totalCount, page, pageSize });
    }

    /// <summary>Single tenant detail including users and subscription history.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var tenant = await db.Tenants.IgnoreQueryFilters()
            .Where(t => t.Id == id)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Slug,
                t.ContactEmail,
                t.ContactPhone,
                t.IsActive,
                t.CreatedAt,
                CurrentPlan = db.TenantSubscriptions
                    .IgnoreQueryFilters()
                    .Where(s => s.TenantId == t.Id)
                    .OrderByDescending(s => s.CreatedAt)
                    .Select(s => new
                    {
                        PlanName = s.Plan.Name,
                        PlanSlug = s.Plan.Slug,
                        Status = s.Status.ToString(),
                        s.EndDate,
                        DaysRemaining = s.EndDate != null
                            ? (int?)Math.Max(0, (int)(s.EndDate.Value - DateTime.UtcNow).TotalDays)
                            : (int?)null,
                    })
                    .FirstOrDefault(),
                ProductCount = db.Products.IgnoreQueryFilters().Count(p => p.TenantId == t.Id && !p.IsDeleted),
                LeadCount = db.Leads.IgnoreQueryFilters().Count(l => l.TenantId == t.Id && !l.IsDeleted),
                OrderCount = db.Orders.IgnoreQueryFilters().Count(o => o.TenantId == t.Id && !o.IsDeleted),
                Users = db.Users.IgnoreQueryFilters()
                    .Where(u => u.TenantId == t.Id)
                    .Select(u => new { u.Id, u.Name, u.Email, u.IsActive, u.LastLoginAt })
                    .ToList(),
                SubscriptionHistory = db.TenantSubscriptions
                    .IgnoreQueryFilters()
                    .Where(s => s.TenantId == t.Id)
                    .OrderByDescending(s => s.CreatedAt)
                    .Select(s => new
                    {
                        PlanName = s.Plan.Name,
                        Status = s.Status.ToString(),
                        s.StartDate,
                        s.EndDate,
                        s.PricePaid,
                        s.IsAnnual,
                    })
                    .ToList(),
            })
            .FirstOrDefaultAsync(ct);

        if (tenant == null)
            return NotFound(new { errors = new[] { "Tenant not found." } });

        return Ok(tenant);
    }

    /// <summary>Change a tenant's subscription plan and status.</summary>
    [HttpPut("{id:guid}/subscription")]
    public async Task<IActionResult> ChangeSubscription(
        Guid id,
        [FromBody] ChangeSubscriptionRequest req,
        CancellationToken ct)
    {
        var tenant = await db.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id, ct);
        if (tenant == null)
            return NotFound(new { errors = new[] { "Tenant not found." } });

        var plan = await db.SubscriptionPlans.FindAsync([req.PlanId], ct);
        if (plan == null || !plan.IsActive)
            return NotFound(new { errors = new[] { "Plan not found." } });

        // Cancel existing active subscriptions
        var existing = await db.TenantSubscriptions
            .IgnoreQueryFilters()
            .Where(s => s.TenantId == id
                && s.Status != SubscriptionStatus.Cancelled
                && s.Status != SubscriptionStatus.Expired)
            .ToListAsync(ct);

        foreach (var s in existing)
            s.Status = SubscriptionStatus.Cancelled;

        // Create new subscription
        db.TenantSubscriptions.Add(new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = id,
            PlanId = req.PlanId,
            Status = (SubscriptionStatus)req.Status,
            StartDate = DateTime.UtcNow,
            EndDate = req.EndDate,
            IsAnnual = req.IsAnnual,
            PricePaid = req.IsAnnual ? plan.AnnualPrice : plan.MonthlyPrice,
            CreatedAt = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Toggle a tenant's active status.</summary>
    [HttpPut("{id:guid}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(Guid id, CancellationToken ct)
    {
        var tenant = await db.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id, ct);
        if (tenant == null)
            return NotFound(new { errors = new[] { "Tenant not found." } });

        tenant.IsActive = !tenant.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record ChangeSubscriptionRequest(
    Guid PlanId,
    int Status,
    DateTime? EndDate,
    bool IsAnnual,
    string? Note
);
