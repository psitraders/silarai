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

    private static string GenerateGenericReply(string question)
    {
        return question.ToLower().Contains("price")
            ? "I'd be happy to share the pricing details. Could you let me know which specific product you're interested in?"
            : "I'm here to help! Could you please share more details about what you're looking for?";
    }
}
