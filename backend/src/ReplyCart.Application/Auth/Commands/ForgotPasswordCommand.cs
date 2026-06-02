using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Auth.Commands;

public record ForgotPasswordCommand(string Email) : IRequest;

public class ForgotPasswordCommandHandler(IAppDbContext db, IEmailService emailService, IMemoryCache cache)
    : IRequestHandler<ForgotPasswordCommand>
{
    private const string OtpPrefix      = "pwd_reset_otp:";
    private const string CooldownPrefix = "pwd_reset_cooldown:";

    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();

        // Intentionally silent if user not found (prevent email enumeration)
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user == null) return;

        // Rate limit: one OTP per 60 s
        if (cache.TryGetValue(CooldownPrefix + email, out _)) return;

        var otp = Random.Shared.Next(100_000, 999_999).ToString();
        cache.Set(OtpPrefix + email, otp, TimeSpan.FromMinutes(10));
        cache.Set(CooldownPrefix + email, true, TimeSpan.FromSeconds(60));

        await emailService.SendRegistrationOtpAsync(email, user.Name, otp, cancellationToken);
    }
}
