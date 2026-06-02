using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Customers.Queries;

public record GetUpcomingBirthdaysQuery(int DaysAhead = 30) : IRequest<List<UpcomingBirthdayDto>>;

public record UpcomingBirthdayDto(
    Guid    Id,
    string  Name,
    string? Phone,
    string  Type,        // "Birthday" | "Anniversary"
    DateOnly Date,
    int     DaysUntil,
    int     TotalOrders,
    decimal TotalSpend);

public class GetUpcomingBirthdaysQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetUpcomingBirthdaysQuery, List<UpcomingBirthdayDto>>
{
    public async Task<List<UpcomingBirthdayDto>> Handle(GetUpcomingBirthdaysQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;
        var today    = DateOnly.FromDateTime(DateTime.UtcNow);

        var customers = await db.Customers
            .Where(c => c.TenantId == tenantId
                     && (c.Birthday != null || c.Anniversary != null))
            .Select(c => new
            {
                c.Id, c.Name, c.PhoneNumber,
                c.Birthday, c.Anniversary,
                c.TotalOrders, c.TotalSpend
            })
            .ToListAsync(cancellationToken);

        var results = new List<UpcomingBirthdayDto>();

        foreach (var c in customers)
        {
            if (c.Birthday.HasValue)
            {
                var days = DaysUntilNextOccurrence(today, c.Birthday.Value);
                if (days <= request.DaysAhead)
                    results.Add(new UpcomingBirthdayDto(c.Id, c.Name, c.PhoneNumber,
                        "Birthday", c.Birthday.Value, days, c.TotalOrders, c.TotalSpend));
            }
            if (c.Anniversary.HasValue)
            {
                var days = DaysUntilNextOccurrence(today, c.Anniversary.Value);
                if (days <= request.DaysAhead)
                    results.Add(new UpcomingBirthdayDto(c.Id, c.Name, c.PhoneNumber,
                        "Anniversary", c.Anniversary.Value, days, c.TotalOrders, c.TotalSpend));
            }
        }

        return results.OrderBy(r => r.DaysUntil).ToList();
    }

    private static int DaysUntilNextOccurrence(DateOnly today, DateOnly date)
    {
        var thisYear = new DateOnly(today.Year, date.Month, date.Day);
        if (thisYear < today) thisYear = new DateOnly(today.Year + 1, date.Month, date.Day);
        return thisYear.DayNumber - today.DayNumber;
    }
}
