using Microsoft.EntityFrameworkCore;
using ReplyCart.Application.Common.Interfaces;
using ReplyCart.Domain.Business;
using ReplyCart.Domain.Catalog;
using ReplyCart.Domain.Conversation;
using ReplyCart.Domain.Enums;
using ReplyCart.Domain.Orders;

namespace ReplyCart.Application.Rag;

/// <summary>
/// Assembles all context needed to run an autonomous AI conversation turn:
/// store info, matching products, customer order history, and conversation history.
/// </summary>
public class RagContextBuilder
{
    private readonly IAppDbContext _db;

    public RagContextBuilder(IAppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Builds a <see cref="RagContext"/> for the given tenant and customer message.
    /// Call once per incoming message before handing off to the AI provider.
    /// </summary>
    public async Task<RagContext> BuildAsync(
        Guid tenantId,
        string customerMessage,
        ConversationSession session,
        CancellationToken ct = default)
    {
        // 1 – Load store / business info
        var business = await _db.Businesses
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.TenantId == tenantId, ct);

        // 2 – Find relevant products via keyword search
        var keywords = ExtractKeywords(customerMessage);
        var products = await FindRelevantProductsAsync(tenantId, keywords, ct);

        // 3 – Load all active products (for general browsing / listing)
        var allProducts = products.Count > 0
            ? products
            : await _db.Products
                .AsNoTracking()
                .Where(p => p.TenantId == tenantId
                         && p.Status == Domain.Enums.ProductStatus.Active
                         && !p.IsDeleted)
                .OrderByDescending(p => p.IsFeatured)
                .Take(10)
                .Select(p => new ProductSummary(
                    p.Id, p.Title, p.Description,
                    p.DiscountedPrice ?? p.BasePrice,
                    p.StockQuantity, p.Category != null ? p.Category.Name : null))
                .ToListAsync(ct);

        // 4 – Load recent orders from this phone number
        var recentOrders = await _db.Orders
            .AsNoTracking()
            .Where(o => o.TenantId == tenantId
                     && o.CustomerPhone == session.CollectedPhone
                     && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .Take(3)
            .Select(o => new OrderSummary(o.Id, o.OrderNumber, o.Status, o.TotalAmount, o.CreatedAt))
            .ToListAsync(ct);

        // 5 – Deserialise conversation history from session
        var messages = DeserializeMessages(session.MessagesJson);

        return new RagContext(
            Business: business == null ? null : new BusinessInfo(
                business.Name,
                business.DeliveryInfo,
                business.BusinessHours,
                business.Currency,
                business.AiStoreContext,
                business.AutoReplyTone,
                business.WhatsAppNumber),
            Products: allProducts,
            RecentOrders: recentOrders,
            ConversationHistory: messages,
            Session: session);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private async Task<List<ProductSummary>> FindRelevantProductsAsync(
        Guid tenantId, IReadOnlyList<string> keywords, CancellationToken ct)
    {
        if (keywords.Count == 0) return [];

        // Build a query that scores products by how many keywords they match.
        // EF Core translates this to a LIKE-based WHERE in SQL.
        var query = _db.Products
            .AsNoTracking()
            .Where(p => p.TenantId == tenantId
                     && p.Status == Domain.Enums.ProductStatus.Active
                     && !p.IsDeleted);

        // Add keyword filter (any keyword hits Title or Description)
        foreach (var kw in keywords)
        {
            var capture = kw; // avoid closure capture of loop variable
            query = query.Where(p =>
                p.Title.Contains(capture) ||
                (p.Description != null && p.Description.Contains(capture)));
        }

        return await query
            .OrderByDescending(p => p.IsFeatured)
            .Take(5)
            .Select(p => new ProductSummary(
                p.Id, p.Title, p.Description,
                p.DiscountedPrice ?? p.BasePrice,
                p.StockQuantity,
                p.Category != null ? p.Category.Name : null))
            .ToListAsync(ct);
    }

    /// <summary>
    /// Very lightweight keyword extractor — removes stop words and returns distinct tokens ≥ 3 chars.
    /// No NLP library dependency; good enough for Indian small-business product names.
    /// </summary>
    private static readonly HashSet<string> StopWords =
    [
        "the","a","an","is","it","in","on","at","to","for","of","and","or","but",
        "i","me","my","we","you","do","can","please","want","need","send","get",
        "tell","know","show","have","has","are","was","were","be","been","being",
        "this","that","what","which","how","when","where","who","will","would",
        "kya","hai","mujhe","mera","hum","aap","karo","chahiye","please","bhai",
        "yeh","woh","aur","ya","se","ko","ka","ki","ke","nahi","nhi","ho","hoga"
    ];

    private static List<string> ExtractKeywords(string text)
    {
        return text
            .ToLowerInvariant()
            .Split([' ', ',', '.', '!', '?', ':', ';', '\n', '\r', '-', '_'], StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 3 && !StopWords.Contains(w))
            .Distinct()
            .Take(6)
            .ToList();
    }

    private static List<ChatMessage> DeserializeMessages(string messagesJson)
    {
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<List<ChatMessage>>(messagesJson) ?? [];
        }
        catch
        {
            return [];
        }
    }
}

// ── Value objects returned by the builder ─────────────────────────────────────

public record RagContext(
    BusinessInfo? Business,
    IReadOnlyList<ProductSummary> Products,
    IReadOnlyList<OrderSummary> RecentOrders,
    IReadOnlyList<ChatMessage> ConversationHistory,
    ConversationSession Session);

public record BusinessInfo(
    string Name,
    string? DeliveryInfo,
    string? BusinessHours,
    string Currency,
    string? StoreContext,
    string Tone,
    string? WhatsAppNumber);

public record ProductSummary(
    Guid Id,
    string Title,
    string? Description,
    decimal Price,
    int? Stock,
    string? Category);

public record OrderSummary(
    Guid Id,
    string OrderNumber,
    Domain.Enums.OrderStatus Status,
    decimal Total,
    DateTime PlacedAt);

public record ChatMessage(string Role, string Content);
