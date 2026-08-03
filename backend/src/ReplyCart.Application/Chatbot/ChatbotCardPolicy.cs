namespace ReplyCart.Application.Chatbot;

/// <summary>What the buyer's message is asking for, in catalogue terms.</summary>
public enum ChatbotQueryKind
{
    /// <summary>Nothing product-related — a greeting, a policy question, an answer to our question.</summary>
    NoIntent,

    /// <summary>Message keyword-matched real products.</summary>
    SpecificMatch,

    /// <summary>"show me what you have", "what do you sell" — browsing with no particular item in mind.</summary>
    GenericBrowse,

    /// <summary>The buyer named something specific that we do not stock.</summary>
    UnmatchedRequest,
}

public sealed record ChatbotQueryIntent(
    ChatbotQueryKind                  Kind,
    IReadOnlyList<ChatbotCatalogItem> Matches);

/// <summary>Why cards were or were not returned. Logged, not shown to the buyer.</summary>
public enum ChatbotCardReason
{
    Focused,
    KeywordMatch,
    GenericBrowse,
    SuppressedOrderFlow,
    SuppressedNoMatch,
    SuppressedNoIntent,
    SuppressedEmptyCatalogue,
}

public sealed record ChatbotCardDecision(
    IReadOnlyList<ChatbotCatalogItem> Cards,
    ChatbotCardReason                 Reason)
{
    public bool ShowCards => Cards.Count > 0;
}

/// <summary>
/// Decides whether a product carousel belongs in this turn.
///
/// Previously cards were effectively unconditional: the server fell back to a
/// one-per-category spread whenever keyword ranking found nothing, and the widget
/// had a *second* fallback that did the same thing again client-side. The result was
/// a carousel after every single message, including "hi" and "my address is ...".
///
/// The decision is made server-side and is authoritative — the widget renders
/// whatever comes back and has no fallback of its own.
/// </summary>
public static class ChatbotCardPolicy
{
    public const int DefaultCardCount = 6;

    /// <summary>
    /// Conversation states where the buyer is being asked for their details.
    /// Showing products here interrupts the checkout.
    /// </summary>
    private static readonly HashSet<string> OrderFlowStates = new(StringComparer.OrdinalIgnoreCase)
    {
        "collecting_info", "confirming", "order_ready", "ordered",
    };

