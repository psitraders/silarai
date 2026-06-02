using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Leads;

namespace ReplyCart.Application.Leads.Commands;

public record UpdateLeadStatusCommand(Guid Id, LeadStatus Status, DateTime? FollowUpDate) : IRequest;

public class UpdateLeadStatusCommandHandler(IAppDbContext db, ICurrentUser currentUser)
    : IRequestHandler<UpdateLeadStatusCommand>
{
    public async Task Handle(UpdateLeadStatusCommand request, CancellationToken cancellationToken)
    {
        var lead = await db.Leads.FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Lead), request.Id);

        var previous = lead.Status;
        lead.Status = request.Status;
        lead.FollowUpDate = request.FollowUpDate;
        lead.LastActivityDate = DateTime.UtcNow;

        db.LeadActivities.Add(new LeadActivity
        {
            Id = Guid.NewGuid(),
            TenantId = lead.TenantId,
            LeadId = lead.Id,
            ActivityType = "StatusChange",
            Description = $"Status changed from {previous} to {request.Status}",
            PerformedBy = currentUser.UserId
        });

        await db.SaveChangesAsync(cancellationToken);
    }
}
