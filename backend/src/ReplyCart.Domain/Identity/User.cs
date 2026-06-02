using ReplyCart.Domain.Common;
using ReplyCart.Domain.Tenancy;

namespace ReplyCart.Domain.Identity;

public class User : BaseEntity
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsEmailVerified { get; set; }
    public DateTime? LastLoginAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public ICollection<UserRole> UserRoles { get; set; } = [];
    public ICollection<UserRefreshToken> RefreshTokens { get; set; } = [];
}
