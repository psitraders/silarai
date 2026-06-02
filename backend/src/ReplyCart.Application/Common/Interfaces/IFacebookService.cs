namespace ReplyCart.Application.Common.Interfaces;

public interface IFacebookService
{
    bool IsConfigured { get; }
    Task SendTextMessageAsync(string toPageScopedId, string message, CancellationToken ct = default);
    Task<Guid?> ResolveTenantByPageIdAsync(string pageId, CancellationToken ct = default);

    /// <summary>
    /// Creates a Facebook Page post with an optional image.
    /// Returns the new post ID, or null if not configured.
    /// </summary>
    Task<string?> CreatePagePostAsync(string message, string? imageUrl = null, CancellationToken ct = default);
}
