using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Application.Auth.Commands;

public record VerifyOtpCommand(string Phone, string Otp, string? DeviceInfo) : IRequest<LoginResult>;

public class VerifyOtpCommandHandler(IAppDbContext db, IOtpService otpService, IJwtTokenService jwtService)
    : IRequestHandler<VerifyOtpCommand, LoginResult>
{
    public async Task<LoginResult> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        var phone = new string(request.Phone.Where(char.IsDigit).ToArray());

        var valid = await otpService.VerifyOtpAsync(phone, request.Otp.Trim(), cancellationToken);
        if (!valid)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Otp", "Invalid or expired OTP. Please request a new one.")]);

        var user = await db.Users
            .IgnoreQueryFilters()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Phone == phone && u.IsActive, cancellationToken)
            ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Phone", "No active account found for this number.")]);

        if (!user.Tenant.IsActive)
            throw new ForbiddenException("Your account has been suspended. Please contact support.");

        var roles        = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var accessToken  = jwtService.GenerateAccessToken(user.Id, user.TenantId, user.Email, roles);
        var refreshToken = jwtService.GenerateRefreshToken();

        user.LastLoginAt = DateTime.UtcNow;
        db.UserRefreshTokens.Add(new UserRefreshToken
        {
            UserId    = user.Id,
            TokenHash = jwtService.HashToken(refreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
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


