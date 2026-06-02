using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Application.Auth.Commands;

public record VerifyEmailCommand(string Token) : IRequest;

public class VerifyEmailCommandHandler(IAppDbContext db, IJwtTokenService jwtService)
    : IRequestHandler<VerifyEmailCommand>
{
    public async Task Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var hash = jwtService.HashToken(request.Token);
        var userToken = await db.UserTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.TokenHash == hash &&
                t.Type == UserTokenType.EmailVerification &&
                !t.IsUsed &&
                t.ExpiresAt > DateTime.UtcNow,
                cancellationToken)
            ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure("Token", "Invalid or expired verification link.")]);

        userToken.IsUsed = true;
        userToken.User.IsEmailVerified = true;
        await db.SaveChangesAsync(cancellationToken);
    }
}
