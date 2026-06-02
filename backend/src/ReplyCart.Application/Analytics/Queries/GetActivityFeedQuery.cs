using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Analytics.Queries;

public record ActivityItem(string Type, string Title, string Subtitle, DateTime OccurredAt, string? EntityId);
public record GetActivityFeedQuery(int Count = 15) : IRequest<List<ActivityItem>>;

public class GetActivityFeedQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetActivityFeedQuery, List<ActivityItem>>
{
    private static string CurrencySymbol(string? currency) => currency?.ToUpperInvariant() switch
    {
        "USD" => "$",
        "EUR" => "€",
        "GBP" => "£",
        "AED" => "AED ",
        "SAR" => "SAR ",
        _     => "₹",   // default INR
    };

    public async Task<List<ActivityItem>> Handle(GetActivityFeedQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var since    = DateTime.UtcNow.AddDays(-30);

        // Fetch business currency so amounts are formatted correctly per tenant
        var currency = await db.Businesses
            .Where(b => b.TenantId == tenantId)
            .Select(b => b.Currency)
            .FirstOrDefaultAsync(cancellationToken);

        var sym = CurrencySymbol(currency);

        // Materialize without projecting into the record directly (allows string interpolation)
        var orderRows = await db.Orders
            .Where(o => o.TenantId == tenantId && o.CreatedAt >= since)
            .OrderByDescending(o => o.CreatedAt)
            .Take(request.Count)
            .Select(o => new { o.OrderNumber, o.CustomerName, o.TotalAmount, o.CreatedAt, Id = o.Id.ToString() })
            .ToListAsync(cancellationToken);

        var orders = orderRows
            .Select(o => new ActivityItem("order", $"Order #{o.OrderNumber} placed",
                $"{o.CustomerName ?? "Unknown"} · {sym}{o.TotalAmount:N0}", o.CreatedAt, o.Id))
            .ToList();

        var leads = await db.Leads
            .Where(l => l.TenantId == tenantId && l.CreatedAt >= since)
            .OrderByDescending(l => l.CreatedAt)
            .Take(request.Count)
            .Select(l => new ActivityItem("lead", $"New inquiry from {l.CustomerName}",
                l.InquiryNote ?? "Product inquiry", l.CreatedAt, l.Id.ToString()))
            .ToListAsync(cancellationToken);

        var customers = await db.Customers
            .Where(c => c.TenantId == tenantId && c.CreatedAt >= since)
            .OrderByDescending(c => c.CreatedAt)
            .Take(request.Count)
            .Select(c => new ActivityItem("customer", $"New customer: {c.Name}",
                c.PhoneNumber, c.CreatedAt, c.Id.ToString()))
            .ToListAsync(cancellationToken);

        return orders.Concat(leads).Concat(customers)
            .OrderByDescending(a => a.OccurredAt)
            .Take(request.Count)
            .ToList();
    }
}
