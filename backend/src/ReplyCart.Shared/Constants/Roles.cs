namespace ReplyCart.Shared.Constants;

public static class Roles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string TenantAdmin = "TenantAdmin";

    /// <summary>Invited by a TenantAdmin; same tenant access except managing admins and changing the plan.</summary>
    public const string BusinessAdmin = "BusinessAdmin";
}
