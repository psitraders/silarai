using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Ai.Commands;

public record UpdateAiTemplateCommand(Guid Id, string Name, string Content, string Category, string ToneMode, bool IsActive) : IRequest;

public class UpdateAiTemplateHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<UpdateAiTemplateCommand>
{
    public async Task Handle(UpdateAiTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await db.ReplyTemplates
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.TenantId == tenantContext.CurrentTenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Template {request.Id} not found.");

        template.Name = request.Name;
        template.Content = request.Content;
        template.Category = request.Category;
        template.ToneMode = request.ToneMode;
        template.IsActive = request.IsActive;
        template.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }
}
