namespace ReplyCart.Application.Chatbot;

/// <summary>
/// Picks the knowledge-base passages worth injecting into the prompt.
///
/// The chunking itself now happens once per client and is cached
/// (see IChatbotContextCache); this used to re-slice every uploaded document's
/// full extracted text on every single chat turn.
/// </summary>
public static class ChatbotKnowledgeSelector
{
    public const int ChunkSize = 600;

    /// <summary>Splits raw extracted document text into fixed-size passages.</summary>
    public static IEnumerable<ChatbotKnowledgeChunk> Chunk(string fileName, string? extractedText)
    {
        if (string.IsNullOrWhiteSpace(extractedText)) yield break;

        for (var i = 0; i < extractedText.Length; i += ChunkSize)
            yield return new ChatbotKnowledgeChunk(
                fileName,
                extractedText.Substring(i, Math.Min(ChunkSize, extractedText.Length - i)));
    }

    /// <summary>Keyword-ranks passages against the buyer's message, capped by character budget.</summary>
    public static string? Select(
        IReadOnlyList<ChatbotKnowledgeChunk> chunks,
        string?                              message,
        int                                  maxChars = 3000)
    {
        if (chunks.Count == 0) return null;

        var words = (message ?? string.Empty)
            .ToLowerInvariant()
            .Split([' ', ',', '.', '?', '!', '\n', '\t', ';', ':'], StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 3)
            .Distinct()
            .ToList();

        var scored = chunks
            .Select(c => (chunk: c, score: words.Count(w => c.Text.Contains(w, StringComparison.OrdinalIgnoreCase))))
            .ToList();

        var picked = scored.Any(x => x.score > 0)
            ? scored.Where(x => x.score > 0).OrderByDescending(x => x.score).Select(x => x.chunk)
            : chunks.Take(6);   // no keyword hit → the opening passages

        var sb   = new System.Text.StringBuilder();
        var used = 0;

        foreach (var chunk in picked)
        {
            var text = chunk.Text.Trim();
            if (used + text.Length > maxChars) break;
            sb.AppendLine($"[{chunk.FileName}] {text}");
            used += text.Length;
        }

        return sb.Length > 0 ? sb.ToString() : null;
    }
}
