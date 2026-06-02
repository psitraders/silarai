using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Marketing.Commands;

public record GenerateProductDescriptionCommand(
    string  ProductName,
    string? Category,
    string? Features,
    string  Tone,        // "Fun" | "Professional" | "Festive" | "Urgent"
    string? BusinessName,
    string  Language = "English"
) : IRequest<ProductDescriptionResult>;

public record ProductDescriptionResult(
    string WhatsAppDesc,
    string InstagramDesc,
    string Tags);

public class GenerateProductDescriptionCommandHandler(
    IAppDbContext  db,
    ITenantContext tenantContext,
    IAiProvider    aiProvider)
    : IRequestHandler<GenerateProductDescriptionCommand, ProductDescriptionResult>
{
    public async Task<ProductDescriptionResult> Handle(
        GenerateProductDescriptionCommand request,
        CancellationToken cancellationToken)
    {
        var business = await db.Businesses
            .FirstOrDefaultAsync(b => b.TenantId == tenantContext.CurrentTenantId, cancellationToken);

        var bizName = request.BusinessName ?? business?.Name ?? "our store";

        var (wa, ig, tags) = await aiProvider.GenerateProductDescriptionAsync(
            request.ProductName,
            request.Category,
            request.Features,
            request.Tone,
            bizName,
            request.Language,
            cancellationToken);

        db.AiUsageLogs.Add(new Domain.Ai.AiUsageLog
        {
            TenantId      = tenantContext.CurrentTenantId,
            RequestType   = "ProductDescription",
            TokensUsed    = 0,
            Provider      = aiProvider.ProviderName,
            WasSuccessful = true
        });
        await db.SaveChangesAsync(cancellationToken);

        return new ProductDescriptionResult(wa, ig, tags);
    }
}
