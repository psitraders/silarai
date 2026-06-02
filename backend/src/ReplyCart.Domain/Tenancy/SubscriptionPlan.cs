using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Tenancy;

public class SubscriptionPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }
    public decimal AnnualPrice { get; set; }
    public int MaxProducts { get; set; }
    public int MaxStaffUsers { get; set; }
    public int MaxMonthlyLeads { get; set; }
    public int MaxAiSuggestionsPerMonth { get; set; }
    public bool AllowsCustomBranding { get; set; }
    public bool AllowsAdvancedAnalytics { get; set; }
    public bool AllowsAiSuggestions { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<TenantSubscription> Subscriptions { get; set; } = [];
}
