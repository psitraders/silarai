using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Instagram.Commands;
using ReplyCart.Infrastructure.Persistence;
using System.Text.Json.Serialization;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/webhooks/instagram")]
public class InstagramWebhookController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;
    private readonly IInstagramService _instagram;
    private readonly ILogger<InstagramWebhookController> _logger;
    private readonly AppDbContext _db;
    private readonly IAiProvider _ai;
    private readonly IConversationMemoryService _memory;
    private readonly IHttpClientFactory _httpClientFactory;

    public InstagramWebhookController(
        IMediator mediator,
        IConfiguration configuration,
        IInstagramService instagram,
        ILogger<InstagramWebhookController> logger,
        AppDbContext db,
        IAiProvider ai,
        IConversationMemoryService memory,
        IHttpClientFactory httpClientFactory)
    {
        _mediator = mediator;
        _configuration = configuration;
        _instagram = instagram;
        _logger = logger;
        _db = db;
        _ai = ai;
        _memory = memory;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public IActionResult Verify(
        [FromQuery(Name = "hub.mode")] string mode,
        [FromQuery(Name = "hub.verify_token")] string token,
        [FromQuery(Name = "hub.challenge")] string challenge)
    {
        var verifyToken = _configuration["Instagram:VerifyToken"] ?? "replycart-ig-verify";
        if (mode == "subscribe" && token == verifyToken)
        {
            _logger.LogInformation("Instagram webhook verified successfully");
            return Ok(challenge);
        }
        _logger.LogWarning("Instagram webhook verification failed. Token mismatch.");
        return Forbid();
    }

    [HttpPost]
    public async Task<IActionResult> Receive([FromBody] InstagramWebhookPayload payload, CancellationToken ct)
    {
        if (payload?.Object != "instagram")
            return Ok();

        try
        {
            foreach (var entry in payload.Entry ?? [])
            {
                var tenantId = await _instagram.ResolveTenantByAccountIdAsync(entry.Id ?? string.Empty, ct);

                // ── External chatbot client? ──────────────────────────────────
                if (tenantId == null)
                {
                    var extClient = await _db.ChatbotClients
                        .Include(c => c.Products)
                        .FirstOrDefaultAsync(c => c.IgAccountId == entry.Id && c.IsActive, ct);

                    if (extClient != null)
                    {
                        foreach (var messaging in entry.Messaging ?? [])
                        {
                            var sid  = messaging.Sender?.Id;
                            var text = messaging.Message?.Text;
                            if (string.IsNullOrEmpty(sid) || string.IsNullOrEmpty(text)) continue;
                            if (messaging.Message?.IsEcho == true) continue;

                            await ChatbotClientWebhookHelper.HandleInstagramAsync(
                                extClient, sid, text,
                                _ai, _memory, _httpClientFactory, _logger, ct);
                        }
                        continue;
                    }

                    _logger.LogWarning("No tenant/client found for Instagram account ID {Id}", entry.Id);
                    continue;
                }

                foreach (var messaging in entry.Messaging ?? [])
                {
                    var senderId    = messaging.Sender?.Id;
                    var messageText = messaging.Message?.Text;
                    if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(messageText)) continue;
                    if (messaging.Message?.IsEcho == true) continue;

                    var messageId  = messaging.Message?.Mid ?? Guid.NewGuid().ToString();
                    var senderName = senderId;

                    await _mediator.Send(new ProcessInstagramMessageCommand(
                        SenderId: senderId,
                        SenderName: senderName,
                        MessageText: messageText,
                        InstagramMessageId: messageId,
                        TenantId: tenantId.Value
                    ), ct);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Instagram webhook");
        }

        return Ok();
    }
}

// ── Webhook DTOs ──────────────────────────────────────────────────────────────

public class InstagramWebhookPayload
{
    [JsonPropertyName("object")] public string? Object { get; set; }
    [JsonPropertyName("entry")] public List<InstagramEntry>? Entry { get; set; }
}

public class InstagramEntry
{
    [JsonPropertyName("id")] public string? Id { get; set; }
    [JsonPropertyName("time")] public long Time { get; set; }
    [JsonPropertyName("messaging")] public List<InstagramMessaging>? Messaging { get; set; }
}

public class InstagramMessaging
{
    [JsonPropertyName("sender")] public InstagramParticipant? Sender { get; set; }
    [JsonPropertyName("recipient")] public InstagramParticipant? Recipient { get; set; }
    [JsonPropertyName("timestamp")] public long Timestamp { get; set; }
    [JsonPropertyName("message")] public InstagramMessage? Message { get; set; }
}

public class InstagramParticipant
{
    [JsonPropertyName("id")] public string? Id { get; set; }
}

public class InstagramMessage
{
    [JsonPropertyName("mid")] public string? Mid { get; set; }
    [JsonPropertyName("text")] public string? Text { get; set; }
    [JsonPropertyName("is_echo")] public bool IsEcho { get; set; }
}
