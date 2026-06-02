using System.Text;
using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Marketing.Commands;
using ReplyCart.Application.Marketing.Queries;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/wa-templates")]
[Authorize]
public class WaTemplatesController(
    IMediator mediator,
    IHttpClientFactory httpClientFactory,
    ILogger<WaTemplatesController> logger) : ControllerBase
{
    // ── List ──────────────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var result = await mediator.Send(new GetWaTemplatesQuery(), ct);
        return Ok(result);
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetWaTemplateByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    // ── Create + submit to Meta ───────────────────────────────────────────────

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateWaTemplateRequest req,
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { errors = new[] { "Template name is required." } });
        if (string.IsNullOrWhiteSpace(req.Body))
            return BadRequest(new { errors = new[] { "Template body is required." } });

        // Sanitise: Meta requires lowercase, alphanumeric + underscores only
        var metaName = req.Name.Trim().ToLowerInvariant()
            .Replace(' ', '_')
            .Replace('-', '_');

        var id = await mediator.Send(new CreateWaTemplateCommand(
            metaName,
            string.IsNullOrWhiteSpace(req.DisplayName) ? req.Name : req.DisplayName,
            req.Category ?? "MARKETING",
            req.Language ?? "en_US",
            req.Body,
            req.HeaderText,
            req.FooterText,
            req.VariablesJson
        ), ct);

        // ── Submit to Meta API (non-blocking — save locally regardless) ────────
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        if (!string.IsNullOrEmpty(business?.WhatsAppWabaId)
         && !string.IsNullOrEmpty(business?.WhatsAppAccessToken))
        {
            await SubmitTemplateToMetaAsync(
                db, id,
                business.WhatsAppWabaId,
                business.WhatsAppAccessToken,
                metaName,
                req.Category ?? "MARKETING",
                req.Language ?? "en_US",
                req.Body,
                req.HeaderText,
                ct);
        }

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    // ── Sync template statuses from Meta ──────────────────────────────────────

    [HttpPost("sync")]
    public async Task<IActionResult> Sync(
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        if (string.IsNullOrEmpty(business?.WhatsAppWabaId)
         || string.IsNullOrEmpty(business?.WhatsAppAccessToken))
            return BadRequest(new { message = "WhatsApp is not connected. Connect via the Integrations page first." });

        var http = httpClientFactory.CreateClient();
        var url  = $"https://graph.facebook.com/v25.0/{business.WhatsAppWabaId}/message_templates" +
                   $"?fields=id,name,status&limit=100&access_token={business.WhatsAppAccessToken}";

        var resp = await http.GetAsync(url, ct);
        var body = await resp.Content.ReadAsStringAsync(ct);
        logger.LogInformation("Meta template sync: {Body}", body);

        if (!resp.IsSuccessStatusCode)
            return BadRequest(new { message = "Failed to fetch templates from Meta.", detail = body });

        var json = JsonSerializer.Deserialize<JsonElement>(body);
        if (!json.TryGetProperty("data", out var dataArr))
            return Ok(new { synced = 0 });

        var localTemplates = await db.WaTemplates
            .Where(t => t.TenantId == tenantContext.CurrentTenantId)
            .ToListAsync(ct);

        var synced = 0;
        foreach (var metaTemplate in dataArr.EnumerateArray())
        {
            var metaId   = metaTemplate.TryGetProperty("id",     out var mid)     ? mid.GetString()    : null;
            var metaName = metaTemplate.TryGetProperty("name",   out var mname)   ? mname.GetString()  : null;
            var status   = metaTemplate.TryGetProperty("status", out var mstatus) ? mstatus.GetString(): null;

            if (metaId == null || metaName == null) continue;

            var local = localTemplates.FirstOrDefault(t =>
                t.MetaTemplateId == metaId || t.Name == metaName);

            if (local != null)
            {
                local.MetaTemplateId = metaId;
                local.MetaStatus     = status ?? local.MetaStatus;
                synced++;
            }
        }

        await db.SaveChangesAsync(ct);
        return Ok(new { synced, message = $"Synced {synced} template(s) from Meta." });
    }

    // ── Update ────────────────────────────────────────────────────────────────

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWaTemplateRequest req, CancellationToken ct)
    {
        try
        {
            await mediator.Send(new UpdateWaTemplateCommand(
                id,
                req.Name ?? string.Empty,
                string.IsNullOrWhiteSpace(req.DisplayName) ? (req.Name ?? string.Empty) : req.DisplayName,
                req.Category ?? "MARKETING",
                req.Language ?? "en",
                req.Body ?? string.Empty,
                req.HeaderText,
                req.FooterText,
                req.VariablesJson,
                req.IsActive ?? true
            ), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await mediator.Send(new DeleteWaTemplateCommand(id), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    // ── Meta helper ──────────────────────────────────────────────────────────

    private async Task SubmitTemplateToMetaAsync(
        AppDbContext db,
        Guid localId,
        string wabaId,
        string accessToken,
        string name,
        string category,
        string language,
        string body,
        string? headerText,
        CancellationToken ct)
    {
        try
        {
            var components = new List<object>();

            if (!string.IsNullOrEmpty(headerText))
                components.Add(new { type = "HEADER", format = "TEXT", text = headerText });

            components.Add(new { type = "BODY", text = body });

            var payload = new
            {
                name,
                category = category.ToUpperInvariant(),
                language,
                components,
            };

            var http    = httpClientFactory.CreateClient();
            var json    = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            using var req = new HttpRequestMessage(
                HttpMethod.Post,
                $"https://graph.facebook.com/v25.0/{wabaId}/message_templates");
            req.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            req.Content = content;

            var resp     = await http.SendAsync(req, ct);
            var respBody = await resp.Content.ReadAsStringAsync(ct);
            logger.LogInformation("Meta template submit response: {Body}", respBody);

            var respJson = JsonSerializer.Deserialize<JsonElement>(respBody);

            // Update local record with Meta's template ID and initial status
            var template = await db.WaTemplates.FindAsync([localId], ct);
            if (template != null)
            {
                if (respJson.TryGetProperty("id", out var metaId))
                    template.MetaTemplateId = metaId.GetString();

                template.MetaStatus = resp.IsSuccessStatusCode ? "PENDING" : "ERROR";
                await db.SaveChangesAsync(ct);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to submit template {LocalId} to Meta", localId);
        }
    }

    // ── Send campaign ─────────────────────────────────────────────────────────

    [HttpPost("{id:guid}/send")]
    public async Task<IActionResult> Send(Guid id, [FromBody] SendWaCampaignRequest req, CancellationToken ct)
    {
        try
        {
            var result = await mediator.Send(new SendWaCampaignCommand(
                id,
                req.PhoneNumbers,
                req.TemplateParams,
                req.MediaUrl
            ), ct);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

public record CreateWaTemplateRequest(
    string  Name,
    string? DisplayName,
    string? Category,
    string? Language,
    string  Body,
    string? HeaderText,
    string? FooterText,
    string? VariablesJson
);

public record UpdateWaTemplateRequest(
    string?  Name,
    string?  DisplayName,
    string?  Category,
    string?  Language,
    string?  Body,
    string?  HeaderText,
    string?  FooterText,
    string?  VariablesJson,
    bool?    IsActive
);

public record SendWaCampaignRequest(
    List<string>? PhoneNumbers,
    List<string>? TemplateParams,
    string?       MediaUrl
);
