using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Marketing.Commands;

public record GeneratePosterCommand(
    string  ProductName,
    string? ProductDescription,
    string  Platform,       // "Instagram" | "Facebook" | "WhatsApp" | "Twitter"
    string  Tone,           // "Fun" | "Professional" | "Festive" | "Urgent"
    string? BusinessName
) : IRequest<GeneratePosterResult>;

public record GeneratePosterResult(string? ImageUrl, string? Error = null);

public class GeneratePosterCommandHandler(
    IAppDbContext    db,
    ITenantContext   tenantContext,
    IAiProvider      aiProvider)
    : IRequestHandler<GeneratePosterCommand, GeneratePosterResult>
{
    public async Task<GeneratePosterResult> Handle(GeneratePosterCommand request, CancellationToken cancellationToken)
    {
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, cancellationToken);

        var bizName = request.BusinessName ?? business?.Name ?? "our store";

        try
        {
            var imageUrl = await aiProvider.GeneratePosterImageAsync(
                request.ProductName,
                request.ProductDescription,
                request.Platform,
                request.Tone,
                bizName,
                cancellationToken);

            db.AiUsageLogs.Add(new Domain.Ai.AiUsageLog
            {
                TenantId      = tenantContext.CurrentTenantId,
                RequestType   = "PosterImage",
                TokensUsed    = 0,
                Provider      = aiProvider.ProviderName,
                WasSuccessful = true
            });
            await db.SaveChangesAsync(cancellationToken);

            return new GeneratePosterResult(imageUrl);
        }
        catch (Exception ex)
        {
            // Image generation is optional — return error message so UI can show it
            // without crashing the whole request
            db.AiUsageLogs.Add(new Domain.Ai.AiUsageLog
            {
                TenantId      = tenantContext.CurrentTenantId,
                RequestType   = "PosterImage",
                TokensUsed    = 0,
                Provider      = aiProvider.ProviderName,
                WasSuccessful = false,
            });
            await db.SaveChangesAsync(cancellationToken);

            return new GeneratePosterResult(null,
                ex.Message.Contains("does not exist")
                    ? "Image generation is not available on your OpenAI plan. Upgrade to a paid OpenAI account to enable DALL-E."
                    : ex.Message);
        }
    }
}


