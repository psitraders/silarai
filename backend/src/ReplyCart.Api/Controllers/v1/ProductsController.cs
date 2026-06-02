using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Catalog.Commands;
using ReplyCart.Application.Catalog.Queries;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Enums;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/products")]
[Authorize]
public class ProductsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? search = null,
        [FromQuery] ProductStatus? status = null,
        CancellationToken ct = default)
        => Ok(await mediator.Send(new GetProductsQuery(page, pageSize, categoryId, search, status), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await mediator.Send(new GetProductByIdQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        var variantDtos = request.Variants?.Select(v => new SaveVariantDto(v.Name, v.Value, v.PriceAdjustment, v.StockQuantity, v.IsAvailable));
        var id = await mediator.Send(new CreateProductCommand(
            request.Title, request.Description, request.Sku, request.CategoryId,
            request.BasePrice, request.DiscountedPrice, request.IsFeatured,
            request.StockQuantity, request.Tags, variantDtos, request.Status), ct);
        return Created($"api/v1/products/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        var variantDtos = request.Variants?.Select(v => new SaveVariantDto(v.Name, v.Value, v.PriceAdjustment, v.StockQuantity, v.IsAvailable));
        await mediator.Send(new UpdateProductCommand(
            id, request.Title, request.Description, request.BasePrice, request.DiscountedPrice,
            request.Status, request.IsFeatured, request.StockQuantity,
            request.CategoryId, request.Attributes, request.Tags, variantDtos), ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DeleteProductCommand(id), ct);
        return NoContent();
    }

    // ── Image management (Cloudinary) ─────────────────────────────────────────

    /// <summary>Upload a product image via Cloudinary (multipart/form-data, field name: "file").</summary>
    [HttpPost("{id:guid}/images")]
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

        var exists = await db.Products.AnyAsync(p => p.Id == id, ct);
        if (!exists) return NotFound();

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        if (!allowedExts.Contains(ext))
            return BadRequest(new { errors = new[] { "Only image files (jpg, png, webp, gif) are allowed." } });

        // Upload to Cloudinary
        await using var stream = file.OpenReadStream();
        var url = await storage.UploadAsync(stream, file.FileName, file.ContentType, $"products/{id}", ct);

        // First image for this product becomes the primary
        var imageCount = await db.ProductImages.CountAsync(i => i.ProductId == id, ct);

        var image = new ProductImage
        {
            TenantId  = tenantContext.CurrentTenantId,
            ProductId = id,
            Url       = url,
            IsPrimary = imageCount == 0,
            SortOrder = imageCount,
        };
        db.ProductImages.Add(image);
        await db.SaveChangesAsync(ct);

        return Ok(new { id = image.Id, url, isPrimary = image.IsPrimary, sortOrder = image.SortOrder });
    }

    /// <summary>Set an image as the primary image for a product.</summary>
    [HttpPut("{id:guid}/images/{imageId:guid}/primary")]
    public async Task<IActionResult> SetPrimaryImage(
        Guid id, Guid imageId,
        [FromServices] AppDbContext db,
        CancellationToken ct)
    {
        var images = await db.ProductImages.Where(i => i.ProductId == id).ToListAsync(ct);
        if (!images.Any()) return NotFound();

        foreach (var img in images)
            img.IsPrimary = img.Id == imageId;

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Delete a product image from Cloudinary and the database.</summary>
    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> DeleteImage(
        Guid id, Guid imageId,
        [FromServices] AppDbContext db,
        [FromServices] IStorageProvider storage,
        CancellationToken ct)
    {
        var image = await db.ProductImages
            .FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == id, ct);

        if (image == null) return NotFound();

        // Delete from Cloudinary (best-effort)
        await storage.DeleteAsync(image.Url, ct);

        db.ProductImages.Remove(image);
        await db.SaveChangesAsync(ct);

        // If we deleted the primary, promote the next image
        if (image.IsPrimary)
        {
            var next = await db.ProductImages
                .Where(i => i.ProductId == id)
                .OrderBy(i => i.SortOrder)
                .FirstOrDefaultAsync(ct);
            if (next != null)
            {
                next.IsPrimary = true;
                await db.SaveChangesAsync(ct);
            }
        }

        return NoContent();
    }
}

public record VariantRequest(string Name, string Value, decimal? PriceAdjustment, int? StockQuantity, bool IsAvailable = true);

public record CreateProductRequest(
    string Title, string? Description, string? Sku, Guid? CategoryId,
    decimal BasePrice, decimal? DiscountedPrice, bool IsFeatured,
    int? StockQuantity, IEnumerable<string>? Tags,
    IEnumerable<VariantRequest>? Variants = null,
    ProductStatus Status = ProductStatus.Draft);

public record UpdateProductRequest(
    string Title, string? Description, decimal BasePrice, decimal? DiscountedPrice,
    ProductStatus Status, bool IsFeatured, int? StockQuantity,
    Guid? CategoryId, string? Attributes, List<string> Tags,
    IEnumerable<VariantRequest>? Variants = null);
