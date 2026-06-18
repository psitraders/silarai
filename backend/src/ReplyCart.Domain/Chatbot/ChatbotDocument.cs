using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Chatbot;

/// <summary>
/// A knowledge-base document uploaded for a chatbot client (privacy policy, returns
/// policy, compliance docs, FAQs, etc). The extracted plain text is retrieved at chat
/// time and injected into the AI's system prompt so it can answer policy questions.
/// </summary>
public class ChatbotDocument : BaseEntity
{
    public Guid    ClientId      { get; set; }
    public string  FileName      { get; set; } = string.Empty;
    public string  ContentType   { get; set; } = string.Empty;
    public long    SizeBytes     { get; set; }
    public int     CharCount     { get; set; }
    public string  ExtractedText { get; set; } = string.Empty;

    public ChatbotClient Client { get; set; } = null!;
}
