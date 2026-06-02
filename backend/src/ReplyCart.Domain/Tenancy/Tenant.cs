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

    public ICollection<User> Users { get; set; } = [];
    public ICollection<TenantSubscription> Subscriptions { get; set; } = [];
}
