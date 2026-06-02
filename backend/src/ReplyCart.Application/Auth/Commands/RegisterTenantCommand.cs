using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
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
    string Phone,         // required — must be OTP-verified before this is called
    string Country = "India",
    string Language = "en",
    string Currency = "INR"
) : IRequest<RegisterTenantResult>;

public record RegisterTenantResult(Guid TenantId, Guid UserId, string Email);

public class RegisterTenantCommandHandler(IAppDbContext db, IJwtTokenService jwtService, IMemoryCache cache)
    : IRequestHandler<RegisterTenantCommand, RegisterTenantResult>
{
    // Email OTP verified prefix — set by OtpController.VerifyRegistrationEmail
    private const string EmailVerifiedPrefix = "email_reg_verified:";

    public async Task<RegisterTenantResult> Handle(RegisterTenantCommand request, CancellationToken cancellationToken)
    {
        var phone = new string(request.Phone.Where(char.IsDigit).ToArray());

        if (string.IsNullOrEmpty(phone) || phone.Length < 6)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Phone", "A valid mobile number is required.")]);

        // Ensure the email was verified via OTP before account creation
        var emailKey = request.Email.Trim().ToLower();
        if (!cache.TryGetValue(EmailVerifiedPrefix + emailKey, out bool emailVerified) || !emailVerified)
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                "Email", "Email must be verified with the OTP code before registering.")]);

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
            ContactPhone = phone
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
            Phone = phone
        };
        db.Users.Add(user);

        db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = adminRole.Id });

        // Seed Business record with locale preferences chosen during registration
        var business = new Domain.Business.Business
        {
            TenantId = tenant.Id,
            Name = request.BusinessName,
            Category = string.Empty,
            Currency = request.Currency,
            Country = request.Country,
            Language = request.Language,
        };
        db.Businesses.Add(business);

        // Auto-create StorefrontSettings so the store link is visible immediately
        // in the sidebar without requiring the owner to visit Storefront Settings first.
        db.StorefrontSettings.Add(new Domain.Business.StorefrontSettings
        {
            TenantId = tenant.Id,
            BusinessId = business.Id,
            Slug = slug,        // same slug as Tenant.Slug, generated from business name
        });

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

        // Invalidate the email-verified token — it's been consumed
        cache.Remove(EmailVerifiedPrefix + emailKey);

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
