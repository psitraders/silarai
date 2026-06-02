using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.WhatsApp.Commands;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/webhooks/whatsapp")]
public class WhatsAppWebhookController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;
    private readonly IWhatsAppService _whatsApp;
    private readonly ILogger<WhatsAppWebhookController> _logger;

    public WhatsAppWebhookController(IMediator mediator, IConfiguration configuration, IWhatsAppService whatsApp, ILogger<WhatsAppWebhookController> logger)
    {
        _mediator = mediator;
        _configuration = configuration;
        _whatsApp = whatsApp;
        _logger = logger;
    }

    // ── Step 1: Meta verification challenge ──────────────────────────────────
    [HttpGet]
    public IActionResult Verify(
        [FromQuery(Name = "hub.mode")] string mode,
        [FromQuery(Name = "hub.verify_token")] string token,
        [FromQuery(Name = "hub.challenge")] string challenge)
    {
        var verifyToken = _configuration["WhatsApp:VerifyToken"] ?? "replycart-verify";

        if (mode == "subscribe" && token == verifyToken)
        {
            _logger.LogInformation("WhatsApp webhook verified successfully");
            return Ok(challenge);
        }

        _logger.LogWarning("WhatsApp webhook verification failed. Token mismatch.");
        return Forbid();
    }

    // ── Step 2: Receive incoming messages ────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Receive([FromBody] WhatsAppWebhookPayload payload, CancellationToken ct)
    {
        if (payload?.Object != "whatsapp_business_account")
            return Ok(); // Always return 200 to Meta

        try
        {
            foreach (var entry in payload.Entry ?? [])
            {
                foreach (var change in entry.Changes ?? [])
                {
                    if (change.Field != "messages") continue;

                    var value = change.Value;
                    if (value?.Messages == null) continue;

                    // Get tenant from phone number ID (looks up DB first, then config fallback)
                    var tenantId = await _whatsApp.ResolveTenantByPhoneNumberIdAsync(value.Metadata?.PhoneNumberId ?? string.Empty, ct);
                    if (tenantId == null)
                    {
                        _logger.LogWarning("No tenant found for phone number ID {Id}", value.Metadata?.PhoneNumberId);
                        continue;
                    }

                    foreach (var message in value.Messages)
                    {
                        if (message.Type != "text") continue; // only handle text for now

                        var senderName = value.Contacts?.FirstOrDefault(c => c.WaId == message.From)?.Profile?.Name
                            ?? message.From;

                        await _mediator.Send(new ProcessWhatsAppMessageCommand(
                            FromPhone: message.From,
                            SenderName: senderName,
                            MessageText: message.Text?.Body ?? string.Empty,
                            WhatsAppMessageId: message.Id,
                            TenantId: tenantId.Value
                        ), ct);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing WhatsApp webhook");
        }

        return Ok(); // Always 200 — Meta will retry if we return non-2xx
    }

}

// ── Webhook DTOs ──────────────────────────────────────────────────────────────

public class WhatsAppWebhookPayload
{
    [JsonPropertyName("object")] public string? Object { get; set; }
    [JsonPropertyName("entry")] public List<WhatsAppEntry>? Entry { get; set; }
}

public class WhatsAppEntry
{
    [JsonPropertyName("id")] public string? Id { get; set; }
    [JsonPropertyName("changes")] public List<WhatsAppChange>? Changes { get; set; }
}

public class WhatsAppChange
{
    [JsonPropertyName("value")] public WhatsAppValue? Value { get; set; }
    [JsonPropertyName("field")] public string? Field { get; set; }
}

public class WhatsAppValue
{
    [JsonPropertyName("messaging_product")] public string? MessagingProduct { get; set; }
    [JsonPropertyName("metadata")] public WhatsAppMetadata? Metadata { get; set; }
    [JsonPropertyName("contacts")] public List<WhatsAppContact>? Contacts { get; set; }
    [JsonPropertyName("messages")] public List<WhatsAppMessage>? Messages { get; set; }
}

public class WhatsAppMetadata
{
    [JsonPropertyName("display_phone_number")] public string? DisplayPhoneNumber { get; set; }
    [JsonPropertyName("phone_number_id")] public string? PhoneNumberId { get; set; }
}

public class WhatsAppContact
{
    [JsonPropertyName("profile")] public WhatsAppProfile? Profile { get; set; }
    [JsonPropertyName("wa_id")] public string? WaId { get; set; }
}

public class WhatsAppProfile
{
    [JsonPropertyName("name")] public string? Name { get; set; }
}

public class WhatsAppMessage
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("from")] public string From { get; set; } = string.Empty;
    [JsonPropertyName("timestamp")] public string? Timestamp { get; set; }
    [JsonPropertyName("type")] public string Type { get; set; } = string.Empty;
    [JsonPropertyName("text")] public WhatsAppTextContent? Text { get; set; }
}

public class WhatsAppTextContent
{
    [JsonPropertyName("body")] public string? Body { get; set; }
}
