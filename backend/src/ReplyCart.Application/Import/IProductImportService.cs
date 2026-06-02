namespace ReplyCart.Application.Import;

public interface IProductImportService
{
    /// <summary>Fetches products from the external source. Nothing is saved to the DB.</summary>
    Task<ImportPreviewResponse> PreviewAsync(ImportPreviewRequest request, CancellationToken ct = default);

    /// <summary>Saves the selected products (and optionally categories) into the tenant catalog.</summary>
    Task<ImportConfirmResponse> ConfirmAsync(ImportConfirmRequest request, CancellationToken ct = default);
}
