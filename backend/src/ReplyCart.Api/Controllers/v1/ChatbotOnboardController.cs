using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Domain.Config;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Identity;
using ReplyCart.Domain.Tenancy;
using ReplyCart.Infrastructure.Persistence;
using ReplyCart.Shared.Constants;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Public endpoint — no auth required.
/// Called by the landing-page chatbot to create a real tenant account
/// without requiring email OTP verification.
/// Rate-limited to 1 account per email address.
/// </summary>
[ApiController]
[Route("api/v1/chatbot")]
public class ChatbotOnboardController(AppDbContext db) : ControllerBase
{
    public record OnboardRequest(
        string BusinessName,
        string OwnerName,
        string Email,
        string Phone,
        string Country,
        string? BusinessType
    );

    public record OnboardResult(
        string Slug,
        string StoreUrl,
        string LoginUrl,
        string TempPassword,
        string Message
    );

    [HttpPost("onboard")]
    public async Task<IActionResult> Onboard([FromBody] OnboardRequest req, CancellationToken ct)
    {
        // ── Basic validation ──────────────────────────────────────────────────
        if (string.IsNullOrWhiteSpace(req.BusinessName))
            return BadRequest(new { message = "Business name is required." });
        if (string.IsNullOrWhiteSpace(req.Email) || !req.Email.Contains('@'))
            return BadRequest(new { message = "A valid email address is required." });
        if (string.IsNullOrWhiteSpace(req.Phone))
            return BadRequest(new { message = "Phone number is required." });

        var email = req.Email.Trim().ToLower();
        var phone = new string(req.Phone.Where(char.IsDigit).ToArray());

        if (phone.Length < 6)
            return BadRequest(new { message = "Please enter a valid phone number." });

        // ── Duplicate check ────────────────────────────────────────────────────
        if (await db.Users.AnyAsync(u => u.Email == email, ct))
            return Conflict(new { message = "An account with this email already exists. Please log in." });

        // ── Generate temp password  e.g. Welcome@4821 ─────────────────────────
        var rng  = new Random();
        var tempPassword = $"Welcome@{rng.Next(1000, 9999)}";

        // ── Generate unique slug ───────────────────────────────────────────────
        var slug = GenerateSlug(req.BusinessName);
        var originalSlug = slug;
        var counter = 0;
        while (await db.Tenants.AnyAsync(t => t.Slug == slug, ct))
            slug = $"{originalSlug}-{++counter}";

        // ── Determine currency from country ────────────────────────────────────
        var (currency, language) = CountryDefaults(req.Country);

        // ── Create Tenant ──────────────────────────────────────────────────────
        var tenant = new Tenant
        {
            Name             = req.BusinessName.Trim(),
            Slug             = slug,
            ContactEmail     = email,
            ContactPhone     = phone,
            IsActive         = true,
            IsEmailVerified  = true,   // chatbot-created accounts skip OTP
        };
        db.Tenants.Add(tenant);

        // ── Create User ────────────────────────────────────────────────────────
        var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == Roles.TenantAdmin, ct);
        if (adminRole is null)
        {
            adminRole = new Role { Name = Roles.TenantAdmin, Description = Roles.TenantAdmin };
            db.Roles.Add(adminRole);
        }

        var user = new User
        {
            TenantId        = tenant.Id,
            Name            = req.OwnerName.Trim(),
            Email           = email,
            PasswordHash    = BCrypt.Net.BCrypt.HashPassword(tempPassword),
            Phone           = phone,
            IsActive        = true,
            IsEmailVerified = true,
        };
        db.Users.Add(user);
        db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = adminRole.Id });

        // ── Create Business ────────────────────────────────────────────────────
        var business = new Domain.Business.Business
        {
            TenantId = tenant.Id,
            Name     = req.BusinessName.Trim(),
            Category = req.BusinessType ?? string.Empty,
            Currency = currency,
            Country  = req.Country.Trim(),
            Language = language,
        };
        db.Businesses.Add(business);

        // ── Create StorefrontSettings ──────────────────────────────────────────
        db.StorefrontSettings.Add(new Domain.Business.StorefrontSettings
        {
            TenantId   = tenant.Id,
            BusinessId = business.Id,
            Slug       = slug,
        });

        // ── Trial subscription ─────────────────────────────────────────────────
        var basicPlan = await db.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Slug == "basic", ct);
        if (basicPlan is not null)
        {
            db.TenantSubscriptions.Add(new TenantSubscription
            {
                TenantId  = tenant.Id,
                PlanId    = basicPlan.Id,
                Status    = SubscriptionStatus.Trial,
                StartDate = DateTime.UtcNow,
                EndDate   = DateTime.UtcNow.AddDays(14),
                IsAnnual  = false,
                PricePaid = 0,
            });
        }

        await db.SaveChangesAsync(ct);

        // ── Upsert PlatformLead as "converted" (best-effort — never blocks store creation) ──
        try
        {
            var existingLead = await db.PlatformLeads
                .FirstOrDefaultAsync(l => l.Email == email, ct);
            if (existingLead is null)
            {
                db.PlatformLeads.Add(new PlatformLead
                {
                    Name         = req.OwnerName.Trim(),
                    Email        = email,
                    Phone        = phone,
                    BusinessType = req.BusinessType,
                    Source       = "chatbot",
                    Status       = "converted",
                    IpAddress    = HttpContext.Connection.RemoteIpAddress?.ToString(),
                });
            }
            else
            {
                existingLead.Status = "converted";
                existingLead.Phone  = phone;
            }
            await db.SaveChangesAsync(ct);
        }
        catch { /* lead upsert is non-critical — store already created above */ }

        // ── Build response URLs ────────────────────────────────────────────────
        var appBase  = "https://silarai.app";
        var storeUrl = $"{appBase}/store/{slug}";
        var loginUrl = $"{appBase}/auth/login";

        return Ok(new OnboardResult(
            Slug:         slug,
            StoreUrl:     storeUrl,
            LoginUrl:     loginUrl,
            TempPassword: tempPassword,
            Message:      $"Store created! Login at {loginUrl} with your email and password: {tempPassword}"
        ));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string GenerateSlug(string name) =>
        new string(name.ToLower().Replace(" ", "-")
            .Where(c => char.IsLetterOrDigit(c) || c == '-').ToArray())
            .Trim('-');

    private static (string currency, string language) CountryDefaults(string country) =>
        country.ToLower() switch
        {
            "india" or "in"                    => ("INR", "en"),
            "united states" or "us" or "usa"   => ("USD", "en"),
            "united kingdom" or "uk" or "gb"   => ("GBP", "en"),
            "uae" or "dubai" or "ae"           => ("AED", "en"),
            "australia" or "au"                => ("AUD", "en"),
            "canada" or "ca"                   => ("CAD", "en"),
            "singapore" or "sg"                => ("SGD", "en"),
            "malaysia" or "my"                 => ("MYR", "en"),
            "germany" or "de"                  => ("EUR", "de"),
            "france" or "fr"                   => ("EUR", "fr"),
            "saudi arabia" or "ksa" or "sa"    => ("SAR", "ar"),
            _                                   => ("USD", "en"),
        };
}

