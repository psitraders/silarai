using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// AI token consumption reports for chatbot clients.
/// Tenants see usage for the clients they own; SuperAdmin sees a per-tenant
/// breakdown across the whole platform.
/// </summary>
[ApiController]
[Route("api/v1/chatbot-usage")]
[Authorize]
public class ChatbotUsageController(
    AppDbContext db,
    ITenantContext tenantContext) : ControllerBase
{
    /// <summary>Tenant view: token usage for the caller's own chatbot clients.</summary>
    [HttpGet]
    public async Task<IActionResult> GetMyUsage([FromQuery] int days = 30, CancellationToken ct = default)
    {
        days = Math.Clamp(days, 1, 365);
        var since = DateTime.UtcNow.Date.AddDays(-(days - 1));
        if (!tenantContext.IsResolved)
            return Forbid();
        var tenantId = tenantContext.CurrentTenantId;

        var myClientIds = await db.ChatbotClients
            .Where(c => c.TenantId == tenantId)
            .Select(c => c.Id)
            .ToListAsync(ct);

        var rows = await db.ChatbotTokenUsages
            .Where(u => myClientIds.Contains(u.ClientId) && u.CreatedAt >= since)
            .Select(u => new { u.ClientId, u.Channel, u.PromptTokens, u.CompletionTokens, u.CreatedAt })
            .ToListAsync(ct);

        var clientNames = await db.ChatbotClients
            .Where(c => myClientIds.Contains(c.Id))
            .Select(c => new { c.Id, c.Name })
            .ToListAsync(ct);

        return Ok(new
        {
            Days             = days,
            Since            = since,
            TotalCalls       = rows.Count,
            PromptTokens     = rows.Sum(r => (long)r.PromptTokens),
            CompletionTokens = rows.Sum(r => (long)r.CompletionTokens),
            TotalTokens      = rows.Sum(r => (long)r.PromptTokens + r.CompletionTokens),
            PerClient = clientNames
                .Select(c =>
                {
                    var cr = rows.Where(r => r.ClientId == c.Id).ToList();
                    return new
                    {
                        ClientId         = c.Id,
                        ClientName       = c.Name,
                        Calls            = cr.Count,
                        PromptTokens     = cr.Sum(r => (long)r.PromptTokens),
                        CompletionTokens = cr.Sum(r => (long)r.CompletionTokens),
                        TotalTokens      = cr.Sum(r => (long)r.PromptTokens + r.CompletionTokens),
                    };
                })
                .OrderByDescending(c => c.TotalTokens)
                .ToList(),
            PerChannel = rows
                .GroupBy(r => r.Channel)
                .Select(g => new
                {
                    Channel     = g.Key,
                    Calls       = g.Count(),
                    TotalTokens = g.Sum(r => (long)r.PromptTokens + r.CompletionTokens),
                })
                .OrderByDescending(g => g.TotalTokens)
                .ToList(),
            Daily = rows
                .GroupBy(r => r.CreatedAt.Date)
                .Select(g => new
                {
                    Date             = g.Key.ToString("yyyy-MM-dd"),
                    Calls            = g.Count(),
                    PromptTokens     = g.Sum(r => (long)r.PromptTokens),
                    CompletionTokens = g.Sum(r => (long)r.CompletionTokens),
                    TotalTokens      = g.Sum(r => (long)r.PromptTokens + r.CompletionTokens),
                })
                .OrderBy(g => g.Date)
                .ToList(),
        });
    }

    /// <summary>Admin view: token usage grouped by tenant across the platform.</summary>
    [HttpGet("admin")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> GetPlatformUsage([FromQuery] int days = 30, CancellationToken ct = default)
    {
        days = Math.Clamp(days, 1, 365);
        var since = DateTime.UtcNow.Date.AddDays(-(days - 1));

        var rows = await db.ChatbotTokenUsages
            .Where(u => u.CreatedAt >= since)
            .Select(u => new { u.ClientId, u.TenantId, u.Channel, u.PromptTokens, u.CompletionTokens, u.CreatedAt })
            .ToListAsync(ct);

        var clientIds = rows.Select(r => r.ClientId).Distinct().ToList();
        var clients = await db.ChatbotClients
            .Where(c => clientIds.Contains(c.Id))
            .Select(c => new { c.Id, c.Name })
            .ToListAsync(ct);
        var clientName = clients.ToDictionary(c => c.Id, c => c.Name);

        var tenantIds = rows.Where(r => r.TenantId != null).Select(r => r.TenantId!.Value).Distinct().ToList();
        var tenants = await db.Tenants
            .Where(t => tenantIds.Contains(t.Id))
            .Select(t => new { t.Id, t.Name })
            .ToListAsync(ct);
        var tenantName = tenants.ToDictionary(t => t.Id, t => t.Name);

        return Ok(new
        {
            Days             = days,
            Since            = since,
            TotalCalls       = rows.Count,
            PromptTokens     = rows.Sum(r => (long)r.PromptTokens),
            CompletionTokens = rows.Sum(r => (long)r.CompletionTokens),
            TotalTokens      = rows.Sum(r => (long)r.PromptTokens + r.CompletionTokens),
            PerTenant = rows
                .GroupBy(r => r.TenantId)
                .Select(g => new
                {
                    TenantId   = g.Key,
                    TenantName = g.Key != null && tenantName.TryGetValue(g.Key.Value, out var tn)
                        ? tn : "Platform (unassigned)",
                    Calls            = g.Count(),
                    PromptTokens     = g.Sum(r => (long)r.PromptTokens),
                    CompletionTokens = g.Sum(r => (long)r.CompletionTokens),
                    TotalTokens      = g.Sum(r => (long)r.PromptTokens + r.CompletionTokens),
                    Clients = g
                        .GroupBy(r => r.ClientId)
                        .Select(cg => new
                        {
                            ClientId    = cg.Key,
                            ClientName  = clientName.TryGetValue(cg.Key, out var cn) ? cn : "(deleted client)",
                            Calls       = cg.Count(),
                            TotalTokens = cg.Sum(r => (long)r.PromptTokens + r.CompletionTokens),
                        })
                        .OrderByDescending(c => c.TotalTokens)
                        .ToList(),
                })
                .OrderByDescending(t => t.TotalTokens)
                .ToList(),
            Daily = rows
                .GroupBy(r => r.CreatedAt.Date)
                .Select(g => new
                {
                    Date        = g.Key.ToString("yyyy-MM-dd"),
                    Calls       = g.Count(),
                    TotalTokens = g.Sum(r => (long)r.PromptTokens + r.CompletionTokens),
                })
                .OrderBy(g => g.Date)
                .ToList(),
        });
    }
}
