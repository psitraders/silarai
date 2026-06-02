using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Analytics.Queries;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/activity")]
[Authorize]
public class ActivityController(IMediator mediator) : ControllerBase
{
    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed([FromQuery] int count = 15, CancellationToken ct = default)
        => Ok(await mediator.Send(new GetActivityFeedQuery(count), ct));

    [HttpGet("reminders")]
    public async Task<IActionResult> GetReminders([FromQuery] int staleAfterDays = 2, CancellationToken ct = default)
        => Ok(await mediator.Send(new GetFollowUpRemindersQuery(staleAfterDays), ct));
}
