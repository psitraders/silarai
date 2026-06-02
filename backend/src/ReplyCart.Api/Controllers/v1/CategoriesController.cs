using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Catalog.Commands;
using ReplyCart.Application.Catalog.Queries;

namespace ReplyCart.Api.Controllers.v1;

[Authorize]
[ApiController]
[Route("api/v1/categories")]
public class CategoriesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await mediator.Send(new GetCategoriesQuery(), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryCommand cmd, CancellationToken ct)
    {
        var id = await mediator.Send(cmd, ct);
        return CreatedAtAction(nameof(GetAll), new { }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdateCategoryCommand(id, req.Name, req.Description, req.IsActive, req.SortOrder), ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DeleteCategoryCommand(id), ct);
        return NoContent();
    }
}

public record UpdateCategoryRequest(string Name, string? Description, bool IsActive, int SortOrder);
