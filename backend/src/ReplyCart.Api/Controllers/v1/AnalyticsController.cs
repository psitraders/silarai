using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Analytics.Queries;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/analytics")]
[Authorize]
public class AnalyticsController(IMediator mediator) : ControllerBase
{
    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis([FromQuery] int periodDays = 7, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetDashboardKpisQuery(periodDays), ct);
        return Ok(result);
    }
}
