using System.Text.Json;
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
public class IntegrationsController(
    IMediator mediator,
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory,
    ILogger<IntegrationsController> logger) : ControllerBase
{
    /// <summary>GET current integration settings for this tenant.</summary>
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await mediator.Send(new GetIntegrationSettingsQuery(), ct);
        return Ok(result);
    }

    /// <summary>Save Instagram, Facebook, Payment and Theme settings.</summary>
    [HttpPut]
    public async Task<IActionResult> Save([FromBody] SaveIntegrationSettingsRequest req, CancellationToken ct)
    {
        await mediator.Send(new SaveIntegrationSettingsCommand(
            req.InstagramAccountId,
            req.InstagramAccessToken,
            req.FacebookPageId,
            req.FacebookPageAccessToken,
            req.PaymentGateway,
            req.StripeSecretKey,
            req.PayPalClientId,
            req.PayPalClientSecret,
            req.PayPalSandbox,
            req.ThemeColor ?? "#0F766E"
        ), ct);

        // Subscribe the Facebook Page to this app so webhook events flow through
        if (!string.IsNullOrWhiteSpace(req.FacebookPageId) &&
            !string.IsNullOrWhiteSpace(req.FacebookPageAccessToken))
        {
            try
            {
                var http = httpClientFactory.CreateClient();
                var subUrl = $"https://graph.facebook.com/v19.0/{req.FacebookPageId}/subscribed_apps" +
                             $"?subscribed_fields=messages,messaging_postbacks,messaging_optins" +
                             $"&access_token={req.FacebookPageAccessToken}";
                var subResp = await http.PostAsync(subUrl, null, ct);
                var subBody = await subResp.Content.ReadAsStringAsync(ct);
                logger.LogInformation("Facebook page subscription response: {Body}", subBody);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to subscribe Facebook page — webhook events may not arrive");
            }
        }

        return NoContent();
    }

    // ── WhatsApp Embedded Signup ──────────────────────────────────────────────

    /// <summary>
    /// Returns the Meta App ID and Embedded Signup config ID needed by the frontend
    /// to initialise the Facebook JS SDK and launch the signup popup.
    /// </summary>
    [HttpGet("whatsapp/embedded-signup-config")]
    public IActionResult EmbeddedSignupConfig()
    {
        var appId    = configuration["Meta:AppId"];
        var configId = configuration["Meta:EmbeddedSignupConfigId"];

        if (string.IsNullOrEmpty(appId))
            return StatusCode(503, new { message = "Meta App ID is not configured on the server." });

        return Ok(new { appId, configId });
    }

    /// <summary>
    /// Completes the WhatsApp Embedded Signup flow.
    /// Receives the short-lived user access token from the FB JS SDK,
    /// exchanges it for a long-lived token (60 days), then stores credentials per tenant.
    /// </summary>
    [HttpPost("whatsapp/connect")]
    public async Task<IActionResult> ConnectWhatsApp(
        [FromBody] ConnectWhatsAppRequest req,
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        var appId     = configuration["Meta:AppId"];
        var appSecret = configuration["Meta:AppSecret"];

        if (string.IsNullOrEmpty(appId) || string.IsNullOrEmpty(appSecret))
            return StatusCode(503, new { message = "Meta App credentials are not configured on the server." });

        if (string.IsNullOrEmpty(req.AccessToken))
            return BadRequest(new { message = "Access token is required." });

        // PhoneNumberId is optional — auto-detected from Graph API when not captured by JS events.

        var http = httpClientFactory.CreateClient();

        // ── Step 1: Exchange short-lived user token → long-lived token (60 days) ──
        // FB.login() gives a short-lived (~1h) user access token directly.
        // We exchange it server-side for a 60-day token using the app secret.
        string accessToken;
        try
        {
            var longUrl  = $"https://graph.facebook.com/v19.0/oauth/access_token" +
                           $"?grant_type=fb_exchange_token&client_id={appId}&client_secret={appSecret}" +
                           $"&fb_exchange_token={Uri.EscapeDataString(req.AccessToken)}";
            var longResp = await http.GetAsync(longUrl, ct);
            var longBody = await longResp.Content.ReadAsStringAsync(ct);

            if (!longResp.IsSuccessStatusCode)
            {
                logger.LogWarning("Long-lived token exchange failed — using short-lived token. {Body}", longBody);
                accessToken = req.AccessToken; // fall back: short-lived token still works for ~1h
            }
            else
            {
                var longJson = JsonSerializer.Deserialize<JsonElement>(longBody);
                accessToken  = longJson.GetProperty("access_token").GetString() ?? req.AccessToken;
            }
        }
        catch
        {
            accessToken = req.AccessToken; // non-fatal — short-lived token still works for ~1 hour
        }

        // ── Step 3: Auto-detect PhoneNumberId + WabaId if frontend didn't capture them ───
        // This happens when config_id is not set (no Embedded Signup config) — the JS event
        // never fires, so we fall back to fetching via the Graph API.
        var resolvedPhoneNumberId = string.IsNullOrEmpty(req.PhoneNumberId) ? null : req.PhoneNumberId.Trim();
        var resolvedWabaId        = req.WabaId?.Trim();
        string? displayNumber     = null;

        if (string.IsNullOrEmpty(resolvedPhoneNumberId))
        {
            logger.LogInformation("PhoneNumberId not captured — auto-detecting via Graph API for tenant {TenantId}", tenantContext.CurrentTenantId);

            string wabaApiResponse  = "";
            string phoneApiResponse = "";

            try
            {
                // ── Correct 3-step path: /me/businesses → /{biz}/whatsapp_business_accounts → /{waba}/phone_numbers
                // NOTE: /me/whatsapp_business_accounts does NOT exist as a direct edge on the user node.
                //       The correct path requires the business_management permission + going through businesses.

                var bizUrl  = $"https://graph.facebook.com/v19.0/me/businesses" +
                              $"?fields=id,name&access_token={accessToken}";
                var bizResp = await http.GetAsync(bizUrl, ct);
                var bizBody = await bizResp.Content.ReadAsStringAsync(ct);
                logger.LogInformation("Meta /me/businesses: {Body}", bizBody);
                wabaApiResponse = bizBody;

                if (bizResp.IsSuccessStatusCode)
                {
                    var bizJson = JsonSerializer.Deserialize<JsonElement>(bizBody);
                    if (bizJson.TryGetProperty("data", out var bizArr))
                    {
                        foreach (var biz in bizArr.EnumerateArray())
                        {
                            if (!biz.TryGetProperty("id", out var bizIdProp)) continue;
                            var bizId = bizIdProp.GetString()!;

                            var wabaUrl  = $"https://graph.facebook.com/v19.0/{bizId}/whatsapp_business_accounts" +
                                           $"?fields=id,name&access_token={accessToken}";
                            var wabaResp = await http.GetAsync(wabaUrl, ct);
                            var wabaBody = await wabaResp.Content.ReadAsStringAsync(ct);
                            logger.LogInformation("Meta /{BizId}/whatsapp_business_accounts: {Body}", bizId, wabaBody);
                            wabaApiResponse += " | " + wabaBody;

                            if (!wabaResp.IsSuccessStatusCode) continue;

                            var wabaJson = JsonSerializer.Deserialize<JsonElement>(wabaBody);
                            if (!wabaJson.TryGetProperty("data", out var wabaArr)) continue;

                            foreach (var waba in wabaArr.EnumerateArray())
                            {
                                if (!waba.TryGetProperty("id", out var wabaIdProp)) continue;
                                resolvedWabaId = wabaIdProp.GetString()!;

                                var phoneUrl  = $"https://graph.facebook.com/v19.0/{resolvedWabaId}/phone_numbers" +
                                               $"?fields=id,display_phone_number,verified_name&access_token={accessToken}";
                                var phoneResp = await http.GetAsync(phoneUrl, ct);
                                phoneApiResponse = await phoneResp.Content.ReadAsStringAsync(ct);
                                logger.LogInformation("Meta phone_numbers for WABA {WabaId}: {Body}", resolvedWabaId, phoneApiResponse);

                                if (!phoneResp.IsSuccessStatusCode) continue;

                                var phoneJson = JsonSerializer.Deserialize<JsonElement>(phoneApiResponse);
                                if (!phoneJson.TryGetProperty("data", out var phoneArr)
                                    || phoneArr.GetArrayLength() == 0) continue;

                                resolvedPhoneNumberId = phoneArr[0].GetProperty("id").GetString();
                                displayNumber = phoneArr[0].TryGetProperty("display_phone_number", out var dpn)
                                    ? dpn.GetString() : null;
                                goto FoundPhone; // break out of nested loops
                            }
                        }
                    }
                }
                FoundPhone:;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Auto-detect phone number from Graph API failed");
            }

            if (string.IsNullOrEmpty(resolvedPhoneNumberId))
                return BadRequest(new
                {
                    message = "Could not find a WhatsApp Business phone number on your account. " +
                              "Make sure you have a WhatsApp Business Account set up in Meta Business Manager " +
                              "and it is connected to the ReplyCart app.",
                    // Return raw API responses in dev/debug so you can diagnose
                    wabaResponse  = wabaApiResponse,
                    phoneResponse = phoneApiResponse,
                });
        }
        else
        {
            // PhoneNumberId was captured by frontend — just fetch the display number
            try
            {
                var numUrl  = $"https://graph.facebook.com/v19.0/{resolvedPhoneNumberId}?fields=display_phone_number&access_token={accessToken}";
                var numResp = await http.GetAsync(numUrl, ct);
                if (numResp.IsSuccessStatusCode)
                {
                    var numBody = await numResp.Content.ReadAsStringAsync(ct);
                    var numJson = JsonSerializer.Deserialize<JsonElement>(numBody);
                    displayNumber = numJson.TryGetProperty("display_phone_number", out var prop)
                        ? prop.GetString() : null;
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not fetch display phone number for {PhoneNumberId}", resolvedPhoneNumberId);
            }
        }

        // ── Step 4: Persist per-tenant credentials ───────────────────────────
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        if (business == null)
            return NotFound(new { message = "Business profile not found. Please complete onboarding first." });

        business.WhatsAppPhoneNumberId = resolvedPhoneNumberId;
        business.WhatsAppWabaId        = resolvedWabaId;
        business.WhatsAppAccessToken   = accessToken;
        if (!string.IsNullOrEmpty(displayNumber))
            business.WhatsAppNumber = displayNumber;

        await db.SaveChangesAsync(ct);

        logger.LogInformation(
            "WhatsApp connected for tenant {TenantId} — PhoneNumberId={PhoneNumberId} Number={Number}",
            tenantContext.CurrentTenantId, resolvedPhoneNumberId, displayNumber);

        return Ok(new
        {
            message         = "WhatsApp connected successfully!",
            phoneNumber     = displayNumber,
            phoneNumberId   = resolvedPhoneNumberId,
        });
    }

    /// <summary>Disconnects WhatsApp for this tenant by clearing stored credentials.</summary>
    [HttpDelete("whatsapp/disconnect")]
    public async Task<IActionResult> DisconnectWhatsApp(
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        if (business == null) return NotFound();

        business.WhatsAppPhoneNumberId = null;
        business.WhatsAppWabaId        = null;
        business.WhatsAppAccessToken   = null;

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Send a test WhatsApp text message to verify the connection.</summary>
    [HttpPost("whatsapp/test")]
    public async Task<IActionResult> TestWhatsApp(
        [FromBody] TestMessageRequest req,
        [FromServices] IWhatsAppService whatsApp,
        CancellationToken ct)
    {
        if (!whatsApp.IsConfigured)
            return BadRequest(new { message = "WhatsApp is not connected. Use the 'Connect with Facebook' button first." });

        // Use hello_world template — plain text messages require an open 24-hour
        // conversation window, which won't exist during a connection test.
        await whatsApp.SendTemplateMessageAsync(
            req.ToId,
            templateName:  "hello_world",
            languageCode:  "en_US",
            bodyParams:    null,
            ct);
        return Ok(new { message = "Test message sent! Check your WhatsApp." });
    }

    /// <summary>Returns the Meta webhook URL and verify token for the developer app setup.</summary>
    [HttpGet("whatsapp/webhook-info")]
    public IActionResult WhatsAppWebhookInfo()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        return Ok(new
        {
            WebhookUrl  = $"{baseUrl}/api/v1/webhooks/whatsapp",
            VerifyToken = configuration["WhatsApp:VerifyToken"] ?? "replycart-verify-2024",
            Instructions = new[]
            {
                "1. Go to your Meta Developer App → WhatsApp → Configuration",
                "2. Set Callback URL to the WebhookUrl above",
                "3. Set Verify Token to the VerifyToken above",
                "4. Subscribe to: messages",
                "5. Incoming customer WhatsApp messages will now create leads in ReplyCart automatically",
            }
        });
    }

    // ── Instagram ─────────────────────────────────────────────────────────────

    [HttpGet("instagram/webhook-info")]
    public IActionResult InstagramWebhookInfo()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        return Ok(new
        {
            WebhookUrl  = $"{baseUrl}/api/v1/webhooks/instagram",
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

    [HttpGet("facebook/webhook-info")]
    public IActionResult FacebookWebhookInfo()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        return Ok(new
        {
            WebhookUrl  = $"{baseUrl}/api/v1/webhooks/facebook",
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

        string? maskedSecret = null;
        if (!string.IsNullOrWhiteSpace(business.RazorpayKeySecret))
            maskedSecret = new string('*', Math.Max(0, business.RazorpayKeySecret.Length - 4))
                           + business.RazorpayKeySecret[^Math.Min(4, business.RazorpayKeySecret.Length)..];

        return Ok(new RazorpaySettingsResponse(isConfigured, business.RazorpayKeyId, maskedSecret));
    }

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

    // ── Stripe ────────────────────────────────────────────────────────────────

    [HttpGet("stripe")]
    public async Task<IActionResult> GetStripe(
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        var business = await db.Businesses.FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);
        if (business == null) return NotFound();
        var isConfigured = !string.IsNullOrWhiteSpace(business.StripeSecretKey);
        string? maskedKey = isConfigured && business.StripeSecretKey!.Length > 6
            ? "••••••••••••" + business.StripeSecretKey![^6..] : null;
        return Ok(new { isConfigured, maskedKey });
    }

    [HttpPut("stripe")]
    public async Task<IActionResult> SaveStripe(
        [FromBody] SaveStripeRequest req,
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.SecretKey))
            return BadRequest(new { errors = new[] { "Secret key is required." } });
        var business = await db.Businesses.FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);
        if (business == null) return NotFound();
        business.StripeSecretKey = req.SecretKey.Trim();
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("stripe")]
    public async Task<IActionResult> RemoveStripe(
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        var business = await db.Businesses.FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);
        if (business == null) return NotFound();
        business.StripeSecretKey = null;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── PayPal ────────────────────────────────────────────────────────────────

    [HttpGet("paypal")]
    public async Task<IActionResult> GetPayPal(
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        var business = await db.Businesses.FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);
        if (business == null) return NotFound();
        var isConfigured = !string.IsNullOrWhiteSpace(business.PayPalClientId)
                        && !string.IsNullOrWhiteSpace(business.PayPalClientSecret);
        string? maskedSecret = isConfigured && business.PayPalClientSecret!.Length > 6
            ? "••••••••••••" + business.PayPalClientSecret![^6..] : null;
        return Ok(new { isConfigured, clientId = business.PayPalClientId, maskedSecret, sandbox = business.PayPalSandbox });
    }

    [HttpPut("paypal")]
    public async Task<IActionResult> SavePayPal(
        [FromBody] SavePayPalRequest req,
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.ClientId) || string.IsNullOrWhiteSpace(req.ClientSecret))
            return BadRequest(new { errors = new[] { "Client ID and Client Secret are required." } });
        var business = await db.Businesses.FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);
        if (business == null) return NotFound();
        business.PayPalClientId     = req.ClientId.Trim();
        business.PayPalClientSecret = req.ClientSecret.Trim();
        business.PayPalSandbox      = req.Sandbox;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("paypal")]
    public async Task<IActionResult> RemovePayPal(
        [FromServices] AppDbContext db,
        [FromServices] ITenantContext tenantContext,
        CancellationToken ct)
    {
        var business = await db.Businesses.FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);
        if (business == null) return NotFound();
        business.PayPalClientId     = null;
        business.PayPalClientSecret = null;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

