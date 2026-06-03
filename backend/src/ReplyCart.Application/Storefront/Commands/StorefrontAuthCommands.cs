using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Customers;
using ReplyCart.Domain.Storefront;

namespace ReplyCart.Application.Storefront.Commands;

// ── Register ──────────────────────────────────────────────────────────────────

public record StorefrontRegisterCommand(
    Guid TenantId,
    string Name,
    string Email,
    string Password,
    string? PhoneNumber,
    bool IsB2BCustomer,
    string? CompanyName,
    string? GstNumber
) : IRequest<StorefrontAuthResult>;

// ── Login ─────────────────────────────────────────────────────────────────────

public record StorefrontLoginCommand(
    Guid TenantId,
    string Email,
    string Password
) : IRequest<StorefrontAuthResult>;

// ── Shared result ─────────────────────────────────────────────────────────────

public record StorefrontAuthResult(
    string AccessToken,
    Guid CustomerId,
    string Name,
    string Email,
    bool IsB2BCustomer,
    bool IsB2BApproved,
    int LoyaltyPoints
);

// ── Handlers ──────────────────────────────────────────────────────────────────

public class StorefrontRegisterHandler(IAppDbContext db, IJwtTokenService jwt)
    : IRequestHandler<StorefrontRegisterCommand, StorefrontAuthResult>
{
    public async Task<StorefrontAuthResult> Handle(StorefrontRegisterCommand req, CancellationToken ct)
    {
        var exists = await db.StorefrontCustomers
            .AnyAsync(c => c.TenantId == req.TenantId && c.Email == req.Email.ToLower(), ct);
        if (exists)
            throw new InvalidOperationException("An account with this email already exists.");

        var normalizedEmail = req.Email.Trim().ToLower();
        var normalizedPhone = req.PhoneNumber?.Trim() ?? string.Empty;

        var customer = new StorefrontCustomer
        {
            TenantId      = req.TenantId,
            Name          = req.Name.Trim(),
            Email         = normalizedEmail,
            PasswordHash  = BCrypt.Net.BCrypt.HashPassword(req.Password),
            PhoneNumber   = req.PhoneNumber,
            IsB2BCustomer = req.IsB2BCustomer,
            CompanyName   = req.CompanyName,
            GstNumber     = req.GstNumber,
            IsB2BApproved = false,
        };

        db.StorefrontCustomers.Add(customer);

        // ── Also upsert a CRM Customer so they appear in the merchant's Customers list ──
        Customer? crmCustomer = null;

        if (!string.IsNullOrEmpty(normalizedEmail))
            crmCustomer = await db.Customers
                .FirstOrDefaultAsync(c => c.TenantId == req.TenantId && c.Email == normalizedEmail, ct);

        if (crmCustomer == null && !string.IsNullOrEmpty(normalizedPhone))
            crmCustomer = await db.Customers
                .FirstOrDefaultAsync(c => c.TenantId == req.TenantId && c.PhoneNumber == normalizedPhone, ct);

        if (crmCustomer == null)
        {
            crmCustomer = new Customer
            {
                TenantId    = req.TenantId,
                Name        = req.Name.Trim(),
                Email       = normalizedEmail,
                PhoneNumber = normalizedPhone,
                Tags        = req.IsB2BCustomer ? "b2b" : null,
            };
            db.Customers.Add(crmCustomer);
        }
        else
        {
            // Enrich existing record with any missing data
            if (string.IsNullOrEmpty(crmCustomer.Email) && !string.IsNullOrEmpty(normalizedEmail))
                crmCustomer.Email = normalizedEmail;
            if (string.IsNullOrEmpty(crmCustomer.PhoneNumber) && !string.IsNullOrEmpty(normalizedPhone))
                crmCustomer.PhoneNumber = normalizedPhone;

            // Add "b2b" tag if registering as a B2B customer
            if (req.IsB2BCustomer)
            {
                var existingTags = (crmCustomer.Tags ?? "")
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim())
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);
                if (!existingTags.Contains("b2b"))
                {
                    existingTags.Add("b2b");
                    crmCustomer.Tags = string.Join(", ", existingTags);
                }
            }
        }

        customer.LinkedCrmCustomerId = crmCustomer.Id;
        await db.SaveChangesAsync(ct);

        var token = jwt.GenerateAccessToken(
            customer.Id, customer.TenantId, customer.Email,
            ["StorefrontCustomer"]);

        return new StorefrontAuthResult(token, customer.Id, customer.Name, customer.Email,
            customer.IsB2BCustomer, customer.IsB2BApproved, customer.LoyaltyPoints);
    }
}

public class StorefrontLoginHandler(IAppDbContext db, IJwtTokenService jwt)
    : IRequestHandler<StorefrontLoginCommand, StorefrontAuthResult>
{
    public async Task<StorefrontAuthResult> Handle(StorefrontLoginCommand req, CancellationToken ct)
    {
        var customer = await db.StorefrontCustomers
            .FirstOrDefaultAsync(c => c.TenantId == req.TenantId && c.Email == req.Email.ToLower(), ct)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(req.Password, customer.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        var token = jwt.GenerateAccessToken(
            customer.Id, customer.TenantId, customer.Email,
            ["StorefrontCustomer"]);

        return new StorefrontAuthResult(token, customer.Id, customer.Name, customer.Email,
            customer.IsB2BCustomer, customer.IsB2BApproved, customer.LoyaltyPoints);
    }
}


