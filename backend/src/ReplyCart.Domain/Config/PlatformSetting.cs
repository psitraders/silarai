using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Config;

/// <summary>
/// Platform-wide key-value settings managed by SuperAdmin.
/// Not tenant-scoped — one row per setting key.
/// Example keys: "TwoFactor:ApiKey", "TwoFactor:Provider"
/// </summary>
public class PlatformSetting : BaseEntity
{
    public string Key   { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
