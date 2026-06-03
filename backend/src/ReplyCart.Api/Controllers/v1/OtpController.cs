using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using ReplyCart.Application.Auth.Commands;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Platform-level OTP endpoints — public, no auth required.
/// </summary>
[ApiController]
[Route("api/v1/auth/otp")]
public class OtpController(IMediator mediator, IOtpService otpService, IEmailService emailService, IMemoryCache cache) : ControllerBase
{
    // ── Phone OTP: Login flow ─────────────────────────────────────────────────

    private const string PhoneVerifiedPrefix = "phone_verified:";
    private static readonly TimeSpan PhoneVerifiedTtl = TimeSpan.FromMinutes(15);

    /// <summary>Send OTP for login. Phone must belong to an existing active account.</summary>
    [HttpPost("send")]
    public async Task<IActionResult> Send([FromBody] SendOtpRequest req, CancellationToken ct)
    {
        await mediator.Send(new SendOtpCommand(req.Phone), ct);
        return Ok(new { message = "OTP sent. Check your SMS." });
    }

    /// <summary>Verify OTP and return JWT tokens (login complete).</summary>
    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] VerifyOtpRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(new VerifyOtpCommand(req.Phone, req.Otp, req.DeviceInfo), ct);
        return Ok(result);
    }

    // ── Email OTP: Registration flow ──────────────────────────────────────────

    private const string EmailOtpPrefix      = "email_reg_otp:";
    private const string EmailVerifiedPrefix  = "email_reg_verified:";
    private static readonly TimeSpan OtpTtl      = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan VerifiedTtl = TimeSpan.FromMinutes(15);

    /// <summary>
    /// Send a 6-digit OTP to the registering user's email.
    /// Rate-limited: waits 60 s between resends.
    /// </summary>
    [HttpPost("send-registration-email")]
    public async Task<IActionResult> SendRegistrationEmail([FromBody] SendEmailOtpRequest req, CancellationToken ct)
    {
        var email = req.Email?.Trim().ToLower();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return BadRequest(new { errors = new[] { "Enter a valid email address." } });

        // Rate-limit: block if an OTP was sent in the last 60 s
        var cooldownKey = $"email_otp_cooldown:{email}";
        if (cache.TryGetValue(cooldownKey, out _))
            return BadRequest(new { errors = new[] { "Please wait 60 seconds before requesting a new code." } });

        // Generate 6-digit OTP
        var otp = Random.Shared.Next(100_000, 999_999).ToString();
        cache.Set(EmailOtpPrefix + email, otp, OtpTtl);
        cache.Set(cooldownKey, true, TimeSpan.FromSeconds(60));

        // Send email (from support@silarai.app)
        var name = req.Name?.Trim() ?? "there";
        try
        {
            await emailService.SendRegistrationOtpAsync(email, name, otp, ct);
        }
        catch (Exception ex)
        {
            // Surface the real SMTP error in the response so it's visible during setup
            var detail = ex.InnerException?.Message ?? ex.Message;
            return StatusCode(502, new { errors = new[] { $"Email send failed: {detail}" } });
        }

        return Ok(new { message = "Verification code sent. Check your inbox (and spam folder)." });
    }

    /// <summary>
    /// Verify the email OTP during registration.
    /// On success, marks the email as verified in cache for 15 min so RegisterTenantCommand can proceed.
    /// </summary>
    [HttpPost("verify-registration-email")]
    public IActionResult VerifyRegistrationEmail([FromBody] VerifyEmailOtpRequest req)
    {
        var email = req.Email?.Trim().ToLower();
        var otp   = req.Otp?.Trim();

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp))
            return BadRequest(new { errors = new[] { "Email and code are required." } });

        if (!cache.TryGetValue(EmailOtpPrefix + email, out string? stored) || stored != otp)
            return BadRequest(new { errors = new[] { "Invalid or expired code. Please request a new one." } });

        // Consume OTP and mark email as verified
        cache.Remove(EmailOtpPrefix + email);
        cache.Set(EmailVerifiedPrefix + email, true, VerifiedTtl);

        return Ok(new { verified = true });
    }

    // ── Email OTP: Login flow ─────────────────────────────────────────────────

    /// <summary>Send a 6-digit OTP to the user's registered email for login.</summary>
    [HttpPost("send-login-email")]
    public async Task<IActionResult> SendLoginEmail([FromBody] SendEmailOtpRequest req, CancellationToken ct)
    {
        var email = req.Email?.Trim().ToLower();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return BadRequest(new { errors = new[] { "Enter a valid email address." } });

        try
        {
            await mediator.Send(new SendLoginEmailOtpCommand(email), ct);
        }
        catch (Exception ex)
        {
            var msg = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(new { errors = new[] { msg } });
        }

        return Ok(new { message = "Verification code sent. Check your inbox." });
    }

    /// <summary>Verify email OTP and return JWT tokens (login complete).</summary>
    [HttpPost("verify-login-email")]
    public async Task<IActionResult> VerifyLoginEmail([FromBody] VerifyEmailOtpRequest req, CancellationToken ct)
    {
        try
        {
            var result = await mediator.Send(
                new VerifyLoginEmailOtpCommand(req.Email, req.Otp, HttpContext.Request.Headers["User-Agent"]), ct);
            return Ok(result);
        }
        catch (Exception ex)
        {
            var msg = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(new { errors = new[] { msg } });
        }
    }

    // ── Legacy SMS registration endpoints (kept for backwards compat) ─────────

    /// <summary>Send SMS OTP for registration (legacy — now unused by frontend).</summary>
    [HttpPost("send-registration")]
    public async Task<IActionResult> SendRegistration([FromBody] SendOtpRequest req, CancellationToken ct)
    {
        var phone = new string(req.Phone.Where(char.IsDigit).ToArray());
        if (phone.Length < 6)
            return BadRequest(new { errors = new[] { "Enter a valid mobile number." } });

        var sent = await otpService.SendOtpAsync(phone, ct);
        if (!sent)
            return BadRequest(new { errors = new[] { "Could not send OTP. Please try again." } });

        return Ok(new { message = "OTP sent. Check your SMS." });
    }

    /// <summary>Skip SMS OTP for international numbers (legacy — now unused by frontend).</summary>
    [HttpPost("skip-registration")]
    public IActionResult SkipRegistration([FromBody] SendOtpRequest req)
    {
        var phone = new string(req.Phone.Where(char.IsDigit).ToArray());
        if (phone.Length < 6)
            return BadRequest(new { errors = new[] { "Enter a valid mobile number." } });

        cache.Set(PhoneVerifiedPrefix + phone, true, PhoneVerifiedTtl);
        return Ok(new { message = "Phone accepted." });
    }

    /// <summary>Check SMS OTP during registration (legacy — now unused by frontend).</summary>
    [HttpPost("check")]
    public async Task<IActionResult> Check([FromBody] VerifyOtpRequest req, CancellationToken ct)
    {
        var phone = new string(req.Phone.Where(char.IsDigit).ToArray());
        var valid = await otpService.VerifyOtpAsync(phone, req.Otp.Trim(), ct);
        if (!valid)
            return BadRequest(new { errors = new[] { "Invalid or expired OTP. Please try again." } });

        cache.Set(PhoneVerifiedPrefix + phone, true, PhoneVerifiedTtl);
        return Ok(new { valid = true });
    }
}

public record SendOtpRequest(string Phone);
public record VerifyOtpRequest(string Phone, string Otp, string? DeviceInfo = null);
public record SendEmailOtpRequest(string Email, string? Name = null);
public record VerifyEmailOtpRequest(string Email, string Otp);


