namespace ReplyCart.Application.Common.Interfaces;

public record CloudflareHostnameResult(
    string Id,
    string Hostname,
    string Status,          // "pending" | "active" | "moved" | "blocked"
    string SslStatus,       // "pending_validation" | "active" | "error"
    string? TxtName,        // TXT record name for SSL validation (if applicable)
    string? TxtValue);      // TXT record value for SSL validation

/// <summary>Result of creating a Cloudflare zone for an apex domain.</summary>
public record CloudflareZoneResult(
    string Id,
    string[] Nameservers,   // e.g. ["aria.ns.cloudflare.com", "brad.ns.cloudflare.com"]
    string Status);         // "pending" | "active"

public interface ICloudflareService
{
    /// <summary>Register a custom hostname with Cloudflare for SaaS. Returns the hostname record.</summary>
    Task<CloudflareHostnameResult> CreateCustomHostnameAsync(string domain, CancellationToken ct = default);

    /// <summary>Get current status of a registered custom hostname.</summary>
    Task<CloudflareHostnameResult?> GetHostnameStatusAsync(string hostnameId, CancellationToken ct = default);

    /// <summary>Remove a custom hostname from Cloudflare for SaaS.</summary>
    Task DeleteCustomHostnameAsync(string hostnameId, CancellationToken ct = default);

    /// <summary>Add a Worker route for a custom domain so the storefront proxy intercepts traffic.</summary>
    Task<string?> AddWorkerRouteAsync(string domain, CancellationToken ct = default);

    /// <summary>Delete a Worker route by route ID.</summary>
    Task DeleteWorkerRouteAsync(string routeId, CancellationToken ct = default);

    // ── Zone management (apex domains) ───────────────────────────────────────

    /// <summary>
    /// Create a new Cloudflare zone for a seller's apex domain in our account.
    /// Returns zone ID and the nameservers the seller must set at their registrar.
    /// </summary>
    Task<CloudflareZoneResult> CreateZoneAsync(string domain, CancellationToken ct = default);

    /// <summary>Get the status of a Cloudflare zone ("pending" | "active").</summary>
    Task<string> GetZoneStatusAsync(string zoneId, CancellationToken ct = default);

    /// <summary>Add a proxied CNAME @ → cname.replycart.app inside a seller zone.</summary>
    Task AddApexCnameAsync(string zoneId, CancellationToken ct = default);

    /// <summary>Delete a Cloudflare zone (when seller removes their apex domain).</summary>
    Task DeleteZoneAsync(string zoneId, CancellationToken ct = default);
}
