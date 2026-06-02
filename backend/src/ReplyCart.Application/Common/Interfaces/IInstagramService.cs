namespace ReplyCart.Application.Common.Interfaces;

public interface IInstagramService
{
    bool IsConfigured { get; }
    Task SendTextMessageAsync(string toIgScopedId, string message, CancellationToken ct = default);
    Task<Guid?> ResolveTenantByAccountIdAsync(string instagramAccountId, CancellationToken ct = default);
}
