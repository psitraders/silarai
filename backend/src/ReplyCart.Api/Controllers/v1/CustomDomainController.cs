using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
    ICloudflareService cloudflare,
    ILogger<CustomDomainController> logger,
    IHttpClientFactory httpClientFactory) : ControllerBase
{
    private const string CnameTarget = "cname.silarai.com";

    // ── GET ───────────────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var tenant = await db.Tenants.FindAsync([tenantContext.CurrentTenantId], ct);
        if (tenant == null) return NotFound();

        // Auto-verify by checking DNS if status is pending
        if (tenant.CustomDomainStatus == "pending" && !string.IsNullOrEmpty(tenant.CustomDomain))
        {
            try
            {
                var verified = await VerifyDnsAsync(tenant.CustomDomain, ct);
                if (verified)
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

    // ── PUT ───────────────────────────────────────────────────────────────────

    [HttpPut]
    public async Task<IActionResult> Save([FromBody] SaveCustomDomainRequest request, CancellationToken ct)
    {
        if (!await HasCustomDomainAccess(ct))
            return StatusCode(403, new { error = "Custom domain is available on Pro and Professional plans only." });

        var raw = request.Domain?.Trim() ?? "";

        // Strip protocol prefix
        if (raw.StartsWith("https://", StringComparison.OrdinalIgnoreCase)) raw = raw[8..];
        else if (raw.StartsWith("http://", StringComparison.OrdinalIgnoreCase)) raw = raw[7..];

        // Strip path, query string, trailing slashes
        var slashIdx = raw.IndexOf('/');
        if (slashIdx >= 0) raw = raw[..slashIdx];

        var domain = raw.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(domain))
            return BadRequest(new { error = "Domain is required." });

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

        // Clean up old Cloudflare records if domain is changing
        if (!string.IsNullOrEmpty(tenant.CloudflareHostnameId) && tenant.CustomDomain != domain)
        {
            try { await cloudflare.DeleteCustomHostnameAsync(tenant.CloudflareHostnameId, ct); } catch (Exception ex) { logger.LogWarning(ex, "Failed to delete old Cloudflare hostname {Id}", tenant.CloudflareHostnameId); }
        }
        if (!string.IsNullOrEmpty(tenant.CloudflareWorkerRouteId) && tenant.CustomDomain != domain)
        {
            try { await cloudflare.DeleteWorkerRouteAsync(tenant.CloudflareWorkerRouteId, ct); } catch (Exception ex) { logger.LogWarning(ex, "Failed to delete old Worker route {Id}", tenant.CloudflareWorkerRouteId); }
        }

        // Register Custom Hostname + Worker route in Cloudflare automatically
        string? cfHostnameId = null;
        string? cfRouteId = null;
        try
        {
            var cfResult = await cloudflare.CreateCustomHostnameAsync(domain, ct);
            cfHostnameId = cfResult.Id;
            logger.LogInformation("Cloudflare Custom Hostname created for {Domain}: {Id}", domain, cfHostnameId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create Cloudflare Custom Hostname for {Domain}", domain);
            // Non-fatal: domain is saved, merchant can retry
        }

        try
        {
            cfRouteId = await cloudflare.AddWorkerRouteAsync(domain, ct);
            logger.LogInformation("Cloudflare Worker route added for {Domain}: {Id}", domain, cfRouteId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to add Cloudflare Worker route for {Domain}", domain);
            // Non-fatal
        }

        tenant.CustomDomain            = domain;
        tenant.CustomDomainStatus      = "pending";
        tenant.CustomDomainVerifiedAt  = null;
        tenant.CloudflareHostnameId    = cfHostnameId ?? tenant.CloudflareHostnameId;
        tenant.CloudflareWorkerRouteId = cfRouteId    ?? tenant.CloudflareWorkerRouteId;
        tenant.CloudflareZoneId        = null;

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

    // ── DELETE ────────────────────────────────────────────────────────────────

    [HttpDelete]
    public async Task<IActionResult> Remove(CancellationToken ct)
    {
        var tenant = await db.Tenants.FindAsync([tenantContext.CurrentTenantId], ct);
        if (tenant == null) return NotFound();

        // Clean up Cloudflare automatically
        if (!string.IsNullOrEmpty(tenant.CloudflareHostnameId))
        {
            try { await cloudflare.DeleteCustomHostnameAsync(tenant.CloudflareHostnameId, ct); }
            catch (Exception ex) { logger.LogWarning(ex, "Failed to delete Cloudflare hostname {Id}", tenant.CloudflareHostnameId); }
        }
        if (!string.IsNullOrEmpty(tenant.CloudflareWorkerRouteId))
        {
            try { await cloudflare.DeleteWorkerRouteAsync(tenant.CloudflareWorkerRouteId, ct); }
            catch (Exception ex) { logger.LogWarning(ex, "Failed to delete Worker route {Id}", tenant.CloudflareWorkerRouteId); }
        }

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
        if (tenant == null || string.IsNullOrEmpty(tenant.CustomDomain))
            return BadRequest(new { error = "No custom domain registered." });

        var verified = await VerifyDnsAsync(tenant.CustomDomain, ct);

        if (verified)
        {
            tenant.CustomDomainStatus     = "active";
            tenant.CustomDomainVerifiedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }

        return Ok(new
        {
            status   = verified ? "active" : "pending",
            isActive = verified,
            message  = verified
                ? "Domain is verified and active!"
                : "DNS not yet propagated. Make sure your CNAME record points to " + CnameTarget,
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

    private async Task<bool> VerifyDnsAsync(string domain, CancellationToken ct)
    {
        try
        {
            // Use Cloudflare's DNS over HTTPS to check CNAME
            var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Accept", "application/dns-json");
            var url = $"https://cloudflare-dns.com/dns-query?name={domain}&type=CNAME";
            var response = await client.GetStringAsync(url, ct);
            return response.Contains(CnameTarget, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }
}

public record SaveCustomDomainRequest(string? Domain);
