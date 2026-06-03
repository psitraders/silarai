using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Configuration;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Ai;

public class OpenAiProvider : IAiProvider
{
    private readonly HttpClient     _http;
    private readonly string         _model;
    private readonly IConfiguration _config;

    public string ProviderName => "OpenAI";

    public OpenAiProvider(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _config = configuration;
        _http   = httpClientFactory.CreateClient("OpenAI");
        _model  = configuration["AI:OpenAI:Model"] ?? "gpt-4o-mini";

        var apiKey = configuration["AI:OpenAI:ApiKey"]!;
        _http.BaseAddress = new Uri("https://api.openai.com/");
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        // Some OpenAI accounts require the Organization ID header
        var orgId = configuration["AI:OpenAI:OrganizationId"];
        if (!string.IsNullOrWhiteSpace(orgId))
            _http.DefaultRequestHeaders.Add("OpenAI-Organization", orgId);

        // Project ID (for project-scoped API keys)
        var projectId = configuration["AI:OpenAI:ProjectId"];
        if (!string.IsNullOrWhiteSpace(projectId))
            _http.DefaultRequestHeaders.Add("OpenAI-Project", projectId);
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
        string language = "English",
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
            $"Tone: {tone}\n" +
            $"Language: {language}\n\n" +
            "Generate a caption (2-3 sentences), relevant hashtags (8-10, space-separated, with #), " +
            "and a call-to-action. Write the caption and CTA in the specified language. Return JSON only.";

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

    public async Task<(string WhatsAppDesc, string InstagramDesc, string Tags)> GenerateProductDescriptionAsync(
        string productName,
        string? category,
        string? features,
        string tone,
        string businessName,
        string language = "English",
        CancellationToken cancellationToken = default)
    {
        var systemPrompt =
            "You are a product copywriter for Indian small businesses selling on WhatsApp and Instagram. " +
            "Output ONLY valid JSON with keys: whatsapp, instagram, tags. No markdown, no extra text.";

        var userPrompt =
            $"Product: {productName}\n" +
            $"Category: {category ?? "General"}\n" +
            $"Features: {features ?? "N/A"}\n" +
            $"Business: {businessName}\n" +
            $"Tone: {tone}\n" +
            $"Language: {language}\n\n" +
            "Generate:\n" +
            "- whatsapp: a short, conversational product description (3-4 sentences) with emojis, for WhatsApp catalogue/status\n" +
            "- instagram: an engaging 2-3 sentence description suitable for Instagram caption\n" +
            "- tags: 8-10 relevant hashtags with # prefix, space-separated\n" +
            "Write in the specified language. Return JSON only.";

        var raw = await CallChatCompletionAsync(systemPrompt, userPrompt, cancellationToken);

        try
        {
            var json = raw.Trim().TrimStart('`').TrimEnd('`');
            if (json.StartsWith("json", StringComparison.OrdinalIgnoreCase)) json = json[4..].Trim();

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            return (
                root.GetProperty("whatsapp").GetString()   ?? raw,
                root.GetProperty("instagram").GetString()  ?? raw,
                root.GetProperty("tags").GetString()       ?? $"#{productName.Replace(" ", "")} #ShopNow"
            );
        }
        catch
        {
            return (raw, raw, $"#{productName.Replace(" ", "")} #{businessName.Replace(" ", "")} #ShopNow");
        }
    }

    public async Task<string> GenerateReelScriptAsync(
        string productName,
        string? productDescription,
        int durationSeconds,
        string tone,
        string businessName,
        CancellationToken cancellationToken = default)
    {
        var systemPrompt =
            "You are a short-form video script writer for Indian small business owners on Instagram/YouTube Shorts. " +
            "Write scripts that are punchy, relatable, and drive sales. " +
            "Format: numbered scenes with [VISUAL], [VOICEOVER/TEXT], and [DURATION] on separate lines. " +
            "Output only the script, no explanations.";

        var userPrompt =
            $"Product: {productName}\n" +
            $"Description: {productDescription ?? "N/A"}\n" +
            $"Business: {businessName}\n" +
            $"Tone: {tone}\n" +
            $"Target video duration: {durationSeconds} seconds\n\n" +
            $"Write a {durationSeconds}-second Instagram Reel / YouTube Shorts script for this product. " +
            "Include hook (first 3 seconds), product showcase, social proof hint, and strong CTA. " +
            "Keep it realistic for a small business owner to film with a phone.";

        return await CallChatCompletionAsync(systemPrompt, userPrompt, cancellationToken);
    }

    public async Task<string> GeneratePosterImageAsync(
        string productName,
        string? productDescription,
        string platform,
        string tone,
        string businessName,
        CancellationToken cancellationToken = default)
    {
        var mood = tone switch
        {
            "Fun"          => "vibrant, colorful, playful, energetic with bright gradients",
            "Professional" => "clean, minimal, elegant, sophisticated with neutral tones",
            "Festive"      => "festive, celebratory, warm glowing lights, rich colors",
            "Urgent"       => "bold, high-contrast, dramatic, attention-grabbing with red accents",
            _              => "modern, visually appealing, professional"
        };

        // dall-e-3 supports 1024x1024, 1792x1024, 1024x1792
        // dall-e-2 supports 256x256, 512x512, 1024x1024 only
        var imageModel = _config["AI:OpenAI:ImageModel"] ?? "dall-e-3";
        var size       = imageModel == "dall-e-2"
            ? "1024x1024"
            : platform is "Facebook" or "Twitter" ? "1792x1024" : "1024x1024";

        // Brand visibility: include business name as visible text element in composition
        var brandInstruction = string.IsNullOrWhiteSpace(businessName)
            ? ""
            : $"Include the brand name '{businessName}' as bold, styled text prominently displayed in the image — " +
              $"as a logo overlay, banner, or text element integrated naturally into the design. ";

        var prompt =
            $"A {mood} social media marketing poster for '{businessName}', " +
            $"showcasing the product '{productName}'" +
            (string.IsNullOrWhiteSpace(productDescription) ? ". " : $" — {productDescription}. ") +
            brandInstruction +
            "High-quality product photography style, professional lighting, clean composition. " +
            "No watermarks. Suitable for social media marketing.";

        // Build request body explicitly with JsonObject to guarantee camelCase field names.
        // The (object) cast + JsonSerializer.Serialize() trick can silently produce {} for
        // anonymous types when the compile-time type is object — this caused the
        // "model does not exist" error because OpenAI received an empty payload.
        var requestNode = new JsonObject
        {
            ["model"]  = imageModel,
            ["prompt"] = prompt,
            ["n"]      = 1,
            ["size"]   = size,
        };
        if (imageModel != "dall-e-2")
            requestNode["quality"] = "standard";

        var json     = requestNode.ToJsonString();
        var content  = new StringContent(json, Encoding.UTF8, "application/json");
        // Use absolute URL to avoid any BaseAddress resolution ambiguity
        var response = await _http.PostAsync(
            "https://api.openai.com/v1/images/generations", content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            // Try to extract the human-readable message from OpenAI's error JSON
            // e.g. { "error": { "message": "...", "type": "...", "code": "..." } }
            string friendlyError;
            try
            {
                using var errDoc = JsonDocument.Parse(errorBody);
                friendlyError = errDoc.RootElement
                    .GetProperty("error")
                    .GetProperty("message")
                    .GetString() ?? errorBody;
            }
            catch
            {
                friendlyError = errorBody;
            }
            // Include the request body in the exception so it's easy to diagnose
            // what was actually sent (visible in Azure App Service logs)
            throw new InvalidOperationException(
                $"OpenAI DALL-E error ({(int)response.StatusCode}): {friendlyError} | RequestBody: {json}");
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(body);
        return doc.RootElement.GetProperty("data")[0].GetProperty("url").GetString()
            ?? throw new InvalidOperationException("No image URL returned from OpenAI.");
    }

    /// <inheritdoc />
    public async Task<ConversationReply> HandleConversationAsync(
        ConversationRequest request,
        CancellationToken cancellationToken = default)
    {
        // Build the messages array: system + history + current customer message
        var messages = new List<object>
        {
            new { role = "system", content = request.SystemPrompt }
        };

        foreach (var msg in request.History)
            messages.Add(new { role = msg.Role, content = msg.Content });

        messages.Add(new { role = "user", content = request.CustomerMessage });

        var payload = new
        {
            model       = _model,
            messages    = messages.ToArray(),
            max_tokens  = 500,
            temperature = 0.7,
            // Ask the model to embed a state signal in its JSON response
        };

        var json     = JsonSerializer.Serialize(payload);
        var content  = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _http.PostAsync("v1/chat/completions", content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"OpenAI conversation error {(int)response.StatusCode}: {errorBody}");
        }

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc    = JsonDocument.Parse(responseBody);
        var rawText      = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "";

        // The model may optionally wrap its reply in JSON with a state_signal field.
        // Try to parse; fall back to plain text reply with no state signal.
        try
        {
            var trimmed = rawText.Trim().TrimStart('`').TrimEnd('`');
            if (trimmed.StartsWith("json", StringComparison.OrdinalIgnoreCase))
                trimmed = trimmed[4..].Trim();

            // Handle case where AI outputs plain text BEFORE the JSON block
            // e.g. "Great, your order is ready! {\"reply\":\"...\",\"state\":\"order_ready\",...}"
            var jsonIdx = trimmed.IndexOf("{\"reply\":", StringComparison.OrdinalIgnoreCase);
            if (jsonIdx > 0)
                trimmed = trimmed[jsonIdx..];

            if (trimmed.StartsWith('{'))
            {
                using var jdoc           = JsonDocument.Parse(trimmed);
                var root                 = jdoc.RootElement;
                var replyText            = root.TryGetProperty("reply",          out var r)    ? r.GetString() ?? rawText : rawText;
                var stateSignal          = root.TryGetProperty("state",          out var s)    ? s.GetString() : null;
                var extractedName        = root.TryGetProperty("name",           out var n)    ? n.GetString() : null;
                var extractedPhone       = root.TryGetProperty("phone",          out var p)    ? p.GetString() : null;
                var extractedAddress     = root.TryGetProperty("address",        out var addr) ? addr.GetString() : null;
                var extractedCartJson    = root.TryGetProperty("cart",           out var cart) ? cart.ToString() : null;
                var extractedPayment     = root.TryGetProperty("payment_method", out var pm)   ? pm.GetString() : null;
                return new ConversationReply(replyText, stateSignal, extractedName, extractedPhone,
                    extractedAddress, extractedCartJson, extractedPayment);
            }
        }
        catch { /* Not JSON – treat as plain text */ }

        return new ConversationReply(rawText, null);
    }

    /// <inheritdoc />
    public async Task<AutoCampaignContent> GenerateAutoCampaignContentAsync(
        string productName,
        string? productDescription,
        string businessName,
        string tone,
        string language = "English",
        CancellationToken cancellationToken = default)
    {
        var systemPrompt =
            "You are a social-media marketing expert for Indian small businesses. " +
            "Generate promotional content for all three channels at once. " +
            "Output ONLY valid JSON with keys: instagram, facebook, whatsapp, hashtags, cta. " +
            "No markdown, no extra text.";

        var userPrompt =
            $"Product: {productName}\n" +
            $"Description: {productDescription ?? "N/A"}\n" +
            $"Business: {businessName}\n" +
            $"Tone: {tone}\n" +
            $"Language: {language}\n\n" +
            "Generate:\n" +
            "- instagram: 2-3 sentence Instagram caption (engaging, with emojis)\n" +
            "- facebook: 3-4 sentence Facebook post (slightly more detailed, conversational)\n" +
            "- whatsapp: 1-2 sentence WhatsApp broadcast message (short, punchy, uses emojis naturally)\n" +
            "- hashtags: 10 relevant hashtags with #, space-separated\n" +
            "- cta: one short call-to-action phrase\n" +
            "Write captions/message in the specified language. Return JSON only.";

        var raw = await CallChatCompletionAsync(systemPrompt, userPrompt, cancellationToken);

        try
        {
            var trimmed = raw.Trim().TrimStart('`').TrimEnd('`');
            if (trimmed.StartsWith("json", StringComparison.OrdinalIgnoreCase))
                trimmed = trimmed[4..].Trim();

            using var doc = JsonDocument.Parse(trimmed);
            var root      = doc.RootElement;
            return new AutoCampaignContent(
                InstagramCaption: root.GetProperty("instagram").GetString() ?? raw,
                FacebookCaption:  root.GetProperty("facebook").GetString()  ?? raw,
                WhatsAppMessage:  root.GetProperty("whatsapp").GetString()  ?? raw,
                Hashtags:         root.GetProperty("hashtags").GetString()  ?? $"#{productName.Replace(" ", "")} #ShopNow",
                Cta:              root.GetProperty("cta").GetString()       ?? "Order via WhatsApp!"
            );
        }
        catch
        {
            var fallback = $"🛍️ New arrival: *{productName}*! {productDescription ?? ""} Contact us to order.";
            return new AutoCampaignContent(
                InstagramCaption: fallback,
                FacebookCaption:  fallback,
                WhatsAppMessage:  $"🛍️ New arrival: *{productName}*! Tap to order now.",
                Hashtags:         $"#{productName.Replace(" ", "")} #{businessName.Replace(" ", "")} #ShopNow #NewArrival",
                Cta:              "Order via WhatsApp!"
            );
        }
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


