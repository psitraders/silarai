using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Infrastructure.Ai;

public class MockAiProvider : IAiProvider
{
    public string ProviderName => "Mock";

    public Task<string> GetReplySuggestionAsync(AiSuggestionRequest request, CancellationToken cancellationToken = default)
    {
        var tone = request.ToneMode switch
        {
            "Premium" => "luxury ",
            "Short" => "brief ",
            "Persuasive" => "compelling ",
            _ => "friendly "
        };

        var reply = request.ProductName != null
            ? $"Hi! Thank you for your interest in {request.ProductName}. {GenerateProductReply(request)}"
            : $"Hi! Thank you for reaching out to {request.BusinessName ?? "us"}. {GenerateGenericReply(request.CustomerQuestion)}";

        return Task.FromResult(reply);
    }

    private static string GenerateProductReply(AiSuggestionRequest request)
    {
        var templates = new[]
        {
            $"The {request.ProductName} is available and priced beautifully. Would you like to know more details or the available sizes/colors?",
            $"Great choice! {request.ProductName} is one of our bestsellers. Let me share the complete details with you.",
            $"Yes, {request.ProductName} is available! Would you like to see more photos or know about delivery options?"
        };
        return templates[Random.Shared.Next(templates.Length)];
    }

    public Task<(string Caption, string Hashtags, string Cta)> GenerateSocialPostAsync(
        string productName,
        string? productDescription,
        string platform,
        string tone,
        string businessName,
        string language = "English",
        CancellationToken cancellationToken = default)
    {
        var caption   = $"✨ Discover {productName} at {businessName}! {productDescription ?? "Shop our latest collection."}";
        var hashtags  = $"#{productName.Replace(" ", "")} #{businessName.Replace(" ", "")} #ShopNow #NewArrival";
        var cta       = "DM us or visit our store link!";
        return Task.FromResult((caption, hashtags, cta));
    }

    public Task<string> GenerateMarketingMessageAsync(
        string goal,
        string tone,
        string businessName,
        string? extraContext,
        CancellationToken cancellationToken = default)
    {
        var messages = goal.ToLower() switch
        {
            var g when g.Contains("sale") || g.Contains("discount") || g.Contains("offer") =>
                $"🎉 Big Sale at {businessName}! Get exclusive discounts today only. Shop now before it ends! 🛍️",
            var g when g.Contains("new") && g.Contains("arrival") =>
                $"✨ New arrivals just dropped at {businessName}! Be the first to grab the latest collection. 🆕",
            var g when g.Contains("follow") || g.Contains("check in") =>
                $"Hi {{{{name}}}}, just checking in from {businessName}! Hope you're loving your purchase. We'd love to hear from you 😊",
            var g when g.Contains("thank") =>
                $"Thank you for shopping with {businessName}, {{{{name}}}}! 🙏 Your support means the world to us. See you again soon!",
            var g when g.Contains("abandon") || g.Contains("cart") =>
                $"Hey {{{{name}}}}, you left something behind! 👀 Your items at {businessName} are waiting. Complete your order now!",
            var g when g.Contains("reorder") || g.Contains("repeat") =>
                $"Hi {{{{name}}}}, time to restock? 🔄 Your favourite items from {businessName} are still available. Order now!",
            _ =>
                $"Hello from {businessName}! 👋 We have something special for you. Reply to know more!"
        };

        return Task.FromResult(messages);
    }

    public Task<(string WhatsAppDesc, string InstagramDesc, string Tags)> GenerateProductDescriptionAsync(
        string productName,
        string? category,
        string? features,
        string tone,
        string businessName,
        string language = "English",
        CancellationToken cancellationToken = default)
    {
        var wa   = $"✨ Introducing *{productName}* from {businessName}! {features ?? "Perfect quality, great price."}  Order now and get it delivered fast! 🛍️";
        var ig   = $"Discover {productName} at {businessName}. {features ?? "Shop our latest collection."} Tap the link in bio to order!";
        var tags = $"#{productName.Replace(" ", "")} #{businessName.Replace(" ", "")} #ShopNow #NewArrival #IndianBusiness";
        return Task.FromResult((wa, ig, tags));
    }

    public Task<string> GenerateReelScriptAsync(
        string productName,
        string? productDescription,
        int durationSeconds,
        string tone,
        string businessName,
        CancellationToken cancellationToken = default)
    {
        var script =
            $"🎬 {durationSeconds}-Second Reel Script — {productName} by {businessName}\n\n" +
            $"SCENE 1 — Hook (0-3s)\n[VISUAL] Close-up of {productName}\n[TEXT ON SCREEN] \"You NEED to see this! 👀\"\n\n" +
            $"SCENE 2 — Product Showcase (3-{durationSeconds / 2}s)\n[VISUAL] Show {productName} from multiple angles\n[VOICEOVER] \"{productDescription ?? $"Introducing {productName}"}. Available now at {businessName}!\"\n\n" +
            $"SCENE 3 — CTA ({durationSeconds / 2}-{durationSeconds}s)\n[VISUAL] Call-to-action screen\n[TEXT ON SCREEN] \"DM us to order! 📲\"\n[VOICEOVER] \"Link in bio — order yours today!\"";
        return Task.FromResult(script);
    }

