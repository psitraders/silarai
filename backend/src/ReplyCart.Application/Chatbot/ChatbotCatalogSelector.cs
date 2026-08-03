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
