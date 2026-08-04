using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Storefront.Commands;
using ReplyCart.Infrastructure.Persistence;

namespace ReplyCart.Api.Controllers.v1;

/// <summary>Merchant-facing B2B management: wholesale tiers + quote inbox.</summary>
[ApiController]
[Route("api/v1/b2b")]
[Authorize]
public class B2BController(
    IMediator mediator,
    AppDbContext db,
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<B2BController> logger) : ControllerBase
{
    // ── Wholesale tiers ───────────────────────────────────────────────────────

    [HttpPut("products/{productId:guid}/wholesale-tiers")]
    public async Task<IActionResult> UpsertTiers(Guid productId,
        [FromBody] List<WholesaleTierInput> tiers, CancellationToken ct)
    {
        await mediator.Send(new UpsertWholesaleTiersCommand(productId, tiers), ct);
        return Ok(new { message = "Wholesale tiers saved." });
    }

    [HttpGet("products/{productId:guid}/wholesale-tiers")]
    public async Task<IActionResult> GetTiers(Guid productId, CancellationToken ct)
    {
        var tiers = await mediator.Send(new GetWholesaleTiersQuery(productId), ct);
        return Ok(tiers);
    }

    // ── Quote inbox ───────────────────────────────────────────────────────────

    [HttpGet("quotes")]
    public async Task<IActionResult> ListQuotes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var quotes = await mediator.Send(new ListQuotesQuery(page, pageSize), ct);
        return Ok(quotes);
    }

    [HttpPut("quotes/{quoteId:guid}/reply")]
    public async Task<IActionResult> Reply(Guid quoteId,
        [FromBody] QuoteReplyRequest req, CancellationToken ct)
    {
        await mediator.Send(new ReplyToQuoteCommand(quoteId, req.Reply, req.Status ?? "Replied"), ct);

        // ── Notify the buyer (fire-and-forget) ────────────────────────────────
        var quote = await db.QuoteRequests.AsNoTracking()
            .FirstOrDefaultAsync(q => q.Id == quoteId, ct);
        var tenant = quote == null ? null : await db.Tenants.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == quote.TenantId, ct);

        if (quote != null && tenant != null && !string.IsNullOrWhiteSpace(quote.ContactEmail))
        {
            var frontendUrl = (configuration["FrontendUrl"] ?? "https://silarai.com").TrimEnd('/');
            var storeUrl    = $"{frontendUrl}/{tenant.Slug}";
            var payload     = new { quote.ContactEmail, quote.ContactName, StoreName = tenant.Name, req.Reply, Status = req.Status ?? "Replied", storeUrl };
            _ = Task.Run(async () =>
            {
                try
                {
                    await emailService.SendQuoteReplyAsync(
                        payload.ContactEmail, payload.ContactName, payload.StoreName,
                        payload.Reply, payload.Status, payload.storeUrl, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Quote reply email failed for quote {QuoteId}", quoteId);
                }
            }, CancellationToken.None);
        }

        return Ok(new { message = "Reply sent." });
    }
}

public record QuoteReplyRequest(string Reply, string? Status);


