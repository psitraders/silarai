using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Marketing.Commands;

public record GenerateReelScriptCommand(
    string  ProductName,
    string? ProductDescription,
    int     DurationSeconds,   // 15 | 30 | 60
    string  Tone,
    string? BusinessName
) : IRequest<string>;

public class GenerateReelScriptCommandHandler(
    IAppDbContext  db,
    ITenantContext tenantContext,
    IAiProvider    aiProvider)
    : IRequestHandler<GenerateReelScriptCommand, string>
{
    public async Task<string> Handle(GenerateReelScriptCommand request, CancellationToken cancellationToken)
    {
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, cancellationToken);

        var bizName = request.BusinessName ?? business?.Name ?? "our store";

        var script = await aiProvider.GenerateReelScriptAsync(
            request.ProductName,
            request.ProductDescription,
            request.DurationSeconds,
            request.Tone,
            bizName,
            cancellationToken);

        db.AiUsageLogs.Add(new Domain.Ai.AiUsageLog
        {
            TenantId      = tenantContext.CurrentTenantId,
            RequestType   = "ReelScript",
            TokensUsed    = 0,
            Provider      = aiProvider.ProviderName,
            WasSuccessful = true
        });
        await db.SaveChangesAsync(cancellationToken);

        return script;
    }
}
