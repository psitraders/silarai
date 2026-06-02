using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Application.Auth.Commands;

public record VerifyLoginEmailOtpCommand(string Email, string Otp, string? DeviceInfo) : IRequest<LoginResult>;

public class VerifyLoginEmailOtpCommandHandler(
    IAppDbContext db,
    IJwtTokenService jwtService,
    IMemoryCache cache)
    : IRequestHandler<VerifyLoginEmailOtpCommand, LoginResult>
{
    private const string OtpPrefix = "login_otp_email:";

    public async Task<LoginResult> Handle(VerifyLoginEmailOtpCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();

        // Verify OTP
        if (!cache.TryGetValue(OtpPrefix + email, out string? stored) || stored != request.Otp.Trim())
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Otp", "Invalid or expired code. Please request a new one.")]);

        cache.Remove(OtpPrefix + email);

        // Load user
        var user = await db.Users
            .IgnoreQueryFilters()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email == email && u.IsActive, cancellationToken)
            ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Email", "No active account found with this email address.")]);

        if (!user.Tenant.IsActive)
            throw new ForbiddenException("Your account has been suspended. Please contact support.");

        var roles        = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var accessToken  = jwtService.GenerateAccessToken(user.Id, user.TenantId, user.Email, roles);
        var refreshToken = jwtService.GenerateRefreshToken();

        user.LastLoginAt = DateTime.UtcNow;
        db.UserRefreshTokens.Add(new UserRefreshToken
        {
            UserId     = user.Id,
            TokenHash  = jwtService.HashToken(refreshToken),
            ExpiresAt  = DateTime.UtcNow.AddDays(30),
            DeviceInfo = request.DeviceInfo,
        });

        await db.SaveChangesAsync(cancellationToken);

        return new LoginResult(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddMinutes(15),
            user.Id,
            user.TenantId,
            user.Name,
            user.Email,
            roles
        );
    }
}
