namespace ReplyCart.Application.Common.Interfaces;

public interface IFacebookService
{
    bool IsConfigured { get; }
    Task SendTextMessageAsync(string toPageScopedId, string message, CancellationToken ct = default);
    Task<Guid?> ResolveTenantByPageIdAsync(string pageId, CancellationToken ct = default);
}
