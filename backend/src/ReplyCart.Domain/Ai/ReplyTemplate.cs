using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Ai;

public class ReplyTemplate : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ToneMode { get; set; } = "Friendly";
    public bool IsActive { get; set; } = true;
}
