using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Catalog.Commands;
using ReplyCart.Application.Catalog.Queries;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[Authorize]
[ApiController]
[Route("api/v1/categories")]
public class CategoriesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await mediator.Send(new GetCategoriesQuery(), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest req, CancellationToken ct)
    {
        var id = await mediator.Send(new CreateCategoryCommand(req.Name, req.Description, req.ImageUrl), ct);
        return CreatedAtAction(nameof(GetAll), new { }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdateCategoryCommand(id, req.Name, req.Description, req.ImageUrl, req.IsActive, req.SortOrder), ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DeleteCategoryCommand(id), ct);
        return NoContent();
    }

    /// <summary>
    /// Upload an image for a category (multipart/form-data, field: "file").
    /// Returns { url } — caller should PATCH/PUT the category with the returned URL.
    /// </summary>
    [HttpPost("{id:guid}/image")]
    public async Task<IActionResult> UploadImage(
        Guid id,
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        [FromServices] IStorageProvider storage,
        CancellationToken ct)
    {
        if (!Request.HasFormContentType)
            return BadRequest(new { errors = new[] { "Request must be multipart/form-data." } });

        var file = Request.Form.Files.GetFile("file");
        if (file == null || file.Length == 0)
            return BadRequest(new { errors = new[] { "No file provided. Use field name \"file\"." } });

        var tenantId = tenantContext.CurrentTenantId;
        var cat = await db.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId, ct);
        if (cat == null) return NotFound();

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        if (!allowedExts.Contains(ext))
            return BadRequest(new { errors = new[] { "Only image files (jpg, png, webp, gif) are allowed." } });

        await using var stream = file.OpenReadStream();
        var url = await storage.UploadAsync(stream, file.FileName, file.ContentType, $"categories/{id}", ct);

        cat.ImageUrl = url;
        await db.SaveChangesAsync(ct);

        return Ok(new { url });
    }
}

public record CreateCategoryRequest(string Name, string? Description, string? ImageUrl);
public record UpdateCategoryRequest(string Name, string? Description, string? ImageUrl, bool IsActive, int SortOrder);


