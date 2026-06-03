using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Marketing.Queries;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public record WaTemplateDto(
    Guid   Id,
    string Name,
    string DisplayName,
    string Category,
    string Language,
    string Body,
    string? HeaderText,
    string? FooterText,
    string? VariablesJson,
    bool   IsActive,
    bool   IsDefault,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

// ── Get all templates for this tenant ────────────────────────────────────────

public record GetWaTemplatesQuery : IRequest<List<WaTemplateDto>>;

public class GetWaTemplatesHandler(IAppDbContext db)
    : IRequestHandler<GetWaTemplatesQuery, List<WaTemplateDto>>
{
    public async Task<List<WaTemplateDto>> Handle(GetWaTemplatesQuery request, CancellationToken ct)
    {
        return await db.WaTemplates
            .OrderByDescending(t => t.IsDefault)
            .ThenBy(t => t.DisplayName)
            .Select(t => new WaTemplateDto(
                t.Id,
                t.Name,
                t.DisplayName,
                t.Category,
                t.Language,
                t.Body,
                t.HeaderText,
                t.FooterText,
                t.VariablesJson,
                t.IsActive,
                t.IsDefault,
                t.CreatedAt,
                t.UpdatedAt
            ))
            .ToListAsync(ct);
    }
}

// ── Get single template ───────────────────────────────────────────────────────

public record GetWaTemplateByIdQuery(Guid Id) : IRequest<WaTemplateDto?>;

public class GetWaTemplateByIdHandler(IAppDbContext db)
    : IRequestHandler<GetWaTemplateByIdQuery, WaTemplateDto?>
{
    public async Task<WaTemplateDto?> Handle(GetWaTemplateByIdQuery request, CancellationToken ct)
    {
        var t = await db.WaTemplates.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
        if (t is null) return null;

        return new WaTemplateDto(
            t.Id, t.Name, t.DisplayName, t.Category, t.Language,
            t.Body, t.HeaderText, t.FooterText, t.VariablesJson,
            t.IsActive, t.IsDefault, t.CreatedAt, t.UpdatedAt
        );
    }
}