// ── Request / Response DTOs ───────────────────────────────────────────────────

public record SaveIntegrationSettingsRequest(
    // Instagram
    string? InstagramAccountId,
    string? InstagramAccessToken,
    // Facebook
    string? FacebookPageId,
    string? FacebookPageAccessToken,
    // Payment gateway
    string? PaymentGateway,
    string? StripeSecretKey,
    string? PayPalClientId,
    string? PayPalClientSecret,
    bool?   PayPalSandbox,
    // Theme
    string? ThemeColor
);

public record ConnectWhatsAppRequest(
    /// <summary>Short-lived user access token from FB.login() authResponse.</summary>
    string  AccessToken,
    /// <summary>Meta Phone Number ID — captured from WhatsAppBusinessEmbeddedSignup event (may be empty; backend auto-detects).</summary>
    string  PhoneNumberId,
    /// <summary>WABA ID — captured from WhatsAppBusinessEmbeddedSignup event (may be empty; backend auto-detects).</summary>
    string? WabaId
);

public record TestMessageRequest(string ToId);

public record SaveRazorpaySettingsRequest(string KeyId, string KeySecret);
public record RazorpaySettingsResponse(bool IsConfigured, string? KeyId, string? MaskedSecret);
public record SaveStripeRequest(string SecretKey);
public record SavePayPalRequest(string ClientId, string ClientSecret, bool Sandbox);


