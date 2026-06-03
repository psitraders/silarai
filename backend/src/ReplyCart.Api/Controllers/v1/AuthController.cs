using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Auth.Commands;
using ReplyCart.Application.Auth.Queries;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(IMediator mediator) : ControllerBase
{
    // ── Registration & Login ──────────────────────────────────────────────────

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new RegisterTenantCommand(
            request.BusinessName, request.OwnerName, request.Email, request.Password, request.Phone,
            request.Country ?? "India", request.Language ?? "en", request.Currency ?? "INR"), ct);

        // Auto-send email verification — fire and forget so a transient email
        // failure never blocks account creation.
        _ = mediator.Send(new SendEmailVerificationCommand(result.Email), CancellationToken.None);

        return Ok(new { result.TenantId, result.UserId, result.Email, message = "Registration successful. Please check your email to verify your account." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new LoginCommand(request.Email, request.Password, request.DeviceInfo, request.TotpCode), ct);
        if (result.RequiresTwoFactor)
            return Ok(new { requiresTwoFactor = true });
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new RefreshTokenCommand(request.RefreshToken), ct);
        return Ok(result);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request, CancellationToken ct)
    {
        await mediator.Send(new LogoutCommand(request.RefreshToken), ct);
        return Ok(new { message = "Logged out successfully." });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var userId = User.FindFirst("sub")?.Value;
        var email = User.FindFirst("email")?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);
        return Ok(new { userId, email, roles });
    }

    // ── Email verification ────────────────────────────────────────────────────

    [HttpPost("send-verification")]
    [Authorize]
    public async Task<IActionResult> SendVerification(CancellationToken ct)
    {
        var email = User.FindFirst("email")?.Value ?? "";
        await mediator.Send(new SendEmailVerificationCommand(email), ct);
        return Ok(new { message = "Verification email sent." });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request, CancellationToken ct)
    {
        await mediator.Send(new VerifyEmailCommand(request.Token), ct);
        return Ok(new { message = "Email verified successfully." });
    }

    // ── Password reset ────────────────────────────────────────────────────────

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        await mediator.Send(new ForgotPasswordCommand(request.Email), ct);
        // Always return success to prevent email enumeration
        return Ok(new { message = "If that email is registered, a 6-digit code has been sent." });
    }

    [HttpPost("verify-reset-otp")]
    public async Task<IActionResult> VerifyResetOtp([FromBody] VerifyResetOtpRequest request, CancellationToken ct)
    {
        var token = await mediator.Send(new VerifyResetOtpCommand(request.Email, request.Otp), ct);
        return Ok(new { token });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        await mediator.Send(new ResetPasswordCommand(request.Token, request.NewPassword), ct);
        return Ok(new { message = "Password reset successfully. Please login with your new password." });
    }

    // ── Profile & password (authenticated) ───────────────────────────────────

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        await mediator.Send(new UpdateProfileCommand(userId, request.Name, request.Phone, request.AvatarUrl), ct);
        return Ok(new { message = "Profile updated." });
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        await mediator.Send(new ChangePasswordCommand(userId, request.CurrentPassword, request.NewPassword), ct);
        return Ok(new { message = "Password changed successfully." });
    }

    // ── Sessions ──────────────────────────────────────────────────────────────

    [HttpGet("sessions")]
    [Authorize]
    public async Task<IActionResult> GetSessions(CancellationToken ct)
    {
        var userId = GetUserId();
        var sessions = await mediator.Send(new GetSessionsQuery(userId), ct);
        return Ok(sessions);
    }

    [HttpDelete("sessions/{sessionId:guid}")]
    [Authorize]
    public async Task<IActionResult> RevokeSession(Guid sessionId, CancellationToken ct)
    {
        var userId = GetUserId();
        await mediator.Send(new RevokeSessionCommand(userId, sessionId), ct);
        return Ok(new { message = "Session revoked." });
    }

    // ── TOTP / 2FA ────────────────────────────────────────────────────────────

    /// <summary>Returns whether TOTP is currently enabled for the signed-in user.</summary>
    [HttpGet("totp/status")]
    [Authorize]
    public async Task<IActionResult> TotpStatus(
        [FromServices] ReplyCart.Infrastructure.Persistence.AppDbContext db,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var user = await db.Users.FindAsync([userId], ct);
        return Ok(new { enabled = user?.IsTwoFactorEnabled ?? false });
    }

    [HttpPost("totp/setup")]
    [Authorize]
    public async Task<IActionResult> SetupTotp(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await mediator.Send(new SetupTotpCommand(userId), ct);
        return Ok(result);
    }

    [HttpPost("totp/verify")]
    [Authorize]
    public async Task<IActionResult> VerifyTotp([FromBody] TotpCodeRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        await mediator.Send(new VerifyTotpCommand(userId, request.Code), ct);
        return Ok(new { message = "Two-factor authentication enabled." });
    }

    [HttpPost("totp/disable")]
    [Authorize]
    public async Task<IActionResult> DisableTotp([FromBody] DisableTotpRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        await mediator.Send(new DisableTotpCommand(userId, request.Password), ct);
        return Ok(new { message = "Two-factor authentication disabled." });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid GetUserId()
        => Guid.Parse(User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token."));
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

public record RegisterRequest(string BusinessName, string OwnerName, string Email, string Password, string? Phone, string? Country, string? Language, string? Currency);
public record LoginRequest(string Email, string Password, string? DeviceInfo, string? TotpCode = null);
public record RefreshRequest(string RefreshToken);
public record LogoutRequest(string RefreshToken);
public record VerifyEmailRequest(string Token);
public record ForgotPasswordRequest(string Email);
public record VerifyResetOtpRequest(string Email, string Otp);
public record ResetPasswordRequest(string Token, string NewPassword);
public record UpdateProfileRequest(string Name, string? Phone, string? AvatarUrl);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record TotpCodeRequest(string Code);
public record DisableTotpRequest(string Password);


