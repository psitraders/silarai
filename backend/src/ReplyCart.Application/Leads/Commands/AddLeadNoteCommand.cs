using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Exceptions;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Leads;

namespace ReplyCart.Application.Leads.Commands;

public record AddLeadNoteCommand(Guid LeadId, string Content) : IRequest<Guid>;

public class AddLeadNoteCommandHandler(IAppDbContext db, ICurrentUser currentUser)
    : IRequestHandler<AddLeadNoteCommand, Guid>
{
    public async Task<Guid> Handle(AddLeadNoteCommand request, CancellationToken cancellationToken)
    {
        var lead = await db.Leads.FirstOrDefaultAsync(l => l.Id == request.LeadId, cancellationToken)
            ?? throw new NotFoundException(nameof(Lead), request.LeadId);

        var note = new LeadNote
        {
            Id = Guid.NewGuid(),
            TenantId = lead.TenantId,
            LeadId = lead.Id,
            Content = request.Content,
            AuthorId = currentUser.UserId ?? Guid.Empty
        };
        db.LeadNotes.Add(note);

        db.LeadActivities.Add(new LeadActivity
        {
            Id = Guid.NewGuid(),
            TenantId = lead.TenantId,
            LeadId = lead.Id,
            ActivityType = "NoteAdded",
            Description = request.Content,
            PerformedBy = currentUser.UserId
        });

        lead.LastActivityDate = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return note.Id;
    }
}


