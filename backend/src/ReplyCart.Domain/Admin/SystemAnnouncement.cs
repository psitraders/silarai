using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Admin;

public class SystemAnnouncement : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
    public string? TargetPlan { get; set; }
    public string AnnouncementType { get; set; } = "Info";
}
