using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Analytics.Queries;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Api.Services;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/analytics")]
[Authorize]
public class AnalyticsController(IMediator mediator) : ControllerBase
{
    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis([FromQuery] int periodDays = 7, CancellationToken ct = default)
        => Ok(await mediator.Send(new GetDashboardKpisQuery(periodDays), ct));

    [HttpGet("ga4")]
    public async Task<IActionResult> GetGA4Report(
        [FromQuery] string startDate = "7daysAgo",
        [FromQuery] string endDate   = "today",
        [FromServices] GA4AnalyticsService ga4    = null!,
        [FromServices] IAppDbContext        db     = null!,
        [FromServices] ITenantContext        tenant = null!,
        CancellationToken ct = default)
    {
        if (!ga4.IsConfigured)
            return Ok(new
            {
                configured          = false,
                serviceAccountEmail = ga4.PlatformEmail,
                message             = "GA4 platform credentials not configured on this server."
            });

        var settings = await db.StorefrontSettings
            .FirstOrDefaultAsync(s => s.TenantId == tenant.CurrentTenantId, ct);

        if (string.IsNullOrWhiteSpace(settings?.GA4PropertyId))
            return Ok(new
            {
                configured          = false,
                serviceAccountEmail = ga4.PlatformEmail,
                message             = "GA4 Property ID not set. Add it in Storefront Settings → Google Analytics 4."
            });

        try
        {
            var report = await ga4.RunReportAsync(settings.GA4PropertyId, startDate, endDate, ct);
            return Ok(new { configured = true, serviceAccountEmail = ga4.PlatformEmail, report });
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                configured          = false,
                serviceAccountEmail = ga4.PlatformEmail,
                message             = $"GA4 API error: {ex.Message}"
            });
        }
    }
}


