using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Orders.Commands;
using ReplyCart.Application.Orders.Queries;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/orders")]
[Authorize]
public class OrdersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
        => Ok(await mediator.Send(new GetOrdersQuery(page, pageSize, status, search), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await mediator.Send(new GetOrderByIdQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        var id = await mediator.Send(new CreateOrderCommand(
            request.CustomerId, request.SourceLeadId, request.SourceChannel,
            request.CustomerName, request.CustomerPhone, request.DeliveryAddress,
            request.Notes, request.Items.Select(i => new OrderItemRequest(
                i.ProductId, i.ProductTitle, i.VariantInfo, i.Quantity, i.UnitPrice))), ct);
        return Created($"api/v1/orders/{id}", new { id });
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        await mediator.Send(new UpdateOrderStatusCommand(id, request.Status, request.PaymentStatus, request.Note), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/payments")]
    public async Task<IActionResult> RecordPayment(Guid id, [FromBody] RecordPaymentRequest request, CancellationToken ct)
    {
        await mediator.Send(new RecordPaymentCommand(id, request.Amount, request.Method, request.ReferenceNumber, request.Notes), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelOrderRequest? request, CancellationToken ct)
    {
        await mediator.Send(new CancelOrderCommand(id, request?.Reason), ct);
        return NoContent();
    }
}

public record CreateOrderRequest(
    Guid? CustomerId, Guid? SourceLeadId, SocialPlatform SourceChannel,
    string? CustomerName, string? CustomerPhone, string? DeliveryAddress,
    string? Notes, IEnumerable<OrderItemRequestDto> Items);
public record OrderItemRequestDto(Guid ProductId, string ProductTitle, string? VariantInfo, int Quantity, decimal UnitPrice);
public record UpdateOrderStatusRequest(OrderStatus Status, PaymentStatus? PaymentStatus, string? Note);
public record RecordPaymentRequest(decimal Amount, string Method, string? ReferenceNumber, string? Notes);
public record CancelOrderRequest(string? Reason);
