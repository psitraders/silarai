namespace ReplyCart.Application.Common.Interfaces;

public interface ITenantContext
{
    Guid CurrentTenantId { get; }
    string? CurrentTenantSlug { get; }
    bool IsResolved { get; }
    void SetTenant(Guid tenantId, string slug);
}
