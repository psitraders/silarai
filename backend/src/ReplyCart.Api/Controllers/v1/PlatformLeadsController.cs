using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Domain.Config;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

// ── Public endpoint — no auth, anyone can submit ─────────────────────────────

[ApiController]
[Route("api/v1/platform-leads")]
public class PlatformLeadsController(AppDbContext db) : ControllerBase
{
    public record SubmitLeadRequest(
        string Name,
        string Email,
        string? Phone,
        string? BusinessType,
        string? ProductCount,
        string? Message,
        string? Source,
        string? UtmSource,
        string? UtmMedium,
        string? UtmCampaign
    );

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitLeadRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { message = "Name and email are required." });

        var email = req.Email.Trim().ToLower();

        // Upsert: create on first submission, enrich existing record on subsequent ones
        var existing = await db.PlatformLeads
            .FirstOrDefaultAsync(l => l.Email == email, ct);

        if (existing is null)
        {
            db.PlatformLeads.Add(new PlatformLead
            {
                Name         = req.Name.Trim(),
                Email        = email,
                Phone        = req.Phone?.Trim(),
                BusinessType = req.BusinessType,
                ProductCount = req.ProductCount,
                Message      = req.Message?.Trim(),
                Source       = req.Source ?? "chatbot",
                Status       = "new",
                IpAddress    = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UtmSource    = req.UtmSource,
                UtmMedium    = req.UtmMedium,
                UtmCampaign  = req.UtmCampaign,
            });
        }
        else
        {
            // Enrich existing lead with any new info (don't downgrade status)
            if (!string.IsNullOrWhiteSpace(req.Phone))        existing.Phone        = req.Phone.Trim();
            if (!string.IsNullOrWhiteSpace(req.BusinessType)) existing.BusinessType = req.BusinessType;
            if (!string.IsNullOrWhiteSpace(req.ProductCount)) existing.ProductCount = req.ProductCount;
            if (!string.IsNullOrWhiteSpace(req.Name))         existing.Name         = req.Name.Trim();
        }

        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Thanks! We'll be in touch soon." });
    }
}

// ── Admin endpoint — SuperAdmin only ─────────────────────────────────────────

[ApiController]
[Route("api/v1/admin/platform-leads")]
[Authorize(Roles = "SuperAdmin")]
public class AdminPlatformLeadsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var query = db.PlatformLeads.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(l => l.Status == status);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(l =>
                l.Name.ToLower().Contains(s) ||
                l.Email.ToLower().Contains(s) ||
                (l.Phone != null && l.Phone.Contains(s)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new {
                l.Id, l.Name, l.Email, l.Phone,
                l.BusinessType, l.ProductCount, l.Message,
                l.Source, l.Status, l.AdminNotes,
                l.UtmSource, l.UtmMedium, l.UtmCampaign,
                l.CreatedAt,
            })
            .ToListAsync(ct);

        return Ok(new { items, total, page, pageSize });
    }

    public record UpdateLeadRequest(string Status, string? AdminNotes);

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLeadRequest req, CancellationToken ct)
    {
        var lead = await db.PlatformLeads.FindAsync([id], ct);
        if (lead is null) return NotFound();

        lead.Status     = req.Status;
        lead.AdminNotes = req.AdminNotes;
        await db.SaveChangesAsync(ct);
        return Ok(new { message = "Updated." });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var lead = await db.PlatformLeads.FindAsync([id], ct);
        if (lead is null) return NotFound();
        db.PlatformLeads.Remove(lead);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // Summary counts for dashboard widget
    [HttpGet("summary")]
    public async Task<IActionResult> Summary(CancellationToken ct)
    {
        var counts = await db.PlatformLeads
            .GroupBy(l => l.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        return Ok(new {
            total     = counts.Sum(c => c.Count),
            newLeads  = counts.FirstOrDefault(c => c.Status == "new")?.Count ?? 0,
            contacted = counts.FirstOrDefault(c => c.Status == "contacted")?.Count ?? 0,
            converted = counts.FirstOrDefault(c => c.Status == "converted")?.Count ?? 0,
        });
    }
}
