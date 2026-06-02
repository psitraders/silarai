using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Ai.Commands;
using ReplyCart.Application.Ai.Queries;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/ai")]
[Authorize]
public class AiSuggestionsController(IMediator mediator) : ControllerBase
{
    // ── Suggestions ──────────────────────────────────────────────────────────
    [HttpPost("suggest")]
    public async Task<IActionResult> GetSuggestion([FromBody] AiSuggestRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new GetAiSuggestionCommand(
            request.LeadId, request.CustomerQuestion, request.ProductId,
            request.Channel, request.ToneMode ?? "Friendly"), ct);
        return Ok(result);
    }

    // ── Templates ─────────────────────────────────────────────────────────────
    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates([FromQuery] string? category, CancellationToken ct)
        => Ok(await mediator.Send(new GetAiTemplatesQuery(category), ct));

    [HttpPost("templates")]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateAiTemplateCommand cmd, CancellationToken ct)
    {
        var id = await mediator.Send(cmd, ct);
        return Created($"api/v1/ai/templates/{id}", new { id });
    }

    [HttpPut("templates/{id:guid}")]
    public async Task<IActionResult> UpdateTemplate(Guid id, [FromBody] UpdateTemplateRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdateAiTemplateCommand(id, req.Name, req.Content, req.Category, req.ToneMode, req.IsActive), ct);
        return NoContent();
    }

    [HttpDelete("templates/{id:guid}")]
    public async Task<IActionResult> DeleteTemplate(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DeleteAiTemplateCommand(id), ct);
        return NoContent();
    }
}

public record AiSuggestRequest(Guid? LeadId, string CustomerQuestion, Guid? ProductId, string? Channel, string? ToneMode);
public record UpdateTemplateRequest(string Name, string Content, string Category, string ToneMode, bool IsActive);