    public Task<string> GeneratePosterImageAsync(
        string productName,
        string? productDescription,
        string platform,
        string tone,
        string businessName,
        CancellationToken cancellationToken = default)
    {
        // Return a coloured placeholder so the UI flow works without OpenAI configured
        var color = tone switch
        {
            "Fun"          => "6366f1/ffffff",
            "Professional" => "1e293b/ffffff",
            "Festive"      => "f59e0b/ffffff",
            "Urgent"       => "dc2626/ffffff",
            _              => "0f766e/ffffff"
        };
        var label  = Uri.EscapeDataString($"{businessName} · {productName}");
        var size   = platform is "Facebook" or "Twitter" ? "1792x1024" : "1024x1024";
        var url    = $"https://placehold.co/{size}/{color}?text={label}";
        return Task.FromResult(url);
    }

    public Task<ConversationReply> HandleConversationAsync(
        ConversationRequest request,
        CancellationToken cancellationToken = default)
    {
        var msg  = request.CustomerMessage.ToLower();
        string reply;
        string? state = null;

        if (msg.Contains("price") || msg.Contains("cost") || msg.Contains("kitna"))
        {
            reply = "Great question! 😊 Could you tell me which product you're interested in, and I'll share the exact price for you.";
            state = "interested";
        }
        else if (msg.Contains("order") || msg.Contains("buy") || msg.Contains("lena"))
        {
            reply = "Awesome! 🛍️ I'll help you place the order. Could you share your name, delivery address, and phone number?";
            state = "collecting_info";
        }
        else if (msg.Contains("deliver") || msg.Contains("ship"))
        {
            reply = "We deliver within 3-5 business days across India. Cash on delivery is also available! 🚚";
        }
        else
        {
            reply = "Hi! Welcome 👋 I'm your shopping assistant. You can browse our products, ask about prices, or place an order directly here. How can I help you?";
            state = "discovery";
        }

        return Task.FromResult(new ConversationReply(reply, state));
    }

    public Task<string> GeneratePageContentAsync(
        string pageType,
        string? userPrompt,
        string storeName,
        string? storeDescription,
        string? storeCategory,
        string themeColor = "#0F766E",
        CancellationToken cancellationToken = default)
    {
        var html = $@"<section style=""max-width:700px;margin:0 auto;padding:40px 20px;font-family:sans-serif;"">
  <h1 style=""font-size:2rem;font-weight:800;color:{themeColor};margin-bottom:12px;"">About {storeName}</h1>
  <p style=""font-size:1.1rem;color:#374151;line-height:1.7;margin-bottom:24px;"">{storeDescription ?? $"Welcome to {storeName}! We are passionate about bringing you the best products."}</p>
  <h2 style=""font-size:1.3rem;font-weight:700;color:#111827;margin-bottom:8px;"">Our Story</h2>
  <p style=""color:#4B5563;line-height:1.7;margin-bottom:20px;"">Founded with a passion for quality and a commitment to customer satisfaction, {storeName} has been serving happy customers across India. We believe in offering genuine products at fair prices.</p>
  <h2 style=""font-size:1.3rem;font-weight:700;color:#111827;margin-bottom:8px;"">Why Choose Us?</h2>
  <ul style=""color:#4B5563;line-height:1.9;padding-left:20px;"">
    <li>✅ Genuine products, carefully sourced</li>
    <li>✅ Fast shipping across India</li>
    <li>✅ Friendly customer support on WhatsApp</li>
    <li>✅ Secure &amp; easy ordering</li>
  </ul>
</section>";
        return Task.FromResult(html);
    }

    public Task<AutoCampaignContent> GenerateAutoCampaignContentAsync(
        string productName,
        string? productDescription,
        string businessName,
        string tone,
        string language = "English",
        CancellationToken cancellationToken = default)
    {
        var desc = productDescription ?? $"the amazing {productName}";
        return Task.FromResult(new AutoCampaignContent(
            InstagramCaption: $"✨ New arrival at {businessName}! Introducing {productName} — {desc}. Tap the link in bio to order! 🛍️",
            FacebookCaption:  $"🎉 We're excited to announce our latest product: *{productName}*! {desc}. Visit our store or message us to order today.",
            WhatsAppMessage:  $"🛍️ New drop: *{productName}*! {desc} Reply to order now.",
            Hashtags:         $"#{productName.Replace(" ", "")} #{businessName.Replace(" ", "")} #NewArrival #ShopNow #IndianBusiness",
            Cta:              "Order via WhatsApp!"
        ));
    }

    private static string GenerateGenericReply(string question)
    {
        return question.ToLower().Contains("price")
            ? "I'd be happy to share the pricing details. Could you let me know which specific product you're interested in?"
            : "I'm here to help! Could you please share more details about what you're looking for?";
    }
}


