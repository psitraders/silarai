using MediatR;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Ai;

namespace ReplyCart.Application.Ai.Commands;

public record CreateAiTemplateCommand(string Name, string Content, string Category, string ToneMode) : IRequest<Guid>;

public class CreateAiTemplateHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateAiTemplateCommand, Guid>
{
    public async Task<Guid> Handle(CreateAiTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = new ReplyTemplate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.CurrentTenantId,
            Name = request.Name,
            Content = request.Content,
            Category = request.Category,
            ToneMode = request.ToneMode,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };
        db.ReplyTemplates.Add(template);
        await db.SaveChangesAsync(cancellationToken);
        return template.Id;
    }
}


