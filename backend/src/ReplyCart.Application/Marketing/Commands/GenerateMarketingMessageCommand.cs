using MediatR;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Application.Business.Queries;

namespace ReplyCart.Application.Marketing.Commands;

public record GenerateMarketingMessageCommand(
    string Goal,
    string Tone,
    string? ExtraContext
) : IRequest<string>;

public class GenerateMarketingMessageCommandHandler(
    IAiProvider aiProvider,
    IMediator mediator)
    : IRequestHandler<GenerateMarketingMessageCommand, string>
{
    public async Task<string> Handle(GenerateMarketingMessageCommand request, CancellationToken cancellationToken)
    {
        // Try to get business name for context
        string businessName = "our store";
        try
        {
            var business = await mediator.Send(new GetBusinessQuery(), cancellationToken);
            if (business?.Name is { Length: > 0 } name)
                businessName = name;
        }
        catch { /* swallow — business name is optional context */ }

        return await aiProvider.GenerateMarketingMessageAsync(
            request.Goal,
            request.Tone,
            businessName,
            request.ExtraContext,
            cancellationToken);
    }
}


