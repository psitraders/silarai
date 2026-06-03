using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Application.Auth.Commands;

public record RefreshTokenCommand(string RefreshToken) : IRequest<LoginResult>;

public class RefreshTokenCommandHandler(IAppDbContext db, IJwtTokenService jwtService)
    : IRequestHandler<RefreshTokenCommand, LoginResult>
{
    public async Task<LoginResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var hash = jwtService.HashToken(request.RefreshToken);
        var tokenRecord = await db.UserRefreshTokens
            .Include(t => t.User).ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(t => t.User).ThenInclude(u => u.Tenant)
            .FirstOrDefaultAsync(t => t.TokenHash == hash && !t.IsRevoked && t.ExpiresAt > DateTime.UtcNow, cancellationToken)
            ?? throw new ForbiddenException("Invalid or expired refresh token.");

        tokenRecord.IsRevoked = true;
        tokenRecord.RevokedReason = "Rotated";

        var user = tokenRecord.User;
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var newAccess = jwtService.GenerateAccessToken(user.Id, user.TenantId, user.Email, roles);
        var newRefresh = jwtService.GenerateRefreshToken();

        db.UserRefreshTokens.Add(new UserRefreshToken
        {
            UserId = user.Id,
            TokenHash = jwtService.HashToken(newRefresh),
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        });

        await db.SaveChangesAsync(cancellationToken);

        return new LoginResult(newAccess, newRefresh, DateTime.UtcNow.AddMinutes(15),
            user.Id, user.TenantId, user.Name, user.Email, roles);
    }
}


