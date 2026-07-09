using ReplyCart.Domain.Common;

namespace ReplyCart.Domain.Chatbot;

/// <summary>
/// One row per AI call made on behalf of a chatbot client.
/// TenantId is denormalised from the client at write time so the admin
/// per-tenant report never needs a join against a possibly-deleted client.
/// </summary>
public class ChatbotTokenUsage : BaseEntity
{
    public Guid   ClientId         { get; set; }
    public Guid?  TenantId         { get; set; }
    public string Channel          { get; set; } = "web";   // web | whatsapp | facebook | instagram
    public int    PromptTokens     { get; set; }
    public int    CompletionTokens { get; set; }
}
