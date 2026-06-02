using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Business.Commands;
using ReplyCart.Application.Business.Queries;
using ReplyCart.Application.Catalog.Queries;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Conversation.Queries;

namespace ReplyCart.Api.Controllers.v1;

[Authorize]
[ApiController]
[Route("api/v1/business")]
public class BusinessController(IMediator mediator, ITenantContext tenantContext, IWebHostEnvironment env) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
        => Ok(await mediator.Send(new GetBusinessQuery(), ct));

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateBusinessCommand cmd, CancellationToken ct)
    {
        await mediator.Send(cmd, ct);
        return NoContent();
    }

    [HttpGet("storefront")]
    public async Task<IActionResult> GetStorefront(CancellationToken ct)
        => Ok(await mediator.Send(new GetStorefrontSettingsQuery(), ct));

    [HttpPut("storefront")]
    public async Task<IActionResult> UpdateStorefront([FromBody] UpdateStorefrontSettingsCommand cmd, CancellationToken ct)
    {
        await mediator.Send(cmd, ct);
        return NoContent();
    }

    /// <summary>
    /// Upload a logo or banner image for the store.
    /// Query param: type = "logo" | "banner"
    /// Returns: { url: "/uploads/store/{tenantId}/logo.jpg" }
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> UploadStoreImage(
        IFormFile file,
        [FromQuery] string type,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { error = "File size must be under 5 MB." });

        var allowed = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
                              "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml" };
        if (!allowed.Contains(file.ContentType.ToLower()))
            return BadRequest(new { error = "Only JPEG, PNG, WebP, GIF, ICO, or SVG files are allowed." });

        if (type is not ("logo" or "banner" or "favicon"))
            return BadRequest(new { error = "type must be 'logo', 'banner', or 'favicon'." });

        var tenantId = tenantContext.CurrentTenantId;
        var ext      = Path.GetExtension(file.FileName).ToLower();
        if (string.IsNullOrEmpty(ext))
            ext = file.ContentType.Contains("png")  ? ".png"
                : file.ContentType.Contains("webp") ? ".webp"
                : file.ContentType.Contains("svg")  ? ".svg"
                : file.ContentType.Contains("ico")  ? ".ico"
                : ".jpg";

        // Use ContentRootPath + "wwwroot" — WebRootPath can be null in dev
        // when the folder didn't exist at startup.
        var webRoot  = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var dir      = Path.Combine(webRoot, "uploads", "store", tenantId.ToString());
        Directory.CreateDirectory(dir);

        var fileName = $"{type}{ext}";
        var filePath = Path.Combine(dir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream, ct);

        // Always return an absolute URL so the Vercel frontend can load images
        // served from the Azure backend (cross-origin). A root-relative path
        // would resolve against the Vercel domain and 404.
        var relativePath = $"/uploads/store/{tenantId}/{fileName}";
        var absoluteUrl  = $"{Request.Scheme}://{Request.Host}{relativePath}";
        return Ok(new { url = absoluteUrl });
    }

    // ── Autonomous AI Settings ─────────────────────────────────────────────────

    [HttpGet("ai-settings")]
    public async Task<IActionResult> GetAiSettings(CancellationToken ct)
        => Ok(await mediator.Send(new GetAiSettingsQuery(), ct));

    [HttpPut("ai-settings")]
    public async Task<IActionResult> UpdateAiSettings([FromBody] UpdateAiSettingsCommand cmd, CancellationToken ct)
    {
        await mediator.Send(cmd, ct);
        return NoContent();
    }

    // ── Conversation Sessions ─────────────────────────────────────────────────

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? activeOnly = null,
        CancellationToken ct = default)
        => Ok(await mediator.Send(new GetConversationSessionsQuery(page, pageSize, activeOnly), ct));

    // ── Auto-Campaign History ─────────────────────────────────────────────────

    [HttpGet("auto-campaigns")]
    public async Task<IActionResult> GetAutoCampaigns(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await mediator.Send(new GetAutoCampaignsQuery(page, pageSize), ct));

    // ── WhatsApp / Facebook Catalog Import ────────────────────────────────────

    /// <summary>
    /// Preview products available in the Meta catalog — shows which are new vs already imported.
    /// No data is written.
    /// </summary>
    [HttpGet("catalog/import-preview")]
    public async Task<IActionResult> PreviewCatalogImport(CancellationToken ct)
    {
        try
        {
            var result = await mediator.Send(new PreviewCatalogImportQuery(), ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Import selected products from the Meta catalog into ReplyCart.
    /// Pass an empty <c>retailerIds</c> array to import all new products.
    /// </summary>
    [HttpPost("catalog/import")]
    public async Task<IActionResult> ImportFromCatalog(
        [FromBody] ImportFromCatalogRequest req,
        CancellationToken ct)
    {
        try
        {
            var result = await mediator.Send(
                new ImportFromCatalogCommand(req.RetailerIds ?? []), ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public record ImportFromCatalogRequest(IReadOnlyList<string>? RetailerIds);
