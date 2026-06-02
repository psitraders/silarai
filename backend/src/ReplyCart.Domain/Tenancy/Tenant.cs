using ReplyCart.Domain.Common;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Domain.Tenancy;

public class Tenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string? ContactPhone { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsEmailVerified { get; set; }
    public string? Notes { get; set; }

    // ── Custom Domain ─────────────────────────────────────────────────────────
    /// <summary>e.g. "floraved.com" — no https://, no trailing slash</summary>
    public string? CustomDomain { get; set; }
    /// <summary>pending | active | failed</summary>
    public string? CustomDomainStatus { get; set; }
    /// <summary>Cloudflare custom hostname ID — needed to delete the record via API</summary>
    public string? CloudflareHostnameId { get; set; }
    public string? CloudflareWorkerRouteId { get; set; }
    /// <summary>Cloudflare zone ID created for apex-domain sellers (no www). Null for www domains.</summary>
    public string? CloudflareZoneId { get; set; }
    public DateTime? CustomDomainVerifiedAt { get; set; }

    public ICollection<User> Users { get; set; } = [];
    public ICollection<TenantSubscription> Subscriptions { get; set; } = [];
}
