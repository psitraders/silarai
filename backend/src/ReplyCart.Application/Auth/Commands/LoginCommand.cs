using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Identity;

namespace ReplyCart.Application.Auth.Commands;

public record LoginCommand(string Email, string Password, string? DeviceInfo) : IRequest<LoginResult>;

public record LoginResult(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiry,
    Guid UserId,
    Guid TenantId,
    string Name,
    string Email,
    IEnumerable<string> Roles
);

public class LoginCommandHandler(IAppDbContext db, IJwtTokenService jwtService)
    : IRequestHandler<LoginCommand, LoginResult>
{
    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower() && u.IsActive, cancellationToken)
            ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure("Email", "Invalid email or password.")]);

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Password", "Invalid email or password.")]);

        if (!user.Tenant.IsActive)
            throw new ForbiddenException("Your account has been suspended. Please contact support.");

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var accessToken = jwtService.GenerateAccessToken(user.Id, user.TenantId, user.Email, roles);
        var refreshToken = jwtService.GenerateRefreshToken();

        user.LastLoginAt = DateTime.UtcNow;
        db.UserRefreshTokens.Add(new UserRefreshToken
        {
            UserId = user.Id,
            TokenHash = jwtService.HashToken(refreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            DeviceInfo = request.DeviceInfo
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
