using System.Security.Cryptography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Application.Auth.Commands;

public record SendEmailVerificationCommand(string Email) : IRequest;

public class SendEmailVerificationCommandHandler(IAppDbContext db, IJwtTokenService jwtService, IEmailService emailService)
    : IRequestHandler<SendEmailVerificationCommand>
{
    public async Task Handle(SendEmailVerificationCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower(), cancellationToken)
            ?? throw new NotFoundException("User", request.Email);

        if (user.IsEmailVerified)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Email", "Email is already verified.")]);

        // Invalidate any existing verification tokens
        var existing = await db.UserTokens
            .Where(t => t.UserId == user.Id && t.Type == UserTokenType.EmailVerification && !t.IsUsed)
            .ToListAsync(cancellationToken);
        existing.ForEach(t => t.IsUsed = true);

        // Generate new token
        var rawToken = GenerateToken();
        db.UserTokens.Add(new UserToken
        {
            UserId = user.Id,
            Type = UserTokenType.EmailVerification,
            TokenHash = jwtService.HashToken(rawToken),
            ExpiresAt = DateTime.UtcNow.AddHours(24),
        });

        await db.SaveChangesAsync(cancellationToken);
        await emailService.SendEmailVerificationAsync(user.Email, user.Name, rawToken, cancellationToken);
    }

    private static string GenerateToken()
    {
        var bytes = new byte[48];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
    }
}
