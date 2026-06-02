using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

public class TenantContextService : ITenantContext
{
    private Guid _currentTenantId;
    private string? _currentTenantSlug;

    public Guid CurrentTenantId => IsResolved
        ? _currentTenantId
        : throw new InvalidOperationException("Tenant context has not been resolved.");

    public string? CurrentTenantSlug => _currentTenantSlug;
    public bool IsResolved { get; private set; }

    public void SetTenant(Guid tenantId, string slug)
    {
        _currentTenantId = tenantId;
        _currentTenantSlug = slug;
        IsResolved = true;
    }
}
