using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Business.Commands;
using ReplyCart.Application.Business.Queries;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class IntegrationsController(IMediator mediator, IConfiguration configuration) : ControllerBase
{
    /// <summary>GET current integration settings for this tenant.</summary>
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await mediator.Send(new GetIntegrationSettingsQuery(), ct);
        return Ok(result);
    }

    /// <summary>Save integration credentials + theme color.</summary>
    [HttpPut]
    public async Task<IActionResult> Save([FromBody] SaveIntegrationSettingsRequest req, CancellationToken ct)
    {
        await mediator.Send(new SaveIntegrationSettingsCommand(
            req.WhatsAppPhoneNumberId,
            req.WhatsAppAccessToken,
            req.WhatsAppNumber,
            req.InstagramAccountId,
            req.InstagramAccessToken,
            req.FacebookPageId,
            req.FacebookPageAccessToken,
            req.ThemeColor ?? "#0F766E"
        ), ct);
        return NoContent();
    }

    // ── WhatsApp ──────────────────────────────────────────────────────────────

    /// <summary>Returns the WhatsApp webhook URL and verify token.</summary>
    [HttpGet("whatsapp/webhook-info")]
    public IActionResult WhatsAppWebhookInfo()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        return Ok(new
        {
            WebhookUrl = $"{baseUrl}/api/v1/webhooks/whatsapp",
            VerifyToken = configuration["WhatsApp:VerifyToken"] ?? "replycart-verify-2024",
            Instructions = new[]
            {
                "1. Go to Meta Developer App → WhatsApp → Configuration",
                "2. Set Callback URL to the WebhookUrl above",
                "3. Set Verify Token to the VerifyToken above",
                "4. Subscribe to: messages",
                "5. Enter your Phone Number ID and Access Token in the form below"
            }
        });
    }

    /// <summary>Test WhatsApp connection by sending a test message.</summary>
    [HttpPost("whatsapp/test")]
    public async Task<IActionResult> TestWhatsApp(
        [FromBody] TestMessageRequest req,
        [FromServices] IWhatsAppService whatsApp,
        CancellationToken ct)
    {
        await whatsApp.SendTextMessageAsync(
            req.ToId,
            "✅ ReplyCart WhatsApp test message! Your connection is working.",
            ct);
        return Ok(new { message = "Test message sent. Check your WhatsApp." });
    }

    // ── Instagram ─────────────────────────────────────────────────────────────

    /// <summary>Returns the Instagram webhook URL and verify token.</summary>
    [HttpGet("instagram/webhook-info")]
    public IActionResult InstagramWebhookInfo()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        return Ok(new
        {
            WebhookUrl = $"{baseUrl}/api/v1/webhooks/instagram",
            VerifyToken = configuration["Instagram:VerifyToken"] ?? "replycart-ig-verify",
            Instructions = new[]
            {
                "1. Go to Meta Developer App → Webhooks → Instagram",
                "2. Set Callback URL to the WebhookUrl above",
                "3. Set Verify Token to the VerifyToken above",
                "4. Subscribe to: messages",
                "5. Enter your Instagram Account ID and Page Access Token in the form below",
                "Note: Your Instagram business account must be connected to a Facebook Page"
            }
        });
    }

    /// <summary>Test Instagram connection by sending a test DM.</summary>
    [HttpPost("instagram/test")]
    public async Task<IActionResult> TestInstagram(
        [FromBody] TestMessageRequest req,
        [FromServices] IInstagramService instagram,
        CancellationToken ct)
    {
        await instagram.SendTextMessageAsync(
            req.ToId,
            "✅ ReplyCart Instagram test message! Your connection is working.",
            ct);
        return Ok(new { message = "Test message sent. Check your Instagram DMs." });
    }

    // ── Facebook ──────────────────────────────────────────────────────────────

    /// <summary>Returns the Facebook Messenger webhook URL and verify token.</summary>
    [HttpGet("facebook/webhook-info")]
    public IActionResult FacebookWebhookInfo()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        return Ok(new
        {
            WebhookUrl = $"{baseUrl}/api/v1/webhooks/facebook",
            VerifyToken = configuration["Facebook:VerifyToken"] ?? "replycart-fb-verify",
            Instructions = new[]
            {
                "1. Go to Meta Developer App → Messenger → Configuration",
                "2. Set Callback URL to the WebhookUrl above",
                "3. Set Verify Token to the VerifyToken above",
                "4. Subscribe to: messages, messaging_postbacks",
                "5. Enter your Facebook Page ID and Page Access Token in the form below"
            }
        });
    }

    /// <summary>Test Facebook Messenger connection by sending a test message.</summary>
    [HttpPost("facebook/test")]
    public async Task<IActionResult> TestFacebook(
        [FromBody] TestMessageRequest req,
        [FromServices] IFacebookService facebook,
        CancellationToken ct)
    {
        await facebook.SendTextMessageAsync(
            req.ToId,
            "✅ ReplyCart Facebook Messenger test message! Your connection is working.",
            ct);
        return Ok(new { message = "Test message sent. Check your Facebook Messenger." });
    }

    // ── Razorpay ──────────────────────────────────────────────────────────────

    /// <summary>Get Razorpay settings for this tenant (secret is masked).</summary>
    [HttpGet("razorpay")]
    public async Task<IActionResult> GetRazorpay(
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        if (business == null) return NotFound();

        var isConfigured = !string.IsNullOrWhiteSpace(business.RazorpayKeyId)
                        && !string.IsNullOrWhiteSpace(business.RazorpayKeySecret);

        // Mask the secret: show only last 4 chars
        string? maskedSecret = null;
        if (!string.IsNullOrWhiteSpace(business.RazorpayKeySecret))
            maskedSecret = new string('*', Math.Max(0, business.RazorpayKeySecret.Length - 4))
                           + business.RazorpayKeySecret[^Math.Min(4, business.RazorpayKeySecret.Length)..];

        return Ok(new RazorpaySettingsResponse(isConfigured, business.RazorpayKeyId, maskedSecret));
    }

    /// <summary>Save Razorpay Key ID and Key Secret for this tenant.</summary>
    [HttpPut("razorpay")]
    public async Task<IActionResult> SaveRazorpay(
        [FromBody] SaveRazorpaySettingsRequest req,
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.KeyId) || string.IsNullOrWhiteSpace(req.KeySecret))
            return BadRequest(new { errors = new[] { "Both Key ID and Key Secret are required." } });

        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        if (business == null) return NotFound();

        business.RazorpayKeyId     = req.KeyId.Trim();
        business.RazorpayKeySecret = req.KeySecret.Trim();

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Remove Razorpay credentials for this tenant.</summary>
    [HttpDelete("razorpay")]
    public async Task<IActionResult> RemoveRazorpay(
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        if (business == null) return NotFound();

        business.RazorpayKeyId     = null;
        business.RazorpayKeySecret = null;

        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record SaveIntegrationSettingsRequest(
    // WhatsApp
    string? WhatsAppPhoneNumberId,
    string? WhatsAppAccessToken,
    string? WhatsAppNumber,
    // Instagram
    string? InstagramAccountId,
    string? InstagramAccessToken,
    // Facebook
    string? FacebookPageId,
    string? FacebookPageAccessToken,
    // Theme
    string? ThemeColor
);

public record TestMessageRequest(string ToId);

// ── Razorpay Settings ─────────────────────────────────────────────────────────
public record SaveRazorpaySettingsRequest(string KeyId, string KeySecret);
public record RazorpaySettingsResponse(bool IsConfigured, string? KeyId, string? MaskedSecret);
