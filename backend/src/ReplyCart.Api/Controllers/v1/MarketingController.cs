using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Marketing.Commands;
using ReplyCart.Application.Marketing.Queries;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/marketing")]
[Authorize]
public class MarketingController(IMediator mediator) : ControllerBase
{
    [HttpGet("campaigns")]
    public async Task<IActionResult> GetCampaigns([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await mediator.Send(new GetCampaignsQuery(page, pageSize), ct));

    [HttpGet("campaigns/{id:guid}")]
    public async Task<IActionResult> GetCampaign(Guid id, CancellationToken ct)
        => Ok(await mediator.Send(new GetCampaignByIdQuery(id), ct));

    [HttpPost("campaigns")]
    public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignRequest request, CancellationToken ct)
    {
        var id = await mediator.Send(new CreateCampaignCommand(
            request.Title, request.Type, request.Message, request.Subject,
            request.Recipients.Select(r => new CampaignRecipientInput(r.Name, r.Phone, r.Email)).ToList()), ct);
        return Created($"api/v1/marketing/campaigns/{id}", new { id });
    }

    [HttpPost("campaigns/{id:guid}/send")]
    public async Task<IActionResult> SendCampaign(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new SendCampaignCommand(id), ct);
        return Ok(result);
    }

    [HttpPost("social-post")]
    public async Task<IActionResult> GenerateSocialPost([FromBody] SocialPostRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(
            new ReplyCart.Application.Ai.Commands.GetSocialPostCommand(
                request.ProductName, request.ProductDescription,
                request.Platform, request.Tone, request.BusinessName,
                request.Language ?? "English"), ct);
        return Ok(result);
    }

    [HttpPost("product-description")]
    public async Task<IActionResult> GenerateProductDescription([FromBody] ProductDescriptionRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(
            new ReplyCart.Application.Marketing.Commands.GenerateProductDescriptionCommand(
                request.ProductName, request.Category, request.Features,
                request.Tone, request.BusinessName, request.Language ?? "English"), ct);
        return Ok(result);
    }

    [HttpPost("reel-script")]
    public async Task<IActionResult> GenerateReelScript([FromBody] ReelScriptRequest request, CancellationToken ct)
    {
        var script = await mediator.Send(
            new ReplyCart.Application.Marketing.Commands.GenerateReelScriptCommand(
                request.ProductName, request.ProductDescription,
                request.DurationSeconds, request.Tone, request.BusinessName), ct);
        return Ok(new { script });
    }

    [HttpPost("generate-poster")]
    public async Task<IActionResult> GeneratePoster([FromBody] SocialPostRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(
            new ReplyCart.Application.Marketing.Commands.GeneratePosterCommand(
                request.ProductName, request.ProductDescription,
                request.Platform, request.Tone, request.BusinessName), ct);
        return Ok(result);
    }

    [HttpPost("generate-message")]
    public async Task<IActionResult> GenerateMarketingMessage([FromBody] GenerateMessageRequest request, CancellationToken ct)
    {
        var message = await mediator.Send(
            new ReplyCart.Application.Marketing.Commands.GenerateMarketingMessageCommand(
                request.Goal, request.Tone, request.ExtraContext), ct);
        return Ok(new { message });
    }
}

public record CreateCampaignRequest(
    string Title,
    CampaignType Type,
    string? Message,
    string? Subject,
    List<RecipientInput> Recipients);
public record RecipientInput(string Name, string? Phone, string? Email);
public record SocialPostRequest(string ProductName, string? ProductDescription, string Platform, string Tone, string? BusinessName, string? Language = "English");
public record ProductDescriptionRequest(string ProductName, string? Category, string? Features, string Tone, string? BusinessName, string? Language = "English");
public record ReelScriptRequest(string ProductName, string? ProductDescription, int DurationSeconds, string Tone, string? BusinessName);
public record GenerateMessageRequest(string Goal, string Tone, string? ExtraContext);
