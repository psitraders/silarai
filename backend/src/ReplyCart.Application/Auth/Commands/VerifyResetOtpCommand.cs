using System.Security.Cryptography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Application.Auth.Commands;

public record VerifyResetOtpCommand(string Email, string Otp) : IRequest<string>;

public class VerifyResetOtpCommandHandler(IAppDbContext db, IJwtTokenService jwtService, IMemoryCache cache)
    : IRequestHandler<VerifyResetOtpCommand, string>
{
    private const string OtpPrefix = "pwd_reset_otp:";

    public async Task<string> Handle(VerifyResetOtpCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();

        if (!cache.TryGetValue(OtpPrefix + email, out string? stored) || stored != request.Otp.Trim())
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Otp", "Invalid or expired code. Please request a new one.")]);

        cache.Remove(OtpPrefix + email);

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken)
            ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Email", "Account not found.")]);

        // Invalidate any existing reset tokens
        var existing = await db.UserTokens
            .Where(t => t.UserId == user.Id && t.Type == UserTokenType.PasswordReset && !t.IsUsed)
            .ToListAsync(cancellationToken);
        existing.ForEach(t => t.IsUsed = true);

        // Generate a short-lived (15 min) DB reset token
        var rawToken = GenerateToken();
        db.UserTokens.Add(new UserToken
        {
            UserId    = user.Id,
            Type      = UserTokenType.PasswordReset,
            TokenHash = jwtService.HashToken(rawToken),
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
        });

        await db.SaveChangesAsync(cancellationToken);
        return rawToken;
    }

    private static string GenerateToken()
    {
        var bytes = new byte[48];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
    }
}
