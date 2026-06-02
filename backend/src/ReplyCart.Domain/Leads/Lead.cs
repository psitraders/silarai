using ReplyCart.Domain.Common;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Domain.Leads;

public class Lead : TenantEntity
{
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public SocialPlatform SourceChannel { get; set; }
    public Guid? InterestedProductId { get; set; }
    public string? InquiryNote { get; set; }
    public LeadStatus Status { get; set; } = LeadStatus.NewInquiry;
    public Guid? AssignedUserId { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public string? Tags { get; set; }
    public int Priority { get; set; } = 1;
    public Guid? CustomerId { get; set; }
    public DateTime? LastActivityDate { get; set; }

    public ICollection<LeadNote> Notes { get; set; } = [];
    public ICollection<LeadActivity> Activities { get; set; } = [];
}
