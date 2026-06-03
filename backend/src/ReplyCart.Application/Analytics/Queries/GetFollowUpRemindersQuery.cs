using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;

namespace ReplyCart.Application.Analytics.Queries;

public record ReminderItem(Guid LeadId, string CustomerName, string? Phone, string Status, DateTime LastActivity, int DaysSinceActivity);
public record GetFollowUpRemindersQuery(int StaleAfterDays = 2) : IRequest<List<ReminderItem>>;

public class GetFollowUpRemindersQueryHandler(IAppDbContext db)
    : IRequestHandler<GetFollowUpRemindersQuery, List<ReminderItem>>
{
    public async Task<List<ReminderItem>> Handle(GetFollowUpRemindersQuery request, CancellationToken cancellationToken)
    {
        var cutoff = DateTime.UtcNow.AddDays(-request.StaleAfterDays);
        var openStatuses = new[] { LeadStatus.NewInquiry, LeadStatus.PriceShared, LeadStatus.Interested, LeadStatus.FollowUpPending };

        return await db.Leads
            .Where(l => !l.IsDeleted &&
                        openStatuses.Contains(l.Status) &&
                        (l.LastActivityDate == null || l.LastActivityDate <= cutoff))
            .OrderBy(l => l.LastActivityDate)
            .Take(10)
            .Select(l => new ReminderItem(
                l.Id, l.CustomerName, l.CustomerPhone,
                l.Status.ToString(),
                l.LastActivityDate ?? l.CreatedAt,
                (int)(DateTime.UtcNow - (l.LastActivityDate ?? l.CreatedAt)).TotalDays))
            .ToListAsync(cancellationToken);
    }
}


