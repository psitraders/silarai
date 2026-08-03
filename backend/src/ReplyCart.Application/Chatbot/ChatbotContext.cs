using System.Text.Json.Serialization;

namespace ReplyCart.Application.Chatbot;

/// <summary>
/// Serialisable projection of a ChatbotProduct, safe to cache in Redis.
/// Deliberately excludes anything secret — see IChatbotContextCache.
/// </summary>
public sealed record ChatbotCatalogItem(
    Guid     Id,
    string   Title,
    string?  Description,
    decimal  Price,
    decimal? SalePrice,
    string?  Variants,
    string?  ImageUrl,
    string?  Category)
{
    /// <summary>The price the buyer actually pays. The AI never supplies this.</summary>
    [JsonIgnore]
    public decimal EffectivePrice => SalePrice ?? Price;

    /// <summary>Lower-cased haystack used for keyword scoring. Derived — never cached.</summary>
    [JsonIgnore]
    public string SearchText =>
        ((Category ?? "") + " " + Title + " " + (Description ?? "")).ToLowerInvariant();
}

/// <summary>A pre-chunked slice of an uploaded knowledge-base document.</summary>
public sealed record ChatbotKnowledgeChunk(string FileName, string Text);
