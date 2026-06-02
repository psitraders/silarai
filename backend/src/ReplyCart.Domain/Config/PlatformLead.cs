using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Config;

/// <summary>
/// A visitor who expressed interest via the landing page chat widget or contact form.
/// Not tenant-scoped — these are potential ReplyCart customers, not store customers.
/// </summary>
public class PlatformLead : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? BusinessType { get; set; }   // e.g. "clothing", "food", "beauty"
    public string? ProductCount { get; set; }   // e.g. "1-10", "11-50", "50+"
    public string? Message { get; set; }
    public string Source { get; set; } = "chatbot"; // chatbot | form
    public string Status { get; set; } = "new";     // new | contacted | converted | closed
    public string? AdminNotes { get; set; }
    public string? IpAddress { get; set; }
    public string? UtmSource { get; set; }
    public string? UtmMedium { get; set; }
    public string? UtmCampaign { get; set; }
}
