using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Leads;

namespace ReplyCart.Application.Leads.Queries;

public record LeadDetailDto(
    Guid Id, string CustomerName, string? CustomerPhone, string? CustomerEmail,
    string SourceChannel, string Status, Guid? InterestedProductId,
    string? InquiryNote, DateTime? FollowUpDate, DateTime CreatedAt,
    List<LeadNoteDto> Notes, List<LeadActivityDto> Activities
);
public record LeadNoteDto(Guid Id, string Content, DateTime CreatedAt);
public record LeadActivityDto(Guid Id, string ActivityType, string Description, DateTime CreatedAt);

public record GetLeadByIdQuery(Guid Id) : IRequest<LeadDetailDto>;

public class GetLeadByIdQueryHandler(IAppDbContext db) : IRequestHandler<GetLeadByIdQuery, LeadDetailDto>
{
    public async Task<LeadDetailDto> Handle(GetLeadByIdQuery request, CancellationToken cancellationToken)
    {
        var l = await db.Leads
            .Include(x => x.Notes.OrderByDescending(n => n.CreatedAt))
            .Include(x => x.Activities.OrderByDescending(a => a.CreatedAt))
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Lead), request.Id);

        return new LeadDetailDto(
            l.Id, l.CustomerName, l.CustomerPhone, l.CustomerEmail,
            l.SourceChannel.ToString(), l.Status.ToString(),
            l.InterestedProductId, l.InquiryNote, l.FollowUpDate, l.CreatedAt,
            l.Notes.Select(n => new LeadNoteDto(n.Id, n.Content, n.CreatedAt)).ToList(),
            l.Activities.Select(a => new LeadActivityDto(a.Id, a.ActivityType, a.Description, a.CreatedAt)).ToList()
        );
    }
}
