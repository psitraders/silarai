using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Auth.Commands;

public record LogoutCommand(string RefreshToken) : IRequest;

public class LogoutCommandHandler(IAppDbContext db, IJwtTokenService jwtService)
    : IRequestHandler<LogoutCommand>
{
    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken)) return;

        var hash = jwtService.HashToken(request.RefreshToken);
        var token = await db.UserRefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == hash && !t.IsRevoked, cancellationToken);

        if (token != null)
        {
            token.IsRevoked = true;
            token.RevokedReason = "logout";
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
