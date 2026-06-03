using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Business.Queries;

public record GetAiSettingsQuery : IRequest<AiSettingsDto>;

public record AiSettingsDto(
    bool AutoReplyEnabled,
    string AutoReplyTone,
    string? AiStoreContext,
    bool AutoCampaignEnabled
);

public class GetAiSettingsQueryHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetAiSettingsQuery, AiSettingsDto>
{
    public async Task<AiSettingsDto> Handle(GetAiSettingsQuery request, CancellationToken ct)
    {
        var b = await db.Businesses
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        return new AiSettingsDto(
            b?.AutoReplyEnabled    ?? false,
            b?.AutoReplyTone       ?? "Friendly",
            b?.AiStoreContext,
            b?.AutoCampaignEnabled ?? false
        );
    }
}


