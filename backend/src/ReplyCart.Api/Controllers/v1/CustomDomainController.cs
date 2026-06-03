using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/storefront/custom-domain")]
[Authorize]
public class CustomDomainController(
    AppDbContext db,
    ITenantContext tenantContext,
    ICloudflareService cloudflare) : ControllerBase
{
    private const string CnameTarget = "cname.silarai.app";

    // ── GET ───────────────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var tenant = await db.Tenants.FindAsync([tenantContext.CurrentTenantId], ct);
        if (tenant == null) return NotFound();

        // Auto-refresh pending SaaS hostname status
        if (tenant.CustomDomainStatus == "pending" && tenant.CloudflareHostnameId != null)
        {
            try
            {
                var cf = await cloudflare.GetHostnameStatusAsync(tenant.CloudflareHostnameId, ct);
                if (cf != null && cf.Status == "active" && cf.SslStatus == "active")
                {
                    tenant.CustomDomainStatus     = "active";
                    tenant.CustomDomainVerifiedAt = DateTime.UtcNow;
                    await db.SaveChangesAsync(ct);
                }
            }
            catch { /* non-fatal */ }
        }

        if (string.IsNullOrEmpty(tenant.CustomDomain))
            return Ok(new { hasDomain = false });

        bool isApex = !tenant.CustomDomain.StartsWith("www.");
        return Ok(new
        {
            hasDomain   = true,
            domain      = tenant.CustomDomain,
            status      = tenant.CustomDomainStatus,
            setupType   = isApex ? "apex" : "www",
            verifiedAt  = tenant.CustomDomainVerifiedAt,
            cnameTarget = CnameTarget,
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<bool> HasCustomDomainAccess(CancellationToken ct)
    {
        return await db.TenantSubscriptions
            .AnyAsync(s => s.TenantId == tenantContext.CurrentTenantId
                        && (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Trial)
                        && (s.Plan.Slug == "pro" || s.Plan.Slug == "professional"), ct);
    }

    // ── PUT ───────────────────────────────────────────────────────────────────

    [HttpPut]
    public async Task<IActionResult> Save([FromBody] SaveCustomDomainRequest request, CancellationToken ct)
    {
        if (!await HasCustomDomainAccess(ct))
            return StatusCode(403, new { error = "Custom domain is available on Pro and Professional plans only." });

        var raw = request.Domain?.Trim() ?? "";

        // Strip protocol prefix if user pasted a full URL
        if (raw.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            raw = raw[8..];
        else if (raw.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
            raw = raw[7..];

        // Strip path, query string, trailing slashes
        var slashIdx = raw.IndexOf('/');
        if (slashIdx >= 0) raw = raw[..slashIdx];

        var domain = raw.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(domain))
            return BadRequest(new { error = "Domain is required." });

        // Validate: only letters, digits, dots and hyphens; must have at least one dot
        if (!System.Text.RegularExpressions.Regex.IsMatch(domain, @"^[a-z0-9]([a-z0-9\-\.]*[a-z0-9])?$")
            || !domain.Contains('.')
            || domain.Length < 4)
            return BadRequest(new { error = "Enter a valid domain e.g. floraved.com or store.floraved.com" });

        var conflict = await db.Tenants
            .AnyAsync(t => t.CustomDomain == domain && t.Id != tenantContext.CurrentTenantId, ct);
        if (conflict)
            return Conflict(new { error = "This domain is already registered with another store." });

        var tenant = await db.Tenants.FindAsync([tenantContext.CurrentTenantId], ct);
        if (tenant == null) return NotFound();

        // Clean up old Cloudflare resources if domain changed
        if (tenant.CustomDomain != null && tenant.CustomDomain != domain)
        {
            if (!string.IsNullOrEmpty(tenant.CloudflareHostnameId))
                try { await cloudflare.DeleteCustomHostnameAsync(tenant.CloudflareHostnameId, ct); } catch { }

            if (!string.IsNullOrEmpty(tenant.CloudflareWorkerRouteId))
                try { await cloudflare.DeleteWorkerRouteAsync(tenant.CloudflareWorkerRouteId, ct); } catch { }

            tenant.CloudflareHostnameId    = null;
            tenant.CloudflareWorkerRouteId = null;
            tenant.CloudflareZoneId        = null;
        }

        try
        {
            var result  = await cloudflare.CreateCustomHostnameAsync(domain, ct);
            var routeId = await cloudflare.AddWorkerRouteAsync(domain, ct);

            tenant.CustomDomain            = domain;
            tenant.CustomDomainStatus      = "pending";
            tenant.CloudflareHostnameId    = result.Id;
            tenant.CloudflareWorkerRouteId = routeId;
            tenant.CustomDomainVerifiedAt  = null;

            await db.SaveChangesAsync(ct);

            bool isApex = !domain.StartsWith("www.");
            return Ok(new
            {
                domain,
                setupType   = isApex ? "apex" : "www",
                status      = "pending",
                cnameTarget = CnameTarget,
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Failed to register with Cloudflare: {ex.Message}" });
        }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    [HttpDelete]
    public async Task<IActionResult> Remove(CancellationToken ct)
    {
        var tenant = await db.Tenants.FindAsync([tenantContext.CurrentTenantId], ct);
        if (tenant == null) return NotFound();

        if (!string.IsNullOrEmpty(tenant.CloudflareHostnameId))
            try { await cloudflare.DeleteCustomHostnameAsync(tenant.CloudflareHostnameId, ct); } catch { }

        if (!string.IsNullOrEmpty(tenant.CloudflareWorkerRouteId))
            try { await cloudflare.DeleteWorkerRouteAsync(tenant.CloudflareWorkerRouteId, ct); } catch { }

        tenant.CustomDomain              = null;
        tenant.CustomDomainStatus        = null;
        tenant.CloudflareHostnameId      = null;
        tenant.CloudflareWorkerRouteId   = null;
        tenant.CloudflareZoneId          = null;
        tenant.CustomDomainVerifiedAt    = null;

        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Custom domain removed." });
    }

    // ── POST /refresh ─────────────────────────────────────────────────────────

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshStatus(CancellationToken ct)
    {
        var tenant = await db.Tenants.FindAsync([tenantContext.CurrentTenantId], ct);
        if (tenant == null || string.IsNullOrEmpty(tenant.CloudflareHostnameId))
            return BadRequest(new { error = "No custom domain registered." });

        var cf = await cloudflare.GetHostnameStatusAsync(tenant.CloudflareHostnameId, ct);
        if (cf == null)
            return Ok(new { status = "pending", message = "Could not reach Cloudflare." });

        if (cf.Status == "active" && cf.SslStatus == "active")
        {
            tenant.CustomDomainStatus     = "active";
            tenant.CustomDomainVerifiedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }

        return Ok(new
        {
            status    = cf.Status,
            sslStatus = cf.SslStatus,
            isActive  = cf.Status == "active" && cf.SslStatus == "active",
        });
    }
}

public record SaveCustomDomainRequest(string? Domain);


