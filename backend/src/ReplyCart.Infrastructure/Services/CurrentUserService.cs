using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Services;

// MapInboundClaims = false is set in Program.cs, so all claim types use the
// literal JWT payload key names ("sub", "email", "tid", etc.) rather than the
// long CLR URI aliases (ClaimTypes.NameIdentifier, ClaimTypes.Email, …).
public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    private ClaimsPrincipal? Principal => httpContextAccessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            // "sub" is the JWT standard for subject (user ID). With MapInboundClaims = false
            // it is never remapped to ClaimTypes.NameIdentifier.
            var value = Principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public Guid? TenantId
    {
        get
        {
            var value = Principal?.FindFirstValue("tid");
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    // "email" is already the short JWT name; no change needed.
    public string? Email => Principal?.FindFirstValue(JwtRegisteredClaimNames.Email);

    // We don't currently write a "name" claim to the JWT, so this stays null.
    public string? Name => Principal?.FindFirstValue("name");

    // Roles are stored with the full ClaimTypes.Role URI as the claim type (the JWT
    // outbound map doesn't remap ClaimTypes.Role), so we still look them up that way.
    public IEnumerable<string> Roles =>
        Principal?.FindAll(ClaimTypes.Role).Select(c => c.Value) ?? [];

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated == true;

    public bool IsInRole(string role) => Principal?.IsInRole(role) == true;
}
