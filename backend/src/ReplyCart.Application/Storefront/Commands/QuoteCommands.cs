using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Storefront;

namespace ReplyCart.Application.Storefront.Commands;

// ── Submit quote (public / customer) ─────────────────────────────────────────

public record SubmitQuoteCommand(
    Guid TenantId,
    Guid? StorefrontCustomerId,
    string ContactName,
    string ContactEmail,
    string? ContactPhone,
    string? CompanyName,
    string? GstNumber,
    string ItemsJson,
    string? Notes
) : IRequest<Guid>;

public class SubmitQuoteHandler(IAppDbContext db)
    : IRequestHandler<SubmitQuoteCommand, Guid>
{
    public async Task<Guid> Handle(SubmitQuoteCommand req, CancellationToken ct)
    {
        var quote = new QuoteRequest
        {
            TenantId             = req.TenantId,
            StorefrontCustomerId = req.StorefrontCustomerId,
            ContactName          = req.ContactName,
            ContactEmail         = req.ContactEmail,
            ContactPhone         = req.ContactPhone,
            CompanyName          = req.CompanyName,
            GstNumber            = req.GstNumber,
            ItemsJson            = req.ItemsJson,
            Notes                = req.Notes,
            Status               = "Pending",
        };
        db.QuoteRequests.Add(quote);
        await db.SaveChangesAsync(ct);
        return quote.Id;
    }
}

// ── List quotes (merchant) ────────────────────────────────────────────────────

public record ListQuotesQuery(int Page = 1, int PageSize = 20) : IRequest<List<QuoteDto>>;

public record QuoteDto(
    Guid Id,
    string ContactName,
    string ContactEmail,
    string? CompanyName,
    string Status,
    string ItemsJson,
    string? Notes,
    string? MerchantReply,
    DateTime CreatedAt
);

public class ListQuotesHandler(IAppDbContext db)
    : IRequestHandler<ListQuotesQuery, List<QuoteDto>>
{
    public async Task<List<QuoteDto>> Handle(ListQuotesQuery req, CancellationToken ct)
    {
        return await db.QuoteRequests
            .OrderByDescending(q => q.CreatedAt)
            .Skip((req.Page - 1) * req.PageSize)
            .Take(req.PageSize)
            .Select(q => new QuoteDto(
                q.Id, q.ContactName, q.ContactEmail, q.CompanyName,
                q.Status, q.ItemsJson, q.Notes, q.MerchantReply, q.CreatedAt))
            .ToListAsync(ct);
    }
}

// ── Reply to quote (merchant) ─────────────────────────────────────────────────

public record ReplyToQuoteCommand(Guid QuoteId, string Reply, string Status) : IRequest;

public class ReplyToQuoteHandler(IAppDbContext db)
    : IRequestHandler<ReplyToQuoteCommand>
{
    public async Task Handle(ReplyToQuoteCommand req, CancellationToken ct)
    {
        var quote = await db.QuoteRequests.FindAsync([req.QuoteId], ct)
            ?? throw new KeyNotFoundException("Quote not found.");
        quote.MerchantReply = req.Reply;
        quote.Status        = req.Status;
        quote.RepliedAt     = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
