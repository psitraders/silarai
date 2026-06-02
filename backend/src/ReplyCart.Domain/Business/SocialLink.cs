using ReplyCart.Domain.Common;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Domain.Business;

public class SocialLink : TenantEntity
{
    public Guid BusinessId { get; set; }
    public SocialPlatform Platform { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public Business Business { get; set; } = null!;
}
