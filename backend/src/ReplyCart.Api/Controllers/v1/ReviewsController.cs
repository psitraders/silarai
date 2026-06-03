using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/reviews")]
[Authorize]
public class ReviewsController(AppDbContext db, ITenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? productId, [FromQuery] bool? approved, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var q = db.ProductReviews
            .Include(r => r.Product)
            .Where(r => r.TenantId == tenantId);

        if (productId.HasValue) q = q.Where(r => r.ProductId == productId);
        if (approved.HasValue) q = q.Where(r => r.IsApproved == approved);

        var reviews = await q
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id, r.ProductId, ProductTitle = r.Product.Title,
                r.ReviewerName, r.ReviewerEmail, r.Rating, r.Comment,
                r.IsApproved, r.CreatedAt
            })
            .ToListAsync(ct);
        return Ok(reviews);
    }

    [HttpPut("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        var review = await db.ProductReviews.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (review == null) return NotFound();
        review.IsApproved = true;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, CancellationToken ct)
    {
        var review = await db.ProductReviews.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (review == null) return NotFound();
        review.IsApproved = false;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var review = await db.ProductReviews.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (review == null) return NotFound();
        review.IsDeleted = true;
        review.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}


