using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Shared.Constants;

namespace ReplyCart.Application.Team.Queries;

/// <summary>A dashboard user of the current tenant (the owner or a Business Admin).</summary>
public record TeamMemberDto(
    Guid Id,
    string Name,
    string Email,
    string? Phone,
    string Role,
    string Status,          // "Active" | "Invited" | "Deactivated"
    DateTime CreatedAt,
    DateTime? LastLoginAt);

public record GetTeamMembersQuery : IRequest<List<TeamMemberDto>>;

public class GetTeamMembersQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetTeamMembersQuery, List<TeamMemberDto>>
{
    public async Task<List<TeamMemberDto>> Handle(GetTeamMembersQuery request, CancellationToken ct)
    {
        var tenantId = tenantContext.CurrentTenantId;

        // User is not a TenantEntity (no global tenant filter) — scope explicitly.
        var users = await db.Users
            .Where(u => u.TenantId == tenantId)
            .OrderBy(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id, u.Name, u.Email, u.Phone, u.IsActive, u.IsEmailVerified, u.CreatedAt, u.LastLoginAt,
                Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList(),
            })
            .ToListAsync(ct);

        return users.Select(u => ToDto(u.Id, u.Name, u.Email, u.Phone, u.IsActive, u.IsEmailVerified,
            u.CreatedAt, u.LastLoginAt, u.Roles)).ToList();
    }

    internal static TeamMemberDto ToDto(Guid id, string name, string email, string? phone, bool isActive,
        bool isEmailVerified, DateTime createdAt, DateTime? lastLoginAt, IReadOnlyCollection<string> roles)
    {
        var isBusinessAdmin = roles.Contains(Roles.BusinessAdmin);
        var role = roles.Contains(Roles.TenantAdmin) ? Roles.TenantAdmin
                 : isBusinessAdmin ? Roles.BusinessAdmin
                 : roles.FirstOrDefault() ?? string.Empty;

        var status = !isActive ? "Deactivated"
                   : isBusinessAdmin && !isEmailVerified ? "Invited"   // invite not accepted yet
                   : "Active";

        return new TeamMemberDto(id, name, email, phone, role, status, createdAt, lastLoginAt);
    }
}
