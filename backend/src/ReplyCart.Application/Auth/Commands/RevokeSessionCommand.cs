using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Auth.Commands;

public record RevokeSessionCommand(Guid UserId, Guid SessionId) : IRequest;

public class RevokeSessionCommandHandler(IAppDbContext db)
    : IRequestHandler<RevokeSessionCommand>
{
    public async Task Handle(RevokeSessionCommand request, CancellationToken cancellationToken)
    {
        var token = await db.UserRefreshTokens
            .FirstOrDefaultAsync(t => t.Id == request.SessionId && t.UserId == request.UserId && !t.IsRevoked, cancellationToken)
            ?? throw new NotFoundException("Session", request.SessionId);

        token.IsRevoked = true;
        token.RevokedReason = "user_revoked";
        await db.SaveChangesAsync(cancellationToken);
    }
}


