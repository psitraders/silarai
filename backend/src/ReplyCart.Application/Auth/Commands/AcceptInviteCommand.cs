using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Application.Auth.Commands;

/// <summary>
/// Anonymous: an invited Business Admin sets their password from the emailed invitation link.
/// Accepting also verifies their email (they proved access to the inbox).
/// </summary>
public record AcceptInviteCommand(string Token, string Password) : IRequest;

public class AcceptInviteCommandHandler(IAppDbContext db, IJwtTokenService jwtService)
    : IRequestHandler<AcceptInviteCommand>
{
    public async Task Handle(AcceptInviteCommand request, CancellationToken cancellationToken)
    {
        var invalid = new ValidationException([new FluentValidation.Results.ValidationFailure("Token", "Invalid or expired invitation link.")]);
        if (string.IsNullOrWhiteSpace(request.Token)) throw invalid;

        var hash = jwtService.HashToken(request.Token);
        var userToken = await db.UserTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.TokenHash == hash &&
                t.Type == UserTokenType.Invitation &&
                !t.IsUsed &&
                t.ExpiresAt > DateTime.UtcNow,
                cancellationToken)
            ?? throw invalid;

        if (!userToken.User.IsActive) throw invalid;

        if ((request.Password ?? string.Empty).Length < 8)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Password", "Password must be at least 8 characters.")]);

        userToken.IsUsed = true;
        userToken.User.PasswordHash    = BCrypt.Net.BCrypt.HashPassword(request.Password);
        userToken.User.IsEmailVerified = true;
        userToken.User.UpdatedAt       = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }
}
