namespace ReplyCart.Application.Common.Interfaces;

/// <summary>
/// A function the model is allowed to call during an agent turn.
/// <paramref name="ParametersJsonSchema"/> is a raw JSON Schema object, passed to the
/// provider verbatim — keep it small, the schema is billed as input tokens on every call.
/// </summary>
public sealed record AgentTool(
    string Name,
    string Description,
    string ParametersJsonSchema);

/// <summary>One tool invocation requested by the model.</summary>
public sealed record AgentToolCall(
    string Id,
    string Name,
    string ArgumentsJson);

/// <summary>
/// One entry in the running message array for an agent turn.
/// Role is system | user | assistant | tool. <see cref="ToolCalls"/> is only ever set on
/// an assistant message; <see cref="ToolCallId"/> only on a tool message.
/// </summary>
public sealed record AgentMessage(
    string                        Role,
    string?                       Content    = null,
    IReadOnlyList<AgentToolCall>? ToolCalls  = null,
    string?                       ToolCallId = null)
{
    public static AgentMessage System(string content)    => new("system",    content);
    public static AgentMessage User(string content)      => new("user",      content);
    public static AgentMessage Assistant(string content) => new("assistant", content);

    public static AgentMessage AssistantToolCalls(IReadOnlyList<AgentToolCall> calls) =>
        new("assistant", null, calls);

    public static AgentMessage ToolResult(string toolCallId, string content) =>
        new("tool", content, null, toolCallId);
}

/// <summary>
/// The outcome of ONE model call inside an agent turn: either tool calls to execute,
/// or the final prose reply. Never both in practice, but the shape allows both.
/// </summary>
public sealed record AgentStepResult(
    string?                      Content,
    IReadOnlyList<AgentToolCall> ToolCalls,
    int                          PromptTokens     = 0,
    int                          CompletionTokens = 0)
{
    public bool WantsTools => ToolCalls.Count > 0;

    public static AgentStepResult Reply(string content, int promptTokens = 0, int completionTokens = 0) =>
        new(content, Array.Empty<AgentToolCall>(), promptTokens, completionTokens);
}

/// <summary>
/// Tool-calling entry point, used by the Chatbot-as-a-Service agent loop.
///
/// Deliberately separate from <see cref="IAiProvider.HandleConversationAsync"/>, which
/// remains the single-shot, JSON-envelope contract used by the tenant RAG pipeline.
/// Implementations of both live on the same provider class, so DI registration is
/// unchanged — see Infrastructure/DependencyInjection.
/// </summary>
public interface IAgentAiProvider
{
    /// <summary>
    /// Runs one turn of the agent loop. Pass an empty <paramref name="tools"/> list to
    /// force a prose answer — the loop uses this on its final iteration so a model that
    /// keeps requesting tools can never hang a buyer's message.
    /// </summary>
    Task<AgentStepResult> RunAgentStepAsync(
        IReadOnlyList<AgentMessage> messages,
        IReadOnlyList<AgentTool>    tools,
        CancellationToken           ct = default);
}
