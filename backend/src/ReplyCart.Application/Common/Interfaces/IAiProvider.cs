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
        string language = "English",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates WhatsApp + Instagram product descriptions and suggested tags.
    /// </summary>
    Task<(string WhatsAppDesc, string InstagramDesc, string Tags)> GenerateProductDescriptionAsync(
        string productName,
        string? category,
        string? features,
        string tone,
        string businessName,
        string language = "English",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a short video/reel script for social media.
    /// </summary>
    Task<string> GenerateReelScriptAsync(
        string productName,
        string? productDescription,
        int durationSeconds,
        string tone,
        string businessName,
        CancellationToken cancellationToken = default);

    Task<string> GenerateMarketingMessageAsync(
        string goal,
        string tone,
        string businessName,
        string? extraContext,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a marketing poster image via DALL-E 3.
    /// Returns a temporary URL to the generated image (expires ~1 hour).
    /// </summary>
    Task<string> GeneratePosterImageAsync(
        string productName,
        string? productDescription,
        string platform,
        string tone,
        string businessName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Autonomous multi-turn conversation handler used by the RAG engine.
    /// Receives the full system prompt (built by RagContextBuilder) plus
    /// the conversation history, and returns the AI's next reply together
    /// with the updated conversation state.
    /// </summary>
    Task<ConversationReply> HandleConversationAsync(
        ConversationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates full HTML body content for a custom storefront page (About Us, FAQ, etc.)
    /// Returns clean semantic HTML with inline styles — ready to save as page content.
    /// </summary>
    Task<string> GeneratePageContentAsync(
        string pageType,
        string? userPrompt,
        string storeName,
        string? storeDescription,
        string? storeCategory,
        string themeColor = "#0F766E",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates social-media captions + hashtags + CTA for an auto-campaign
    /// triggered when a product is published.
    /// </summary>
    Task<AutoCampaignContent> GenerateAutoCampaignContentAsync(
        string productName,
        string? productDescription,
        string businessName,
        string tone,
        string language = "English",
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

/// <summary>Full conversation context passed to HandleConversationAsync.</summary>
public record ConversationRequest(
    /// <summary>Full system prompt assembled by RagContextBuilder.</summary>
    string SystemPrompt,
    /// <summary>Prior messages in the session [{ role, content }].</summary>
    IReadOnlyList<ConversationMessage> History,
    /// <summary>The customer's latest message.</summary>
    string CustomerMessage
);

public record ConversationMessage(string Role, string Content);

/// <summary>What the AI returns from HandleConversationAsync.</summary>
public record ConversationReply(
    /// <summary>The reply text to send back to the customer.</summary>
    string ReplyText,
    /// <summary>
    /// Optional signal from the AI about what state the conversation is in.
    /// Values: "greeting" | "discovery" | "interested" | "collecting_info" |
    ///         "lead_captured" | "confirming" | "order_ready" | "ordered" | "escalate" | null (no change).
    /// </summary>
    string? StateSignal,
    /// <summary>Customer name extracted by the AI when both name and phone are collected.</summary>
    string? ExtractedName = null,
    /// <summary>Customer phone extracted by the AI when both name and phone are collected.</summary>
    string? ExtractedPhone = null,
    /// <summary>Delivery address extracted from order_ready state.</summary>
    string? ExtractedAddress = null,
    /// <summary>JSON array of cart items when state is "order_ready".</summary>
    string? ExtractedCartJson = null,
    /// <summary>"cod" or "online" — extracted from order_ready state.</summary>
    string? ExtractedPaymentMethod = null,
    /// <summary>Prompt (input) tokens billed by the AI provider for this call. 0 if unknown.</summary>
    int PromptTokens = 0,
    /// <summary>Completion (output) tokens billed by the AI provider for this call. 0 if unknown.</summary>
    int CompletionTokens = 0
);

/// <summary>AI-generated content for an auto-campaign post.</summary>
public record AutoCampaignContent(
    string InstagramCaption,
    string FacebookCaption,
    string WhatsAppMessage,
    string Hashtags,
    string Cta
);


