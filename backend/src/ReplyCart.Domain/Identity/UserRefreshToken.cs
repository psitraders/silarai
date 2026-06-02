using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Identity;

public class UserRefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public string? RevokedReason { get; set; }
    public string? DeviceInfo { get; set; }

    public User User { get; set; } = null!;
}
