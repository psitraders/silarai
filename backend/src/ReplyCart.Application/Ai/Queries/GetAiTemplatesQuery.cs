using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Ai.Queries;

public record AiTemplateDto(Guid Id, string Name, string Content, string Category, string ToneMode, bool IsActive, DateTime CreatedAt);

public record GetAiTemplatesQuery(string? Category = null) : IRequest<IEnumerable<AiTemplateDto>>;

public class GetAiTemplatesHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetAiTemplatesQuery, IEnumerable<AiTemplateDto>>
{
    public async Task<IEnumerable<AiTemplateDto>> Handle(GetAiTemplatesQuery request, CancellationToken cancellationToken)
    {
        var query = db.ReplyTemplates
            .Where(t => t.TenantId == tenantContext.CurrentTenantId);

        if (!string.IsNullOrEmpty(request.Category))
            query = query.Where(t => t.Category == request.Category);

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new AiTemplateDto(t.Id, t.Name, t.Content, t.Category, t.ToneMode, t.IsActive, t.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}


