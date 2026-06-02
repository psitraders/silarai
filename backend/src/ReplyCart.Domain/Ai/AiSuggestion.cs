using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Ai;

public class AiSuggestion : TenantEntity
{
    public Guid? LeadId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string SuggestedReply { get; set; } = string.Empty;
    public string ToneMode { get; set; } = "Friendly";
    public string Provider { get; set; } = string.Empty;
    public string? Channel { get; set; }
    public bool WasUsed { get; set; }
    public bool WasEdited { get; set; }
}
