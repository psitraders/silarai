using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Public endpoint — resolves a custom domain to a store slug.
/// Called by the frontend SPA when it detects it is running on a non-silarai.app hostname.
/// </summary>
[ApiController]
[Route("api/v1/public")]
public class PublicDomainController(AppDbContext db) : ControllerBase
{
    [HttpGet("resolve-domain")]
    public async Task<IActionResult> ResolveDomain([FromQuery] string domain, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(domain))
            return BadRequest(new { error = "domain query parameter is required." });

        // Normalise — keep www if present (stored as-is now)
        domain = domain.Trim().ToLowerInvariant();
        // Also try without www so both forms resolve
        var domainWww    = domain.StartsWith("www.") ? domain : $"www.{domain}";
        var domainNoWww  = domain.StartsWith("www.") ? domain[4..] : domain;

        var tenant = await db.Tenants
            .Where(t => (t.CustomDomain == domain || t.CustomDomain == domainWww || t.CustomDomain == domainNoWww)
                        && t.CustomDomainStatus == "active" && t.IsActive)
            .Select(t => new { t.Slug, t.Name })
            .FirstOrDefaultAsync(ct);

        if (tenant == null)
            return NotFound(new { error = "No active store found for this domain." });

        return Ok(new { slug = tenant.Slug, storeName = tenant.Name });
    }
}

