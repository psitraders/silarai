using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[AllowAnonymous]
public class HealthController(AppDbContext db) : ControllerBase
{
    [HttpGet("api/v1/health")]
    public async Task<IActionResult> Health(CancellationToken ct)
    {
        try
        {
            var canConnect = await db.Database.CanConnectAsync(ct);
            if (!canConnect)
                return StatusCode(503, new { status = "unhealthy", db = "cannot connect" });

            // Quick query to verify schema
            var tenantCount = await db.Tenants.IgnoreQueryFilters().CountAsync(ct);
            return Ok(new { status = "healthy", db = "connected", tenants = tenantCount });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { status = "unhealthy", error = ex.GetType().Name, message = ex.Message });
        }
    }
}
