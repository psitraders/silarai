using ReplyCart.Application.Chatbot;

namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// Caches the per-client data that used to be re-read and re-processed from SQL on
/// EVERY chat turn: the product catalogue and the pre-chunked knowledge-base text.
///
/// Backed by Redis when available, by IMemoryCache otherwise.
///
/// Deliberately does NOT cache the ChatbotClient row itself — it carries the
/// Razorpay key secret, and caching payment secrets outside SQL is not worth the
/// single indexed lookup it would save.
/// </summary>
public interface IChatbotContextCache
{
    Task<IReadOnlyList<ChatbotCatalogItem>> GetCatalogAsync(Guid clientId, CancellationToken ct = default);

    Task<IReadOnlyList<ChatbotKnowledgeChunk>> GetKnowledgeAsync(Guid clientId, CancellationToken ct = default);

    /// <summary>Call after any write to ChatbotProducts / ChatbotDocuments for this client.</summary>
    Task InvalidateAsync(Guid clientId, CancellationToken ct = default);
}
