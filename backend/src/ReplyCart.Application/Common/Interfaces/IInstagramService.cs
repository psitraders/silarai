namespace ReplyCart.Application.Common.Interfaces;

public interface IInstagramService
{
    bool IsConfigured { get; }
    Task SendTextMessageAsync(string toIgScopedId, string message, CancellationToken ct = default);
    Task<Guid?> ResolveTenantByAccountIdAsync(string instagramAccountId, CancellationToken ct = default);

    /// <summary>
    /// Creates an Instagram media post (photo + caption) on the business account.
    /// Returns the created media/post ID, or null if not configured.
    /// </summary>
    Task<string?> CreatePhotoPostAsync(string imageUrl, string caption, CancellationToken ct = default);
}
