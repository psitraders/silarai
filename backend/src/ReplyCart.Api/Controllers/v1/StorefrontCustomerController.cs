using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Storefront.Commands;
using ReplyCart.Application.Storefront.Queries;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>
/// Public storefront customer auth + account management.
/// Auth endpoints are anonymous; account endpoints require "StorefrontCustomer" role.
/// </summary>
[ApiController]
[Route("api/v1/public/{slug}/customer")]
public class StorefrontCustomerController(
    IMediator mediator,
    AppDbContext db) : ControllerBase
{
    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Guid?> ResolveSlugAsync(string slug, CancellationToken ct)
    {
        var tenant = await db.Tenants.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == slug, ct);
        return tenant?.Id;
    }

    private Guid CallerCustomerId =>
        Guid.Parse(User.FindFirstValue("sub")!);

    private Guid CallerTenantId =>
        Guid.Parse(User.FindFirstValue("tid")!);

    // ── Register ──────────────────────────────────────────────────────────────

    [HttpPost("register")]
    public async Task<IActionResult> Register(string slug,
        [FromBody] StorefrontRegisterRequest req, CancellationToken ct)
    {
        var tenantId = await ResolveSlugAsync(slug, ct);
        if (tenantId == null) return NotFound(new { error = "Store not found." });

        try
        {
            var result = await mediator.Send(new StorefrontRegisterCommand(
                tenantId.Value, req.Name, req.Email, req.Password,
                req.PhoneNumber, req.IsB2BCustomer, req.CompanyName, req.GstNumber), ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    [HttpPost("login")]
    public async Task<IActionResult> Login(string slug,
        [FromBody] StorefrontLoginRequest req, CancellationToken ct)
    {
        var tenantId = await ResolveSlugAsync(slug, ct);
        if (tenantId == null) return NotFound(new { error = "Store not found." });

        try
        {
            var result = await mediator.Send(new StorefrontLoginCommand(
                tenantId.Value, req.Email, req.Password), ct);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    [HttpGet("profile")]
    [Authorize(Roles = "StorefrontCustomer")]
    public async Task<IActionResult> GetProfile(string slug, CancellationToken ct)
    {
        var profile = await mediator.Send(
            new GetStorefrontProfileQuery(CallerCustomerId, CallerTenantId), ct);
        return profile == null ? NotFound() : Ok(profile);
    }

    // ── Orders ────────────────────────────────────────────────────────────────

    [HttpGet("orders")]
    [Authorize(Roles = "StorefrontCustomer")]
    public async Task<IActionResult> GetOrders(string slug, CancellationToken ct)
    {
        var orders = await mediator.Send(
            new GetStorefrontOrdersQuery(CallerCustomerId, CallerTenantId), ct);
        return Ok(orders);
    }

    // ── Wishlist ──────────────────────────────────────────────────────────────

    [HttpGet("wishlist")]
    [Authorize(Roles = "StorefrontCustomer")]
    public async Task<IActionResult> GetWishlist(string slug, CancellationToken ct)
    {
        var items = await mediator.Send(
            new GetWishlistQuery(CallerCustomerId, CallerTenantId), ct);
        return Ok(items);
    }

    [HttpPost("wishlist/{productId:guid}")]
    [Authorize(Roles = "StorefrontCustomer")]
    public async Task<IActionResult> ToggleWishlist(string slug, Guid productId, CancellationToken ct)
    {
        var result = await mediator.Send(
            new ToggleWishlistCommand(CallerCustomerId, CallerTenantId, productId), ct);
        return Ok(result);
    }

    // ── My quote requests ─────────────────────────────────────────────────────

    [HttpGet("quotes")]
    [Authorize(Roles = "StorefrontCustomer")]
    public async Task<IActionResult> GetMyQuotes(string slug, CancellationToken ct)
    {
        var quotes = await mediator.Send(
            new GetMyQuotesQuery(CallerCustomerId, CallerTenantId), ct);
        return Ok(quotes);
    }
}

// ── Quote (no auth required) ──────────────────────────────────────────────────

[ApiController]
[Route("api/v1/public/{slug}/quotes")]
public class StorefrontQuoteController(
    IMediator mediator,
    AppDbContext db,
    IEmailService emailService,
    ILogger<StorefrontQuoteController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Submit(string slug,
        [FromBody] SubmitQuoteRequest req, CancellationToken ct)
    {
        var tenant = await db.Tenants.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == slug, ct);
        if (tenant == null) return NotFound(new { error = "Store not found." });

        Guid? customerId = null;
        if (User.Identity?.IsAuthenticated == true && User.IsInRole("StorefrontCustomer"))
            customerId = Guid.Parse(User.FindFirstValue("sub")!);

        var id = await mediator.Send(new SubmitQuoteCommand(
            tenant.Id, customerId,
            req.ContactName, req.ContactEmail, req.ContactPhone,
            req.CompanyName, req.GstNumber,
            req.ItemsJson, req.Notes), ct);

        // ── Notify the store owner (fire-and-forget — never blocks the buyer) ──
        if (!string.IsNullOrWhiteSpace(tenant.ContactEmail))
        {
            var ownerEmail = tenant.ContactEmail;
            var storeName  = tenant.Name;
            _ = Task.Run(async () =>
            {
                try
                {
                    var itemLines = new List<string>();
                    try
                    {
                        using var doc = System.Text.Json.JsonDocument.Parse(req.ItemsJson);
                        foreach (var el in doc.RootElement.EnumerateArray())
                        {
                            var title = el.TryGetProperty("title", out var t) ? t.GetString() : null;
                            var qty   = el.TryGetProperty("qty", out var q) ? q.GetInt32() : 0;
                            if (!string.IsNullOrWhiteSpace(title))
                                itemLines.Add($"{title} × {qty}");
                        }
                    }
                    catch { /* malformed items — send without lines */ }

                    await emailService.SendNewQuoteNotificationAsync(
                        ownerEmail, storeName, storeName,
                        req.ContactName, req.CompanyName, req.ContactEmail, req.ContactPhone,
                        itemLines, req.Notes, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Quote notification email failed for tenant {Tenant}", storeName);
                }
            }, CancellationToken.None);
        }

        return Ok(new { quoteId = id, message = "Quote submitted. We'll get back to you shortly." });
    }
}

// ── Wholesale tiers (public) ──────────────────────────────────────────────────

[ApiController]
[Route("api/v1/public/{slug}/products/{productId:guid}/wholesale-tiers")]
public class PublicWholesaleTiersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(string slug, Guid productId, CancellationToken ct)
    {
        var tiers = await mediator.Send(new GetWholesaleTiersQuery(productId), ct);
        return Ok(tiers);
    }
}

// ── Request models ────────────────────────────────────────────────────────────

public record StorefrontRegisterRequest(
    string Name,
    string Email,
    string Password,
    string? PhoneNumber,
    bool IsB2BCustomer = false,
    string? CompanyName = null,
    string? GstNumber = null
);

public record StorefrontLoginRequest(string Email, string Password);

public record SubmitQuoteRequest(
    string ContactName,
    string ContactEmail,
    string? ContactPhone,
    string? CompanyName,
    string? GstNumber,
    string ItemsJson,
    string? Notes
);


