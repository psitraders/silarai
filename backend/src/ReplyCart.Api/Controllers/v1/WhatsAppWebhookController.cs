using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.WhatsApp.Commands;
using ReplyCart.Infrastructure.Persistence;
using System.Text;
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

    private readonly AppDbContext _db;
    private readonly IAiProvider _ai;
    private readonly IConversationMemoryService _memory;
    private readonly IHttpClientFactory _httpClientFactory;

    public WhatsAppWebhookController(IMediator mediator, IConfiguration configuration, IWhatsAppService whatsApp,
        ILogger<WhatsAppWebhookController> logger, AppDbContext db, IAiProvider ai,
        IConversationMemoryService memory, IHttpClientFactory httpClientFactory)
    {
        _mediator = mediator;
        _configuration = configuration;
        _whatsApp = whatsApp;
        _logger = logger;
        _db = db;
        _ai = ai;
        _memory = memory;
        _httpClientFactory = httpClientFactory;
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

                    // Resolve tenant by Meta Phone Number ID (most reliable — matches stored per-tenant ID)
                    var phoneNumberId = value.Metadata?.PhoneNumberId ?? string.Empty;
                    var tenantId = await _whatsApp.ResolveTenantByPhoneNumberIdAsync(phoneNumberId, ct);

                    // ── External chatbot client? ──────────────────────────────
                    if (tenantId == null)
                    {
                        var extClient = await _db.ChatbotClients
                            .Include(c => c.Products)
                            .FirstOrDefaultAsync(c => c.WaPhoneNumberId == phoneNumberId && c.IsActive, ct);

                        if (extClient != null)
                        {
                            foreach (var message in value.Messages)
                            {
                                if (message.Type != "text") continue;
                                var text = message.Text?.Body ?? string.Empty;
                                if (string.IsNullOrWhiteSpace(text)) continue;
                                await ChatbotClientWebhookHelper.HandleWhatsAppAsync(
                                    extClient, message.From, text,
                                    _ai, _memory, _httpClientFactory, _logger, ct);
                            }
                            continue;
                        }

                        _logger.LogWarning("No tenant/client found for WhatsApp PhoneNumberId {Id}", phoneNumberId);
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


