namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// In-memory, per-session conversation history for the storefront AI chatbot.
/// Implemented as a singleton so sessions survive across HTTP requests.
/// </summary>
public interface IConversationMemoryService
{
    /// <summary>Returns the message history for the given session (empty list if unknown).</summary>
    IReadOnlyList<ConversationMessage> GetHistory(string sessionId);

    /// <summary>Appends a user message and the subsequent assistant reply to the session.</summary>
    void AddMessages(string sessionId, ConversationMessage userMsg, ConversationMessage assistantMsg);

    /// <summary>Removes all history for the given session.</summary>
    void ClearSession(string sessionId);
}
