using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Auth.Commands;

public record SendLoginEmailOtpCommand(string Email) : IRequest;

public class SendLoginEmailOtpCommandHandler(
    IAppDbContext db,
    IEmailService emailService,
    IMemoryCache cache)
    : IRequestHandler<SendLoginEmailOtpCommand>
{
    private const string OtpPrefix      = "login_otp_email:";
    private const string CooldownPrefix = "login_otp_cooldown:";

    public async Task Handle(SendLoginEmailOtpCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();

        // Verify account exists
        var user = await db.Users
            .IgnoreQueryFilters()
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email == email && u.IsActive, cancellationToken)
            ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Email", "No active account found with this email address.")]);

        if (!user.Tenant.IsActive)
            throw new ForbiddenException("Your account has been suspended. Please contact support.");

        // Rate limit: one OTP per 60 s
        if (cache.TryGetValue(CooldownPrefix + email, out _))
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Email", "Please wait 60 seconds before requesting a new code.")]);

        var otp = Random.Shared.Next(100_000, 999_999).ToString();
        cache.Set(OtpPrefix + email, otp, TimeSpan.FromMinutes(10));
        cache.Set(CooldownPrefix + email, true, TimeSpan.FromSeconds(60));

        try
        {
            await emailService.SendRegistrationOtpAsync(email, user.Name, otp, cancellationToken);
        }
        catch (Exception ex)
        {
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Email", $"Could not send verification email: {ex.InnerException?.Message ?? ex.Message}")]);
        }
    }
}


