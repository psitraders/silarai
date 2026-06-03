using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/search")]
[Authorize]
public class SearchController(IAppDbContext db, ITenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new { products = Array.Empty<object>(), customers = Array.Empty<object>(), orders = Array.Empty<object>(), leads = Array.Empty<object>() });

        var tenantId = tenantContext.CurrentTenantId;
        var like     = $"%{q.Trim()}%";

        var products = await db.Products
            .Where(p => p.TenantId == tenantId &&
                        EF.Functions.Like(p.Title, like))
            .OrderByDescending(p => p.CreatedAt)
            .Take(5)
            .Select(p => new
            {
                id       = p.Id,
                title    = p.Title,
                subtitle = $"₹{p.BasePrice:N0}",
                badge    = p.Status,
            })
            .ToListAsync(ct);

        var customers = await db.Customers
            .Where(c => c.TenantId == tenantId && (
                EF.Functions.Like(c.Name, like) ||
                EF.Functions.Like(c.PhoneNumber, like) ||
                (c.Email != null && EF.Functions.Like(c.Email, like))))
            .OrderByDescending(c => c.CreatedAt)
            .Take(5)
            .Select(c => new
            {
                id       = c.Id,
                title    = c.Name,
                subtitle = c.PhoneNumber,
                badge    = (string?)null,
            })
            .ToListAsync(ct);

        var orders = await db.Orders
            .Where(o => o.TenantId == tenantId && (
                EF.Functions.Like(o.OrderNumber, like) ||
                (o.CustomerName != null && EF.Functions.Like(o.CustomerName, like)) ||
                (o.CustomerPhone != null && EF.Functions.Like(o.CustomerPhone, like))))
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new
            {
                id       = o.Id,
                title    = $"#{o.OrderNumber}",
                subtitle = o.CustomerName ?? o.CustomerPhone,
                badge    = o.Status,
            })
            .ToListAsync(ct);

        var leads = await db.Leads
            .Where(l => l.TenantId == tenantId && (
                EF.Functions.Like(l.CustomerName, like) ||
                (l.CustomerPhone != null && EF.Functions.Like(l.CustomerPhone, like))))
            .OrderByDescending(l => l.CreatedAt)
            .Take(5)
            .Select(l => new
            {
                id       = l.Id,
                title    = l.CustomerName,
                subtitle = l.CustomerPhone,
                badge    = l.Status,
            })
            .ToListAsync(ct);

        return Ok(new { products, customers, orders, leads });
    }
}


