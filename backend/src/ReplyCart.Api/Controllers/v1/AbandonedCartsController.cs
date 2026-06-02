using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/abandoned-carts")]
[Authorize]
public class AbandonedCartsController(AppDbContext db, ITenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? recovered, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var q = db.AbandonedCarts.Where(a => a.TenantId == tenantId);
        if (recovered.HasValue) q = q.Where(a => a.IsRecovered == recovered);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(a => new
            {
                a.Id, a.CustomerName, a.CustomerPhone, a.CustomerEmail,
                a.CartTotal, a.ItemCount, a.IsRecovered,
                a.LastReminderSentAt, a.CreatedAt,
                CartItems = a.CartItemsJson
            })
            .ToListAsync(ct);

        return Ok(new { items, totalCount = total, page, pageSize, totalPages = (int)Math.Ceiling(total / (double)pageSize) });
    }

    [HttpPut("{id:guid}/mark-recovered")]
    public async Task<IActionResult> MarkRecovered(Guid id, CancellationToken ct)
    {
        var cart = await db.AbandonedCarts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (cart == null) return NotFound();
        cart.IsRecovered = true;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("{id:guid}/reminder-sent")]
    public async Task<IActionResult> MarkReminderSent(Guid id, CancellationToken ct)
    {
        var cart = await db.AbandonedCarts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (cart == null) return NotFound();
        cart.LastReminderSentAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var cart = await db.AbandonedCarts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (cart == null) return NotFound();
        cart.IsDeleted = true;
        cart.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
