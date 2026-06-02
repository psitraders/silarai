using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Config;

/// <summary>
/// Single-row global config for the public marketing landing page.
/// Not tenant-scoped — shared across the whole site.
/// </summary>
public class LandingPageConfig : BaseEntity
{
    public string ContentJson { get; set; } = "{}";
}
