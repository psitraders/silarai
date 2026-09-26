using System.Security.Cryptography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Team.Queries;
using ReplyCart.Domain.Identity;
using ReplyCart.Shared.Constants;

namespace ReplyCart.Application.Team.Commands;

/// <summary>
/// TenantAdmin invites a Business Admin: creates an inactive-password user with the
/// BusinessAdmin role and emails a one-time link to /accept-invite (see AcceptInviteCommand).
/// </summary>
public record InviteBusinessAdminCommand(string Name, string Email) : IRequest<TeamMemberDto>;

public class InviteBusinessAdminCommandHandler(
    IAppDbContext db,
    ITenantContext tenantContext,
    ICurrentUser currentUser,
    IJwtTokenService jwtService,
    IEmailService emailService) : IRequestHandler<InviteBusinessAdminCommand, TeamMemberDto>
{
    public async Task<TeamMemberDto> Handle(InviteBusinessAdminCommand request, CancellationToken ct)
    {
        var name  = request.Name?.Trim() ?? string.Empty;
        var email = request.Email?.Trim().ToLower() ?? string.Empty;

        if (name.Length == 0)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Name", "Name is required.")]);
        if (email.Length < 5 || !email.Contains('@') || email.StartsWith('@') || email.EndsWith('@'))
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Email", "A valid email address is required.")]);

        // Emails are globally unique across all tenants (unique index on Users.Email).
        if (await db.Users.AnyAsync(u => u.Email == email, ct))
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Email", "An account with this email already exists.")]);

        var tenantId = tenantContext.CurrentTenantId;

        var role = await db.Roles.FirstOrDefaultAsync(r => r.Name == Roles.BusinessAdmin, ct);
        if (role == null)
        {
            role = new Role { Name = Roles.BusinessAdmin, Description = Roles.BusinessAdmin };
            db.Roles.Add(role);
        }

        var user = new User
        {
            TenantId        = tenantId,
            Name            = name,
            Email           = email,
            // Unusable random password until the invite is accepted.
            PasswordHash    = BCrypt.Net.BCrypt.HashPassword(TeamInvites.NewToken()),
            IsActive        = true,
            IsEmailVerified = false,
            CreatedBy       = currentUser.UserId,
        };
        db.Users.Add(user);
        db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id, CreatedBy = currentUser.UserId });

        var rawToken = TeamInvites.AddInvitationToken(db, jwtService, user.Id);
        await db.SaveChangesAsync(ct);

        await TeamInvites.SendAsync(db, emailService, currentUser, tenantId, user, rawToken, ct);

        return GetTeamMembersQueryHandler.ToDto(user.Id, user.Name, user.Email, user.Phone, user.IsActive,
            user.IsEmailVerified, user.CreatedAt, user.LastLoginAt, [Roles.BusinessAdmin]);
    }
}

/// <summary>Re-sends the invitation email with a fresh link (previous links stop working).</summary>
public record ResendBusinessAdminInviteCommand(Guid UserId) : IRequest;

public class ResendBusinessAdminInviteCommandHandler(
    IAppDbContext db,
    ITenantContext tenantContext,
    ICurrentUser currentUser,
    IJwtTokenService jwtService,
    IEmailService emailService) : IRequestHandler<ResendBusinessAdminInviteCommand>
{
    public async Task Handle(ResendBusinessAdminInviteCommand request, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var user = await TeamInvites.FindBusinessAdminAsync(db, tenantId, request.UserId, ct);

        if (!user.IsActive)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("UserId", "Reactivate this admin before re-sending the invitation.")]);
        if (user.IsEmailVerified)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("UserId", "This admin has already accepted the invitation.")]);

        var existing = await db.UserTokens
            .Where(t => t.UserId == user.Id && t.Type == UserTokenType.Invitation && !t.IsUsed)
            .ToListAsync(ct);
        existing.ForEach(t => t.IsUsed = true);

        var rawToken = TeamInvites.AddInvitationToken(db, jwtService, user.Id);
        await db.SaveChangesAsync(ct);

        await TeamInvites.SendAsync(db, emailService, currentUser, tenantId, user, rawToken, ct);
    }
}

/// <summary>Deactivates or reactivates a Business Admin. Deactivation signs them out everywhere.</summary>
public record SetBusinessAdminStatusCommand(Guid UserId, bool IsActive) : IRequest;

public class SetBusinessAdminStatusCommandHandler(
    IAppDbContext db,
    ITenantContext tenantContext,
    ICurrentUser currentUser) : IRequestHandler<SetBusinessAdminStatusCommand>
{
    public async Task Handle(SetBusinessAdminStatusCommand request, CancellationToken ct)
    {
        var user = await TeamInvites.FindBusinessAdminAsync(db, tenantContext.CurrentTenantId, request.UserId, ct);

        user.IsActive  = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = currentUser.UserId;

        if (!request.IsActive)
        {
            // Access tokens expire within 15 min; revoking refresh tokens ends the session after that.
            var refreshTokens = await db.UserRefreshTokens
                .Where(t => t.UserId == user.Id && !t.IsRevoked)
                .ToListAsync(ct);
            refreshTokens.ForEach(t => { t.IsRevoked = true; t.RevokedReason = "deactivated_by_tenant_admin"; });
        }

        await db.SaveChangesAsync(ct);
    }
}

internal static class TeamInvites
{
    public static readonly TimeSpan InviteLifetime = TimeSpan.FromDays(7);

    public static string NewToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(48);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
    }

    public static string AddInvitationToken(IAppDbContext db, IJwtTokenService jwtService, Guid userId)
    {
        var rawToken = NewToken();
        db.UserTokens.Add(new UserToken
        {
            UserId    = userId,
            Type      = UserTokenType.Invitation,
            TokenHash = jwtService.HashToken(rawToken),
            ExpiresAt = DateTime.UtcNow.Add(InviteLifetime),
        });
        return rawToken;
    }

    /// <summary>Loads a Business Admin of this tenant; the TenantAdmin (owner) can never be managed here.</summary>
    public static async Task<User> FindBusinessAdminAsync(IAppDbContext db, Guid tenantId, Guid userId, CancellationToken ct)
    {
        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.TenantId == tenantId, ct)
            ?? throw new NotFoundException(nameof(User), userId);

        if (!user.UserRoles.Any(ur => ur.Role.Name == Roles.BusinessAdmin))
            throw new ForbiddenException("Only Business Admins can be managed here.");

        return user;
    }

    public static async Task SendAsync(IAppDbContext db, IEmailService emailService, ICurrentUser currentUser,
        Guid tenantId, User invitee, string rawToken, CancellationToken ct)
    {
        var storeName = await db.Businesses
            .Where(b => b.TenantId == tenantId)
            .Select(b => b.Name)
            .FirstOrDefaultAsync(ct);
        storeName ??= await db.Tenants.Where(t => t.Id == tenantId).Select(t => t.Name).FirstOrDefaultAsync(ct) ?? "your store";

        var inviterName = currentUser.UserId is Guid inviterId
            ? await db.Users.Where(u => u.Id == inviterId).Select(u => u.Name).FirstOrDefaultAsync(ct)
            : null;

        await emailService.SendBusinessAdminInviteAsync(
            invitee.Email, invitee.Name, storeName, inviterName ?? "The store owner", rawToken, ct);
    }
}
