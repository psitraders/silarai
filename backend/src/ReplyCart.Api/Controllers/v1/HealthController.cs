using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Infrastructure.Persistence;
using StackExchange.Redis;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[AllowAnonymous]
public class HealthController(AppDbContext db, IServiceProvider services) : ControllerBase
{
    [HttpGet("api/v1/health")]
    public async Task<IActionResult> Health(CancellationToken ct)
    {
        // Redis is reported but never fails the health check: the chatbot degrades to
        // its in-process store + SQL archive when Redis is down, so a Redis outage is
        // not an unhealthy app.
        var redis = await RedisStatusAsync();

        try
        {
            var canConnect = await db.Database.CanConnectAsync(ct);
            if (!canConnect)
                return StatusCode(503, new { status = "unhealthy", db = "cannot connect", redis });

            // Quick query to verify schema
            var tenantCount = await db.Tenants.IgnoreQueryFilters().CountAsync(ct);
            return Ok(new { status = "healthy", db = "connected", tenants = tenantCount, redis });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { status = "unhealthy", error = ex.GetType().Name, message = ex.Message, redis });
        }
    }

    private async Task<string> RedisStatusAsync()
    {
        var mux = services.GetService<IConnectionMultiplexer>();
        if (mux == null) return "disabled";

        try
        {
            var pong = await mux.GetDatabase().PingAsync();
            return $"connected ({pong.TotalMilliseconds:F0}ms)";
        }
        catch (Exception ex)
        {
            return $"unreachable ({ex.GetType().Name})";
        }
    }
}
