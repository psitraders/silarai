using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Import;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/import")]
[Authorize]
public class ImportController : ControllerBase
{
    private readonly IProductImportService _import;

    public ImportController(IProductImportService import) => _import = import;

    /// <summary>
    /// Fetches products from an external source for preview.
    /// Nothing is saved to the database at this step.
    /// </summary>
    [HttpPost("preview")]
    public async Task<IActionResult> Preview(
        [FromBody] ImportPreviewRequest request,
        CancellationToken ct)
    {
        var result = await _import.PreviewAsync(request, ct);
        return Ok(result);
    }

    /// <summary>
    /// Saves the user-selected products (and optionally categories) into the catalog.
    /// Images are stored as external URLs — the seller can re-upload via the product editor.
    /// </summary>
    [HttpPost("confirm")]
    public async Task<IActionResult> Confirm(
        [FromBody] ImportConfirmRequest request,
        CancellationToken ct)
    {
        if (request.Products.Count == 0)
            return BadRequest(new { error = "No products selected for import." });

        var result = await _import.ConfirmAsync(request, ct);
        return Ok(result);
    }
}


