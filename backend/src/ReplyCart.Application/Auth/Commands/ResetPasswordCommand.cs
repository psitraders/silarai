using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Application.Auth.Commands;

public record ResetPasswordCommand(string Token, string NewPassword) : IRequest;

public class ResetPasswordCommandHandler(IAppDbContext db, IJwtTokenService jwtService)
    : IRequestHandler<ResetPasswordCommand>
{
    public async Task Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var hash = jwtService.HashToken(request.Token);
        var userToken = await db.UserTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.TokenHash == hash &&
                t.Type == UserTokenType.PasswordReset &&
                !t.IsUsed &&
                t.ExpiresAt > DateTime.UtcNow,
                cancellationToken)
            ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure("Token", "Invalid or expired reset link.")]);

        if (request.NewPassword.Length < 8)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("NewPassword", "Password must be at least 8 characters.")]);

        userToken.IsUsed = true;
        userToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        // Revoke all refresh tokens for security
        var refreshTokens = await db.UserRefreshTokens
            .Where(t => t.UserId == userToken.UserId && !t.IsRevoked)
            .ToListAsync(cancellationToken);
        refreshTokens.ForEach(t => { t.IsRevoked = true; t.RevokedReason = "password_reset"; });

        await db.SaveChangesAsync(cancellationToken);
    }
}


