namespace ReplyCart.Application.Common.Interfaces;

public interface IAiProvider
{
    string ProviderName { get; }

    Task<string> GetReplySuggestionAsync(
        AiSuggestionRequest request,
        CancellationToken cancellationToken = default);

    Task<(string Caption, string Hashtags, string Cta)> GenerateSocialPostAsync(
        string productName,
        string? productDescription,
        string platform,
        string tone,
        string businessName,
        CancellationToken cancellationToken = default);

    Task<string> GenerateMarketingMessageAsync(
        string goal,
        string tone,
        string businessName,
        string? extraContext,
        CancellationToken cancellationToken = default);
}

public record AiSuggestionRequest(
    string CustomerQuestion,
    string? ProductName,
    string? ProductDescription,
    string? Channel,
    string ToneMode,
    string? BusinessName
);
