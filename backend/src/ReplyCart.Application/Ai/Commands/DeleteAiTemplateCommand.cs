using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Ai.Commands;

public record DeleteAiTemplateCommand(Guid Id) : IRequest;

public class DeleteAiTemplateHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<DeleteAiTemplateCommand>
{
    public async Task Handle(DeleteAiTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await db.ReplyTemplates
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.TenantId == tenantContext.CurrentTenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Template {request.Id} not found.");

        template.IsDeleted = true;
        template.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
    }
}


