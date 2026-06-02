using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Identity;
using ReplyCart.Domain.Tenancy;
using ReplyCart.Shared.Constants;

namespace ReplyCart.Application.Auth.Commands;

public record RegisterTenantCommand(
    string BusinessName,
    string OwnerName,
    string Email,
    string Password,
    string? Phone
) : IRequest<RegisterTenantResult>;

public record RegisterTenantResult(Guid TenantId, Guid UserId, string Email);

public class RegisterTenantCommandHandler(IAppDbContext db, IJwtTokenService jwtService)
    : IRequestHandler<RegisterTenantCommand, RegisterTenantResult>
{
    public async Task<RegisterTenantResult> Handle(RegisterTenantCommand request, CancellationToken cancellationToken)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email.ToLower(), cancellationToken))
            throw new ValidationException([new FluentValidation.Results.ValidationFailure("Email", "An account with this email already exists.")]);

        var slug = GenerateSlug(request.BusinessName);
        var counter = 0;
        var originalSlug = slug;
        while (await db.Tenants.AnyAsync(t => t.Slug == slug, cancellationToken))
            slug = $"{originalSlug}-{++counter}";

        var tenant = new Tenant
        {
            Name = request.BusinessName,
            Slug = slug,
            ContactEmail = request.Email.ToLower(),
            ContactPhone = request.Phone
        };
        db.Tenants.Add(tenant);

        var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == Roles.TenantAdmin, cancellationToken)
            ?? CreateDefaultRole(Roles.TenantAdmin);

        var user = new User
        {
            TenantId = tenant.Id,
            Name = request.OwnerName,
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone
        };
        db.Users.Add(user);

        db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = adminRole.Id });

        var basicPlan = await db.SubscriptionPlans.FirstOrDefaultAsync(p => p.Slug == "basic", cancellationToken);
        if (basicPlan != null)
        {
            db.TenantSubscriptions.Add(new TenantSubscription
            {
                TenantId = tenant.Id,
                PlanId = basicPlan.Id,
                Status = SubscriptionStatus.Trial,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(10),
                IsAnnual = false,
                PricePaid = 0,
            });
        }

        await db.SaveChangesAsync(cancellationToken);
        return new RegisterTenantResult(tenant.Id, user.Id, user.Email);
    }

    private static string GenerateSlug(string name)
    {
        return new string(name.ToLower()
            .Replace(" ", "-")
            .Where(c => char.IsLetterOrDigit(c) || c == '-')
            .ToArray())
            .Trim('-');
    }

    private Role CreateDefaultRole(string roleName)
    {
        var role = new Role { Name = roleName, Description = roleName };
        db.Roles.Add(role);
        return role;
    }
}
