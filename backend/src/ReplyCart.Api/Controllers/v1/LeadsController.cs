using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Leads.Commands;
using ReplyCart.Application.Leads.Queries;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/leads")]
[Authorize]
public class LeadsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetLeads(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] LeadStatus? status = null,
        [FromQuery] SocialPlatform? channel = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
        => Ok(await mediator.Send(new GetLeadsQuery(page, pageSize, status, channel, search), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await mediator.Send(new GetLeadByIdQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLeadRequest request, CancellationToken ct)
    {
        var id = await mediator.Send(new CreateLeadCommand(
            request.CustomerName, request.CustomerPhone, request.CustomerEmail,
            request.SourceChannel, request.InterestedProductId, request.InquiryNote,
            request.AssignedUserId, request.FollowUpDate, request.Priority), ct);
        return Created($"api/v1/leads/{id}", new { id });
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateLeadStatusRequest request, CancellationToken ct)
    {
        await mediator.Send(new UpdateLeadStatusCommand(id, request.Status, request.FollowUpDate), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/notes")]
    public async Task<IActionResult> AddNote(Guid id, [FromBody] AddLeadNoteRequest request, CancellationToken ct)
    {
        var noteId = await mediator.Send(new AddLeadNoteCommand(id, request.Content), ct);
        return Created("", new { id = noteId });
    }

    [HttpPost("{id:guid}/convert")]
    public async Task<IActionResult> ConvertToOrder(Guid id, [FromBody] ConvertLeadRequest request, CancellationToken ct)
    {
        var orderId = await mediator.Send(new ConvertLeadToOrderCommand(id, request.Items, request.Notes), ct);
        return Created($"api/v1/orders/{orderId}", new { id = orderId });
    }
}

public record CreateLeadRequest(
    string CustomerName, string? CustomerPhone, string? CustomerEmail,
    SocialPlatform SourceChannel, Guid? InterestedProductId, string? InquiryNote,
    Guid? AssignedUserId, DateTime? FollowUpDate, int Priority = 1);
public record UpdateLeadStatusRequest(LeadStatus Status, DateTime? FollowUpDate);
public record AddLeadNoteRequest(string Content);
public record ConvertLeadRequest(List<OrderItemInput> Items, string? Notes);