    /// <summary>
    /// Words that signal browsing rather than a specific product. Used only to tell
    /// "show me what you've got" (worth a category spread) apart from
    /// "do you have earrings" (a specific ask we can't fill).
    /// </summary>
    private static readonly HashSet<string> BrowseWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "show", "browse", "explore", "view", "see", "list", "display",
        "catalog", "catalogue", "collection", "collections", "range", "variety",
        "option", "options", "choice", "choices",
        "recommend", "recommendation", "recommendations", "suggest", "suggestion", "suggestions",
        "available", "availability", "have", "has", "sell", "sells", "stock", "carry",
        "offer", "offers", "deal", "deals", "sale", "discount", "discounts",
        "new", "latest", "newest", "popular", "best", "bestseller", "trending", "featured",
        "product", "products", "item", "items", "thing", "things", "stuff",
        "anything", "something", "everything",
        "looking", "interested", "interest", "buy", "shop", "shopping", "order",
        "price", "prices", "pricing", "cost", "budget", "cheap", "affordable",
        "category", "categories",
    };

    /// <summary>Conversational filler that carries no product meaning.</summary>
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "the", "and", "for", "with", "you", "your", "yours", "are", "was", "were",
        "does", "did", "can", "could", "would", "should", "will", "please",
        "any", "some", "get", "got", "want", "need", "like", "want", "give",
        "this", "that", "these", "those", "there", "here", "what", "whats", "which",
        "how", "much", "many", "about", "tell", "know", "let", "just", "also",
        "hey", "hii", "hello", "helo", "thanks", "thank", "okay", "yes", "yeah",
        "sure", "good", "morning", "evening", "afternoon", "night",
        "from", "your", "our", "their", "its", "not", "but",
    };

    /// <summary>
    /// Classifies the buyer's message. Depends only on the message and the catalogue,
    /// so it can run before the AI call and feed the prompt.
    /// </summary>
    public static ChatbotQueryIntent Classify(
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        string?                           message,
        int                               take = DefaultCardCount)
    {
        if (catalogue.Count == 0)
            return new ChatbotQueryIntent(ChatbotQueryKind.NoIntent, Array.Empty<ChatbotCatalogItem>());

        var matches = ChatbotCatalogSelector.Rank(catalogue, message, take);
        if (matches.Count > 0)
            return new ChatbotQueryIntent(ChatbotQueryKind.SpecificMatch, matches);

        var tokens = Tokenise(message);
        if (tokens.Count == 0)
            return new ChatbotQueryIntent(ChatbotQueryKind.NoIntent, Array.Empty<ChatbotCatalogItem>());

        var hasBrowseWord = tokens.Any(BrowseWords.Contains);
        if (!hasBrowseWord)
            return new ChatbotQueryIntent(ChatbotQueryKind.NoIntent, Array.Empty<ChatbotCatalogItem>());

        // Browse-ish, but did they name something concrete? Anything left after
        // stripping filler and browse words is treated as a specific request.
        var contentWords = tokens
            .Where(t => !BrowseWords.Contains(t) && !StopWords.Contains(t))
            .ToList();

        return contentWords.Count == 0
            ? new ChatbotQueryIntent(ChatbotQueryKind.GenericBrowse, Array.Empty<ChatbotCatalogItem>())
            : new ChatbotQueryIntent(ChatbotQueryKind.UnmatchedRequest, Array.Empty<ChatbotCatalogItem>());
    }

    /// <summary>
    /// Turns the classification into a card decision. Takes the conversation state
    /// AFTER the AI turn, so a reply that just moved the buyer into checkout
    /// suppresses cards immediately rather than one turn late.
    /// </summary>
    public static ChatbotCardDecision Decide(
        ChatbotQueryIntent                intent,
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        ChatbotCatalogItem?               focused,
        string?                           conversationState,
        int                               take = DefaultCardCount)
    {
        // Single-product mode: the widget pins the product in its header and never
        // renders a carousel, but the AI still needs this id anchored.
        if (focused != null)
            return new ChatbotCardDecision([focused], ChatbotCardReason.Focused);

        if (catalogue.Count == 0)
            return Empty(ChatbotCardReason.SuppressedEmptyCatalogue);

        if (conversationState != null && OrderFlowStates.Contains(conversationState))
            return Empty(ChatbotCardReason.SuppressedOrderFlow);

        return intent.Kind switch
        {
            ChatbotQueryKind.SpecificMatch =>
                new ChatbotCardDecision(intent.Matches, ChatbotCardReason.KeywordMatch),

            ChatbotQueryKind.GenericBrowse =>
                new ChatbotCardDecision(
                    ChatbotCatalogSelector.SpreadAcrossCategories(catalogue, take),
                    ChatbotCardReason.GenericBrowse),

            // They asked for something we don't stock. Showing unrelated products
            // reads as ignoring them — the AI asks a follow-up instead.
            ChatbotQueryKind.UnmatchedRequest => Empty(ChatbotCardReason.SuppressedNoMatch),

            _ => Empty(ChatbotCardReason.SuppressedNoIntent),
        };
    }

    private static ChatbotCardDecision Empty(ChatbotCardReason reason) =>
        new(Array.Empty<ChatbotCatalogItem>(), reason);

    private static List<string> Tokenise(string? message) =>
        (message ?? string.Empty)
            .ToLowerInvariant()
            .Split([' ', ',', '.', '?', '!', '\n', '\t', ';', ':', '/', '-', '\'', '"', '(', ')'],
                   StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 3)
            .Distinct()
            .ToList();
}
