using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Public endpoint — returns all active subscription plans (no auth required).
/// </summary>
[ApiController]
[Route("api/v1/plans")]
public class PlansController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var plans = await db.SubscriptionPlans
            .Where(p => p.IsActive)
            .OrderBy(p => p.SortOrder)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Slug,
                p.Description,
                p.MonthlyPrice,
                p.AnnualPrice,
                p.MaxProducts,
                p.MaxStaffUsers,
                p.MaxMonthlyLeads,
                p.MaxAiSuggestionsPerMonth,
                p.AllowsCustomBranding,
                p.AllowsAdvancedAnalytics,
                p.AllowsAiSuggestions,
                p.SortOrder,
            })
            .ToListAsync(ct);

        return Ok(plans);
    }
}
