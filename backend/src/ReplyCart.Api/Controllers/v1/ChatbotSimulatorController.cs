using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Conversation.Commands;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// In-dashboard chatbot simulator — runs the full AI pipeline without
/// sending real WhatsApp / Facebook / Instagram messages.
/// </summary>
[ApiController]
[Route("api/v1/chatbot/simulate")]
[Authorize]
public class ChatbotSimulatorController(IMediator mediator) : ControllerBase
{
    /// <summary>Send a message to the simulator and get the AI reply.</summary>
    [HttpPost]
    public async Task<IActionResult> Simulate(
        [FromBody] SimulateRequest req,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Message))
            return BadRequest(new { error = "Message cannot be empty." });

        try
        {
            var result = await mediator.Send(new SimulateChatbotCommand(
                MessageText: req.Message.Trim(),
                Channel:     req.Channel ?? "WhatsApp",
                SenderName:  req.SenderName ?? "You"
            ), ct);

            return Ok(new
            {
                reply        = result.Reply,
                sessionState = result.SessionState,
                isNewSession = result.IsNewSession,
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    /// <summary>Reset the simulator — clears conversation history so next message starts fresh.</summary>
    [HttpDelete]
    public async Task<IActionResult> Reset(CancellationToken ct)
    {
        await mediator.Send(new ResetSimulatorSessionCommand(), ct);
        return Ok(new { message = "Simulator session reset. Next message will start a fresh conversation." });
    }
}

public record SimulateRequest(
    string  Message,
    string? Channel    = "WhatsApp",
    string? SenderName = "You"
);
