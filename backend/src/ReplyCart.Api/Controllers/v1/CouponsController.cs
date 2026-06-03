using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Enums;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/coupons")]
[Authorize]
public class CouponsController(AppDbContext db, ITenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var coupons = await db.Coupons
            .Where(c => c.TenantId == tenantId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id, c.Code, c.Type, c.Value, c.MinOrderAmount,
                c.MaxUses, c.UsedCount, c.ValidFrom, c.ValidTo,
                c.IsActive, c.BuyQuantity, c.GetQuantity, c.CreatedAt
            })
            .ToListAsync(ct);
        return Ok(coupons);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveCouponRequest req, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        // Ensure code is unique per tenant
        var exists = await db.Coupons.AnyAsync(c => c.TenantId == tenantId && c.Code == req.Code.ToUpperInvariant(), ct);
        if (exists)
            return BadRequest(new { errors = new[] { $"Coupon code '{req.Code}' already exists." } });

        var coupon = new Coupon
        {
            TenantId = tenantId,
            Code = req.Code.ToUpperInvariant().Trim(),
            Type = req.Type,
            Value = req.Value,
            MinOrderAmount = req.MinOrderAmount,
            MaxUses = req.MaxUses,
            ValidFrom = req.ValidFrom,
            ValidTo = req.ValidTo,
            IsActive = req.IsActive,
            BuyQuantity = req.BuyQuantity,
            GetQuantity = req.GetQuantity
        };
        db.Coupons.Add(coupon);
        await db.SaveChangesAsync(ct);
        return Created($"api/v1/coupons/{coupon.Id}", new { coupon.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaveCouponRequest req, CancellationToken ct)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (coupon == null) return NotFound();

        coupon.Code = req.Code.ToUpperInvariant().Trim();
        coupon.Type = req.Type;
        coupon.Value = req.Value;
        coupon.MinOrderAmount = req.MinOrderAmount;
        coupon.MaxUses = req.MaxUses;
        coupon.ValidFrom = req.ValidFrom;
        coupon.ValidTo = req.ValidTo;
        coupon.IsActive = req.IsActive;
        coupon.BuyQuantity = req.BuyQuantity;
        coupon.GetQuantity = req.GetQuantity;

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (coupon == null) return NotFound();
        coupon.IsDeleted = true;
        coupon.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record SaveCouponRequest(
    string Code,
    CouponType Type,
    decimal Value,
    decimal? MinOrderAmount,
    int? MaxUses,
    DateTime? ValidFrom,
    DateTime? ValidTo,
    bool IsActive,
    int? BuyQuantity,
    int? GetQuantity
);


