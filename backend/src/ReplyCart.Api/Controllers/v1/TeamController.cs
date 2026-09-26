using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Team.Commands;
using ReplyCart.Application.Team.Queries;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Team management: the TenantAdmin (store owner) invites and manages Business Admins.
/// Business Admins themselves cannot call these endpoints.
/// </summary>
[ApiController]
[Route("api/v1/team")]
[Authorize(Roles = "TenantAdmin")]
public class TeamController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await mediator.Send(new GetTeamMembersQuery(), ct));

    [HttpPost("invite")]
    public async Task<IActionResult> Invite([FromBody] InviteBusinessAdminRequest request, CancellationToken ct)
        => Ok(await mediator.Send(new InviteBusinessAdminCommand(request.Name, request.Email), ct));

    [HttpPost("{userId:guid}/resend-invite")]
    public async Task<IActionResult> ResendInvite(Guid userId, CancellationToken ct)
    {
        await mediator.Send(new ResendBusinessAdminInviteCommand(userId), ct);
        return Ok(new { message = "Invitation sent." });
    }

    [HttpPut("{userId:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid userId, [FromBody] SetTeamMemberStatusRequest request, CancellationToken ct)
    {
        await mediator.Send(new SetBusinessAdminStatusCommand(userId, request.IsActive), ct);
        return Ok(new { message = request.IsActive ? "Admin reactivated." : "Admin deactivated." });
    }
}

public record InviteBusinessAdminRequest(string Name, string Email);
public record SetTeamMemberStatusRequest(bool IsActive);
