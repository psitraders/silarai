using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Identity;

public enum UserTokenType
{
    EmailVerification = 1,
    PasswordReset = 2,
}

public class UserToken : BaseEntity
{
    public Guid UserId { get; set; }
    public UserTokenType Type { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }

    public User User { get; set; } = null!;
}
