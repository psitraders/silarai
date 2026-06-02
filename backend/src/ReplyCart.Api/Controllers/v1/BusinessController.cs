using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Business.Commands;
using ReplyCart.Application.Business.Queries;

namespace ReplyCart.Api.Controllers.v1;

[Authorize]
[ApiController]
[Route("api/v1/business")]
public class BusinessController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
        => Ok(await mediator.Send(new GetBusinessQuery(), ct));

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateBusinessCommand cmd, CancellationToken ct)
    {
        await mediator.Send(cmd, ct);
        return NoContent();
    }

    [HttpGet("storefront")]
    public async Task<IActionResult> GetStorefront(CancellationToken ct)
        => Ok(await mediator.Send(new GetStorefrontSettingsQuery(), ct));

    [HttpPut("storefront")]
    public async Task<IActionResult> UpdateStorefront([FromBody] UpdateStorefrontSettingsCommand cmd, CancellationToken ct)
    {
        await mediator.Send(cmd, ct);
        return NoContent();
    }
}
