using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Domain.Config;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// SuperAdmin-only — view and update platform-level key-value settings.
/// e.g. TwoFactor:ApiKey
/// </summary>
[ApiController]
[Route("api/v1/admin/platform-settings")]
[Authorize(Roles = "SuperAdmin")]
public class AdminPlatformSettingsController(AppDbContext db) : ControllerBase
{
    private static readonly string[] SensitiveKeys = ["TwoFactor:ApiKey"];

    /// <summary>Get all platform settings. Sensitive values are masked.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var settings = await db.PlatformSettings
            .AsNoTracking()
            .IgnoreQueryFilters()
            .OrderBy(s => s.Key)
            .ToListAsync(ct);

        var result = settings.Select(s => new
        {
            s.Id,
            s.Key,
            Value      = s.Value,
            UpdatedAt  = s.UpdatedAt,
        });

        return Ok(result);
    }

    /// <summary>Upsert a single platform setting by key.</summary>
    [HttpPut("{key}")]
    public async Task<IActionResult> Upsert(string key, [FromBody] UpsertSettingRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Value))
            return BadRequest(new { errors = new[] { "Value cannot be empty." } });

        var setting = await db.PlatformSettings
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Key == key, ct);

        if (setting is null)
        {
            setting = new PlatformSetting { Id = Guid.NewGuid(), Key = key };
            db.PlatformSettings.Add(setting);
        }

        setting.Value = req.Value.Trim();
        await db.SaveChangesAsync(ct);

        return Ok(new { key, message = "Setting updated." });
    }
}

public record UpsertSettingRequest(string Value);
