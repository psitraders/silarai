using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Business.Commands;

public record UpdateAiSettingsCommand(
    bool AutoReplyEnabled,
    string AutoReplyTone,
    string? AiStoreContext,
    bool AutoCampaignEnabled
) : IRequest;

public class UpdateAiSettingsCommandHandler(IAppDbContext db, ITenantContext tenantContext)
    : IRequestHandler<UpdateAiSettingsCommand>
{
    public async Task Handle(UpdateAiSettingsCommand request, CancellationToken ct)
    {
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, ct);

        if (business is null) return;

        business.AutoReplyEnabled    = request.AutoReplyEnabled;
        business.AutoReplyTone       = request.AutoReplyTone;
        business.AiStoreContext      = request.AiStoreContext;
        business.AutoCampaignEnabled = request.AutoCampaignEnabled;

        await db.SaveChangesAsync(ct);
    }
}


