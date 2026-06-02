using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReplyCart.Application.Auth.Commands;

namespace ReplyCart.Api.Controllers.v1;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new RegisterTenantCommand(
            request.BusinessName, request.OwnerName, request.Email, request.Password, request.Phone), ct);
        return Ok(new { result.TenantId, result.UserId, result.Email, message = "Registration successful. Please login." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new LoginCommand(request.Email, request.Password, request.DeviceInfo), ct);
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
    public IActionResult Logout() => Ok(new { message = "Logged out successfully." });

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        // MapInboundClaims = false → use raw JWT names, not CLR URI aliases.
        var userId = User.FindFirst("sub")?.Value;
        var email = User.FindFirst("email")?.Value;
        var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value);
        return Ok(new { userId, email, roles });
    }
}

public record RegisterRequest(string BusinessName, string OwnerName, string Email, string Password, string? Phone);
public record LoginRequest(string Email, string Password, string? DeviceInfo);
public record RefreshRequest(string RefreshToken);
