namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// Abstracts the Meta Commerce Manager Catalog Batch API call
/// so the Application layer stays free of HttpClient / infrastructure concerns.
/// </summary>
public interface IWhatsAppCatalogService
{
    /// <summary>
    /// Pushes the given product items to the specified WhatsApp / Facebook Catalog.
    /// Throws <see cref="InvalidOperationException"/> on API failure.
    /// </summary>
    Task SyncItemsAsync(
        string   catalogId,
        string   accessToken,
        IReadOnlyList<WhatsAppCatalogItem> items,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Fetches all products from the Meta Catalog (for the import flow).
    /// Returns raw catalog items with price in smallest currency unit (paise/cents).
    /// Handles cursor-based pagination automatically.
    /// </summary>
    Task<IReadOnlyList<WhatsAppCatalogItem>> FetchItemsAsync(
        string   catalogId,
        string   accessToken,
        CancellationToken cancellationToken = default);
}

public record WhatsAppCatalogItem(
    string  RetailerId,
    string  Name,
    string  Description,
    long    PricePaise,     // smallest currency unit (paise for INR)
    string  Currency,
    string  ImageUrl,
    string  ProductUrl,
    bool    InStock,
    string  Brand
);
