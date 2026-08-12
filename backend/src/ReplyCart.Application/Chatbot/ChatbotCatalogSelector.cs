namespace ReplyCart.Application.Chatbot;

/// <summary>
/// Picks the handful of products that are worth spending prompt tokens on.
///
/// Replaces the previous behaviour of inlining the ENTIRE catalogue into the system
/// prompt on every turn, which made prompt cost scale linearly with catalogue size.
/// </summary>
public static class ChatbotCatalogSelector
{
    private const int MinWordLength = 3;

    /// <summary>
    /// Shortest product title that may be matched inside reply text. Guards against a
    /// one-word generic title ("Ring", "Set") turning an unrelated sentence into a card.
    /// </summary>
    private const int MinTitleLength = 6;

    /// <summary>Keyword-scores the catalogue against the buyer's message. Highest score first.</summary>
    public static List<ChatbotCatalogItem> Rank(
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        string?                           message,
        int                               take)
    {
        if (catalogue.Count == 0 || take <= 0) return [];

        var words = Tokenise(message);
        if (words.Count == 0) return [];

        return catalogue
            .Select(p => (product: p, score: Score(p, words)))
            .Where(x => x.score > 0)
            .OrderByDescending(x => x.score)
            .ThenBy(x => x.product.Title)
            .Take(take)
            .Select(x => x.product)
            .ToList();
    }

    /// <summary>One product per category — the "we matched nothing, show something useful" fallback.</summary>
    public static List<ChatbotCatalogItem> SpreadAcrossCategories(
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        int                               take)
    {
        if (catalogue.Count == 0 || take <= 0) return [];

        return catalogue
            .GroupBy(p => p.Category ?? "Other")
            .OrderBy(g => g.Key)
            .SelectMany(g => g.Take(1))
            .Take(take)
            .ToList();
    }

    /// <summary>
    /// The products the prompt should describe in full: everything already in the cart,
    /// then what we showed last turn, then keyword matches, then a category spread.
    /// Order is preserved and duplicates removed.
    /// </summary>
    public static List<ChatbotCatalogItem> BuildPromptSet(
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        string?                           message,
        IEnumerable<Guid>                 pinnedProductIds,
        int                               budget)
    {
        var picked = new List<ChatbotCatalogItem>();
        var seen   = new HashSet<Guid>();

        void Add(IEnumerable<ChatbotCatalogItem> items)
        {
            foreach (var p in items)
            {
                if (picked.Count >= budget) return;
                if (seen.Add(p.Id)) picked.Add(p);
            }
        }

        var byId = catalogue.ToDictionary(p => p.Id);
        Add(pinnedProductIds.Where(byId.ContainsKey).Select(id => byId[id]));
        Add(Rank(catalogue, message, budget));
        if (picked.Count == 0) Add(SpreadAcrossCategories(catalogue, budget));

        return picked;
    }

    /// <summary>
    /// The catalogue products a reply actually NAMES, in the order it names them.
    ///
    /// This is the carousel's fallback source when the model answered a product question
    /// without calling a tool that turn — a follow-up like "tell me more about the pearl
    /// ones" can be answered from what it already said last turn, so nothing is surfaced,
    /// and the buyer gets a product-listing reply with no cards under it.
    ///
    /// This is NOT the old client-side ranker that was deliberately removed (see
    /// context.md §4.8). That one ranked the BUYER'S message and fell back to a category
    /// spread, so it produced cards after literally every message including "hi". This
    /// matches only exact product titles present in the model's OWN reply text, so the
    /// cards still cannot disagree with the words — they are derived from them. A reply
    /// that names no product produces no cards.
    /// </summary>
    public static List<ChatbotCatalogItem> MentionedIn(
        string?                           replyText,
        IReadOnlyList<ChatbotCatalogItem> catalogue,
        int                               take)
    {
        if (string.IsNullOrWhiteSpace(replyText) || catalogue.Count == 0 || take <= 0) return [];

        var hay   = replyText.ToLowerInvariant();
        var spans = new List<(int Start, int End, ChatbotCatalogItem Product)>();

        // Longest titles first, so a longer title claims its span before a shorter title
        // that happens to be a substring of it can match inside ("Antique Peacock
        // Contemporary Earrings" must not also surface a separate "Peacock Earrings").
        foreach (var p in catalogue.OrderByDescending(p => p.Title?.Length ?? 0))
        {
            var title = p.Title?.Trim();
            if (string.IsNullOrEmpty(title) || title.Length < MinTitleLength) continue;

            var idx = hay.IndexOf(title.ToLowerInvariant(), StringComparison.Ordinal);
            if (idx < 0) continue;

            var end = idx + title.Length;
            if (spans.Any(s => idx < s.End && end > s.Start)) continue;   // span already claimed

            spans.Add((idx, end, p));
        }

        return spans.OrderBy(s => s.Start).Select(s => s.Product).Take(take).ToList();
    }

    public static List<string> Categories(IReadOnlyList<ChatbotCatalogItem> catalogue) =>
        catalogue
            .Select(p => p.Category)
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Select(c => c!.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(c => c)
            .ToList();

    private static int Score(ChatbotCatalogItem p, List<string> words)
    {
        var haystack = p.SearchText;
        var score    = 0;

        foreach (var w in words)
        {
            if (!haystack.Contains(w, StringComparison.Ordinal)) continue;
            // A title hit is worth more than a description hit.
            score += p.Title.Contains(w, StringComparison.OrdinalIgnoreCase) ? 3 : 1;
        }

        return score;
    }

    private static List<string> Tokenise(string? message) =>
        (message ?? string.Empty)
            .ToLowerInvariant()
            .Split([' ', ',', '.', '?', '!', '\n', '\t', ';', ':', '/', '-'],
                   StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= MinWordLength)
            .Distinct()
            .ToList();
}
