using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Ai;

public class OpenAiProvider : IAiProvider
{
    private readonly HttpClient _http;
    private readonly string _model;

    public string ProviderName => "OpenAI";

    public OpenAiProvider(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _http  = httpClientFactory.CreateClient("OpenAI");
        _model = configuration["AI:OpenAI:Model"] ?? "gpt-4o-mini";

        var apiKey = configuration["AI:OpenAI:ApiKey"]!;
        _http.BaseAddress = new Uri("https://api.openai.com/");
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
    }

    public async Task<string> GetReplySuggestionAsync(
        AiSuggestionRequest request,
        CancellationToken cancellationToken = default)
    {
        var systemPrompt =
            $"You are a helpful customer service assistant for '{request.BusinessName ?? "our store"}'. " +
            $"Reply in a {request.ToneMode?.ToLower() ?? "friendly"} tone. " +
            "Keep responses concise (2-3 sentences), warm, and actionable. " +
            "Respond in the same language as the customer's question.";

        var userPrompt = request.ProductName != null
            ? $"Customer asked about '{request.ProductName}': {request.CustomerQuestion}"
            : request.CustomerQuestion;

        return await CallChatCompletionAsync(systemPrompt, userPrompt, cancellationToken);
    }

    /// <summary>
    /// Called by GetSocialPostCommandHandler to generate real captions.
    /// </summary>
    public async Task<(string Caption, string Hashtags, string Cta)> GenerateSocialPostAsync(
        string productName,
        string? productDescription,
        string platform,
        string tone,
        string businessName,
        CancellationToken cancellationToken = default)
    {
        var systemPrompt =
            "You are a social media marketing expert for Indian small businesses. " +
            "Generate engaging social media content that drives sales. " +
            "Output ONLY valid JSON with keys: caption, hashtags, cta. No markdown, no extra text.";

        var userPrompt =
            $"Product: {productName}\n" +
            $"Description: {productDescription ?? "N/A"}\n" +
            $"Business: {businessName}\n" +
            $"Platform: {platform}\n" +
            $"Tone: {tone}\n\n" +
            "Generate a caption (2-3 sentences), relevant hashtags (8-10, space-separated, with #), " +
            "and a call-to-action. Return JSON only.";

        var raw = await CallChatCompletionAsync(systemPrompt, userPrompt, cancellationToken);

        try
        {
            // Strip potential markdown code fences
            var json = raw.Trim().TrimStart('`').TrimEnd('`');
            if (json.StartsWith("json", StringComparison.OrdinalIgnoreCase))
                json = json[4..].Trim();

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            return (
                root.GetProperty("caption").GetString() ?? raw,
                root.GetProperty("hashtags").GetString() ?? "",
                root.GetProperty("cta").GetString() ?? "Order via WhatsApp!"
            );
        }
        catch
        {
            // Fallback: return raw text as caption
            return (raw, $"#{productName.Replace(" ", "")} #{businessName.Replace(" ", "")} #ShopNow", "Order via WhatsApp!");
        }
    }

    public async Task<string> GenerateMarketingMessageAsync(
        string goal,
        string tone,
        string businessName,
        string? extraContext,
        CancellationToken cancellationToken = default)
    {
        var systemPrompt =
            "You are a WhatsApp marketing copywriter for Indian small businesses. " +
            "Write short, punchy, conversational messages that feel personal — not like bulk spam. " +
            "Use emojis naturally. Keep it under 160 characters unless the goal requires more detail. " +
            "Output ONLY the message text, no explanations, no quotes, no markdown.";

        var userPrompt =
            $"Business: {businessName}\n" +
            $"Campaign goal: {goal}\n" +
            $"Tone: {tone}\n" +
            (string.IsNullOrWhiteSpace(extraContext) ? "" : $"Extra context: {extraContext}\n") +
            "\nWrite a single WhatsApp marketing message. Use {{name}} as a placeholder for the customer name if it feels natural.";

        return await CallChatCompletionAsync(systemPrompt, userPrompt, cancellationToken);
    }

    private async Task<string> CallChatCompletionAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken cancellationToken)
    {
        var payload = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user",   content = userPrompt   }
            },
            max_tokens  = 400,
            temperature = 0.8
        };

        var json     = JsonSerializer.Serialize(payload);
        var content  = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _http.PostAsync("v1/chat/completions", content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"OpenAI API error {(int)response.StatusCode}: {errorBody}");
        }

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc    = JsonDocument.Parse(responseBody);

        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "";
    }
}
