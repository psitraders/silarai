using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Ai;

public class AiUsageLog : TenantEntity
{
    public Guid UserId { get; set; }
    public string RequestType { get; set; } = string.Empty;
    public int TokensUsed { get; set; }
    public string Provider { get; set; } = string.Empty;
    public bool WasSuccessful { get; set; }
}
