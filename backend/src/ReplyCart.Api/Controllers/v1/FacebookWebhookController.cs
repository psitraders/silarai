using MediatR;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Facebook.Commands;
using System.Text.Json.Serialization;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/webhooks/facebook")]
public class FacebookWebhookController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;
    private readonly IFacebookService _facebook;
    private readonly ILogger<FacebookWebhookController> _logger;

    public FacebookWebhookController(
        IMediator mediator,
        IConfiguration configuration,
        IFacebookService facebook,
        ILogger<FacebookWebhookController> logger)
    {
        _mediator = mediator;
        _configuration = configuration;
        _facebook = facebook;
        _logger = logger;
    }

    // ── Step 1: Meta verification challenge ──────────────────────────────────
    [HttpGet]
    public IActionResult Verify(
        [FromQuery(Name = "hub.mode")] string mode,
        [FromQuery(Name = "hub.verify_token")] string token,
        [FromQuery(Name = "hub.challenge")] string challenge)
    {
        var verifyToken = _configuration["Facebook:VerifyToken"] ?? "replycart-fb-verify";

        if (mode == "subscribe" && token == verifyToken)
        {
            _logger.LogInformation("Facebook webhook verified successfully");
            return Ok(challenge);
        }

        _logger.LogWarning("Facebook webhook verification failed. Token mismatch.");
        return Forbid();
    }

    // ── Step 2: Receive incoming messages ────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Receive([FromBody] FacebookWebhookPayload payload, CancellationToken ct)
    {
        if (payload?.Object != "page")
            return Ok(); // Always 200 to Meta

        try
        {
            foreach (var entry in payload.Entry ?? [])
            {
                // Resolve tenant by the Facebook Page ID
                var tenantId = await _facebook.ResolveTenantByPageIdAsync(entry.Id ?? string.Empty, ct);
                if (tenantId == null)
                {
                    _logger.LogWarning("No tenant found for Facebook page ID {Id}", entry.Id);
                    continue;
                }

                foreach (var messaging in entry.Messaging ?? [])
                {
                    var senderId = messaging.Sender?.Id;
                    var messageText = messaging.Message?.Text;

                    if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(messageText))
                        continue;

                    // Skip echo messages (page sending to itself) and delivery/read receipts
                    if (messaging.Message?.IsEcho == true)
                        continue;

                    var messageId = messaging.Message?.Mid ?? Guid.NewGuid().ToString();

                    await _mediator.Send(new ProcessFacebookMessageCommand(
                        SenderId: senderId,
                        SenderName: senderId,  // Facebook PSID — name requires additional Graph API call
                        MessageText: messageText,
                        FacebookMessageId: messageId,
                        TenantId: tenantId.Value
                    ), ct);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Facebook webhook");
        }

        return Ok();
    }
}

// ── Webhook DTOs ──────────────────────────────────────────────────────────────

public class FacebookWebhookPayload
{
    [JsonPropertyName("object")] public string? Object { get; set; }
    [JsonPropertyName("entry")] public List<FacebookEntry>? Entry { get; set; }
}

public class FacebookEntry
{
    [JsonPropertyName("id")] public string? Id { get; set; }         // Page ID
    [JsonPropertyName("time")] public long Time { get; set; }
    [JsonPropertyName("messaging")] public List<FacebookMessaging>? Messaging { get; set; }
}

public class FacebookMessaging
{
    [JsonPropertyName("sender")] public FacebookParticipant? Sender { get; set; }
    [JsonPropertyName("recipient")] public FacebookParticipant? Recipient { get; set; }
    [JsonPropertyName("timestamp")] public long Timestamp { get; set; }
    [JsonPropertyName("message")] public FacebookMessage? Message { get; set; }
}

public class FacebookParticipant
{
    [JsonPropertyName("id")] public string? Id { get; set; }
}

public class FacebookMessage
{
    [JsonPropertyName("mid")] public string? Mid { get; set; }
    [JsonPropertyName("text")] public string? Text { get; set; }
    [JsonPropertyName("is_echo")] public bool IsEcho { get; set; }
}
