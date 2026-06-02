using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Domain.Config;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
public class LandingController(AppDbContext db) : ControllerBase
{
    private static readonly Guid ConfigId = Guid.Parse("00000000-0000-0000-0000-000000000002");

    /// <summary>Returns the current landing page content JSON. Public endpoint.</summary>
    [HttpGet("api/v1/public/landing-content")]
    [AllowAnonymous]
    public async Task<IActionResult> GetContent(CancellationToken ct)
    {
        var config = await db.LandingPageConfigs
            .FirstOrDefaultAsync(c => c.Id == ConfigId, ct);

        if (config is null)
            return Ok(new { contentJson = "{}" });

        return Content(config.ContentJson, "application/json");
    }

    /// <summary>Replaces landing page content. SuperAdmin only.</summary>
    [HttpPut("api/v1/admin/landing-content")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> UpdateContent([FromBody] UpdateLandingContentRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.ContentJson))
            return BadRequest(new { errors = new[] { "ContentJson is required." } });

        // Validate it is valid JSON
        try { System.Text.Json.JsonDocument.Parse(request.ContentJson); }
        catch { return BadRequest(new { errors = new[] { "ContentJson must be valid JSON." } }); }

        var config = await db.LandingPageConfigs
            .FirstOrDefaultAsync(c => c.Id == ConfigId, ct);

        if (config is null)
        {
            config = new LandingPageConfig { Id = ConfigId, ContentJson = request.ContentJson };
            db.LandingPageConfigs.Add(config);
        }
        else
        {
            config.ContentJson = request.ContentJson;
            config.UpdatedAt   = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record UpdateLandingContentRequest(string ContentJson);
