using MediatR;
using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Ai;

namespace ReplyCart.Application.Ai.Commands;

public record GetAiSuggestionCommand(
    Guid? LeadId,
    string CustomerQuestion,
    Guid? ProductId,
    string? Channel,
    string ToneMode = "Friendly"
) : IRequest<AiSuggestionResult>;

public record AiSuggestionResult(Guid SuggestionId, string Reply, string Provider);

public class GetAiSuggestionCommandHandler(IAppDbContext db, ITenantContext tenantContext, IAiProvider aiProvider)
    : IRequestHandler<GetAiSuggestionCommand, AiSuggestionResult>
{
    public async Task<AiSuggestionResult> Handle(GetAiSuggestionCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.CurrentTenantId;

        string? productName = null;
        string? productDesc = null;
        if (request.ProductId.HasValue)
        {
            var product = await db.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);
            productName = product?.Title;
            productDesc = product?.Description;
        }

        var business = await db.Businesses.FirstOrDefaultAsync(b => b.TenantId == tenantId, cancellationToken);

        var aiRequest = new AiSuggestionRequest(
            request.CustomerQuestion,
            productName,
            productDesc,
            request.Channel,
            request.ToneMode,
            business?.Name
        );

        string reply;
        bool wasSuccessful;
        string usedProvider;

        try
        {
            reply         = await aiProvider.GetReplySuggestionAsync(aiRequest, cancellationToken);
            wasSuccessful = true;
            usedProvider  = aiProvider.ProviderName;
        }
        catch (Exception)
        {
            // AI rate-limited or unavailable — return a safe fallback reply
            reply = request.CustomerQuestion.ToLower().Contains("price")
                ? "Thank you for asking! Could you let me know which product you're interested in so I can share the pricing?"
                : "Thank you for reaching out! We'll get back to you shortly with more details.";
            wasSuccessful = false;
            usedProvider  = "Template-Fallback";
        }

        var suggestion = new AiSuggestion
        {
            TenantId       = tenantId,
            LeadId         = request.LeadId,
            Prompt         = request.CustomerQuestion,
            SuggestedReply = reply,
            ToneMode       = request.ToneMode,
            Provider       = usedProvider,
            Channel        = request.Channel
        };
        db.AiSuggestions.Add(suggestion);

        db.AiUsageLogs.Add(new AiUsageLog
        {
            TenantId      = tenantId,
            RequestType   = "ReplySuggestion",
            TokensUsed    = 0,
            Provider      = usedProvider,
            WasSuccessful = wasSuccessful
        });

        await db.SaveChangesAsync(cancellationToken);
        return new AiSuggestionResult(suggestion.Id, reply, usedProvider);
    }
}
