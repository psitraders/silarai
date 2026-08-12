using Microsoft.Extensions.Logging;
using ReplyCart.Application.Common.Interfaces;

namespace ReplyCart.Application.Chatbot.Agent;

/// <summary>Everything one agent turn needs. No I/O — the caller has already loaded it all.</summary>
public sealed record ChatbotAgentRequest(
    string                             UserMessage,
    IReadOnlyList<ConversationMessage> History,
    IReadOnlyList<ChatbotCatalogItem>  Catalogue,
    ChatCart                           Cart,
    ChatProfile                        Profile,
    string                             Currency,
    ChatbotCatalogItem?                Focused        = null,
    bool                               CanPlaceOrders = true);

/// <summary>The outcome of one agent turn.</summary>
public sealed record ChatbotAgentResult(
    string                            ReplyText,
    ChatCart                          Cart,
    /// <summary>
    /// The carousel. Drawn from what the model actually looked up this turn, so the
    /// cards and the words can never disagree.
    /// </summary>
    IReadOnlyList<ChatbotCatalogItem> Cards,
    /// <summary>Set when the model called place_order. The CALLER creates the order.</summary>
    ChatbotOrderIntent?               OrderIntent,
    /// <summary>Merged profile updates from save_customer_details / place_order.</summary>
    ChatProfilePatch?                 ProfilePatch,
    string?                           StateSignal,
    int                               PromptTokens,
    int                               CompletionTokens,
    IReadOnlyList<string>             ThinkingLines);

/// <summary>
/// The tool-calling loop behind the Chatbot-as-a-Service module.
///
/// Replaces the previous single-shot design, where the whole answer hung on a
/// keyword-picked shortlist of 12 products stuffed into the prompt. That shortlist was
/// seeded from the PREVIOUS turn's shortlist, so from turn two onward it crowded out
/// the current query's matches entirely and the model answered from stale products
/// while the carousel — which re-ranked from scratch — showed the right ones. Here the
/// model asks for what it needs and the carousel renders what it asked for, so the two
/// cannot disagree by construction.
///
/// Bounded on purpose: at most <see cref="MaxIterations"/> model calls per turn, and the
/// final iteration is made with no tools at all, which forces prose. A model that loops
/// on search_catalog therefore costs a fixed ceiling and can never hang a buyer's message.
/// </summary>
public sealed class ChatbotAgent(IAgentAiProvider provider, ILogger<ChatbotAgent> logger)
{
    /// <summary>Model calls per turn, including the forced-prose final call.</summary>
    private const int MaxIterations = 4;

    /// <summary>Tool calls honoured per turn across all iterations.</summary>
    private const int MaxToolCalls = 8;

    /// <summary>Cards the widget renders. Matches the previous carousel cap.</summary>
    private const int CardCount = 6;

    private const string FallbackReply =
        "Sorry — I couldn't pull that up just now. Could you tell me a bit more about what you're looking for?";

    public async Task<ChatbotAgentResult> RunAsync(
        string                                  systemPrompt,
        ChatbotAgentRequest                     request,
        Func<string, CancellationToken, Task>?  onThinking,
        CancellationToken                       ct = default)
    {
        var focusedMode = request.Focused != null;
        var tools       = ChatbotAgentTools.For(focusedMode, request.CanPlaceOrders);

        var messages = new List<AgentMessage>(request.History.Count + 4)
        {
            AgentMessage.System(systemPrompt),
        };
        foreach (var m in request.History)
            messages.Add(new AgentMessage(m.Role, m.Content));
        messages.Add(AgentMessage.User(request.UserMessage));

        var cart        = request.Cart;
        var surfaced    = new List<ChatbotCatalogItem>();
        var thinking    = new List<string>();
        var patch       = (ChatProfilePatch?)null;
        var promptTok   = 0;
        var completeTok = 0;
        var toolBudget  = MaxToolCalls;

        for (var iteration = 0; iteration < MaxIterations; iteration++)
        {
            // Last pass, or the tool budget is spent: withhold the tools so the model
            // has no option but to answer in words.
            var forceProse  = iteration == MaxIterations - 1 || toolBudget <= 0;
            var stepTools   = forceProse ? Array.Empty<AgentTool>() : tools;

            AgentStepResult step;
            try
            {
                step = await provider.RunAgentStepAsync(messages, stepTools, ct);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Chatbot agent step failed on iteration {Iteration}", iteration);
                return Finish(FallbackReply, cart, surfaced, null, patch, promptTok, completeTok, thinking, request);
            }

            promptTok   += step.PromptTokens;
            completeTok += step.CompletionTokens;

            if (!step.WantsTools)
            {
                var reply = string.IsNullOrWhiteSpace(step.Content) ? FallbackReply : step.Content!.Trim();
                return Finish(reply, cart, surfaced, null, patch, promptTok, completeTok, thinking, request);
            }

            messages.Add(AgentMessage.AssistantToolCalls(step.ToolCalls));

            foreach (var call in step.ToolCalls)
            {
                toolBudget--;

                var line = ChatbotAgentTools.Describe(call, request.Currency);
                thinking.Add(line);
                if (onThinking != null) await onThinking(line, ct);

                // place_order is terminal: stop here and hand the details back. The
                // caller owns order creation, so the order number, the total and the
                // Razorpay handoff are all server-generated and the model cannot
                // announce an order that was never actually written.
                if (call.Name == ChatbotAgentTools.PlaceOrder)
                {
                    var intent = ChatbotAgentTools.ReadOrderIntent(call.ArgumentsJson);
                    patch = Merge(patch, new ChatProfilePatch(
                        Name:          intent.Name,
                        Phone:         intent.Phone,
                        Address:       intent.Address,
                        PaymentMethod: intent.PaymentMethod));

                    return Finish("", cart, surfaced, intent, patch, promptTok, completeTok, thinking, request);
                }

                var outcome = Execute(call, request, cart, ct);

                if (outcome.Cart  != null) cart = outcome.Cart;
                if (outcome.Patch != null) patch = Merge(patch, outcome.Patch);
                if (outcome.Surfaced is { Count: > 0 })
                {
                    foreach (var p in outcome.Surfaced)
                        if (surfaced.All(x => x.Id != p.Id)) surfaced.Add(p);
                }

                messages.Add(AgentMessage.ToolResult(call.Id, outcome.Content));
            }
        }

        // Unreachable in practice — the final iteration always forces prose.
        logger.LogWarning("Chatbot agent exhausted {Max} iterations without a reply.", MaxIterations);
        return Finish(FallbackReply, cart, surfaced, null, patch, promptTok, completeTok, thinking, request);
    }

    private ChatbotAgentTools.ToolOutcome Execute(
        AgentToolCall       call,
        ChatbotAgentRequest request,
        ChatCart            cart,
        CancellationToken   ct)
    {
        ct.ThrowIfCancellationRequested();

        try
        {
            return call.Name switch
            {
                ChatbotAgentTools.SearchCatalog =>
                    ChatbotAgentTools.ExecuteSearch(request.Catalogue, call.ArgumentsJson, request.Currency),

                ChatbotAgentTools.GetProductDetails =>
                    ChatbotAgentTools.ExecuteDetails(request.Catalogue, call.ArgumentsJson, request.Currency),

                ChatbotAgentTools.UpdateCart =>
                    ChatbotAgentTools.ExecuteCartUpdate(
                        cart, request.Catalogue, request.Focused, call.ArgumentsJson, request.Currency),

                ChatbotAgentTools.SaveCustomerDetails =>
                    ChatbotAgentTools.ExecuteSaveDetails(call.ArgumentsJson),

                _ => new ChatbotAgentTools.ToolOutcome($"Unknown tool '{call.Name}'. Use one of the tools provided."),
            };
        }
        catch (Exception ex)
        {
            // A tool must never take the turn down — report the failure to the model
            // and let it recover in words.
            logger.LogError(ex, "Chatbot tool {Tool} threw", call.Name);
            return new ChatbotAgentTools.ToolOutcome("That lookup failed. Ask the customer to rephrase.");
        }
    }

    /// <summary>
    /// Decides the carousel and the state signal, then packages the turn.
    ///
    /// Cards come from what the model actually searched this turn — never from a
    /// separate ranker — capped at <see cref="CardCount"/>. They are suppressed once the
    /// buyer is in the order flow, so a carousel never interrupts checkout.
    /// </summary>
    private static ChatbotAgentResult Finish(
        string                            reply,
        ChatCart                          cart,
        List<ChatbotCatalogItem>          surfaced,
        ChatbotOrderIntent?               intent,
        ChatProfilePatch?                 patch,
        int                               promptTokens,
        int                               completionTokens,
        List<string>                      thinking,
        ChatbotAgentRequest               request)
    {
        // State is recomputed every turn, never simply inherited. ChatProfile.State is
        // otherwise monotonic — save_customer_details only ever advances it to
        // "collecting_info" and a placed order pins it at "ordered" — and nothing in the
        // session store ever writes it back. Inheriting it therefore suppressed the
        // carousel for the REST OF THE SESSION after the first order (or after the buyer
        // simply gave their name), and because sessionId is persisted in the widget's
        // localStorage and the Redis profile TTL slides on every read, a page refresh
        // rejoined the same dead state.
        var state = intent != null ? "ordered" : patch?.State ?? request.Profile.State;

        // A fresh search/lookup THIS TURN is the strongest signal of what the buyer
        // wants right now, and it overrides a stale or even a same-turn "collecting_info"
        // signal. Without this, a buyer who volunteers a detail in the same breath as a
        // product question ("Hi, I'm Ravi, show me some sarees") loses the carousel: the
        // model calls save_customer_details AND search_catalog in one turn, the patch
        // marks state "collecting_info", and the old check (which required NO patch at
        // all this turn) suppressed cards for a search that had literally just happened.
        // "ordered" is excluded below because it is terminal, not in-flight — the
        // order-placing turn itself is already covered by intent != null.
        var justSearched = surfaced.Count > 0;
        var inOrderFlow = intent != null
            || (!justSearched && state is "collecting_info" or "confirming" or "order_ready");

        IReadOnlyList<ChatbotCatalogItem> cards;

        if (request.Focused is { } pinned)
        {
            // Single-product mode: the widget pins this in its header and renders no
            // carousel, but the id still has to travel back.
            cards = new List<ChatbotCatalogItem> { pinned };
        }
        else if (inOrderFlow)
        {
            // Never interrupt checkout with a product carousel.
            cards = Array.Empty<ChatbotCatalogItem>();
        }
        else if (justSearched)
        {
            cards = surfaced.Take(CardCount).ToList();
        }
        else
        {
            // Nothing was looked up this turn, but the model can still answer a product
            // question from what it already said — "tell me more about the pearl ones"
            // needs no new tool call. That produced a product-listing reply with no cards
            // under it. Fall back to the products the reply itself NAMES, so a listing
            // reply always carries its carousel.
            //
            // Deliberately placed AFTER the inOrderFlow check, never before: during
            // checkout the model naturally names the item being ordered ("your Gold
            // Jhumka Earrings will be delivered soon"), and that must not resurrect the
            // carousel mid-order. Only a real tool call (justSearched) is trusted to
            // override order-flow suppression; a text mention is not.
            cards = ChatbotCatalogSelector.MentionedIn(reply, request.Catalogue, CardCount);
        }

        return new ChatbotAgentResult(
            reply, cart, cards, intent, patch, state,
            promptTokens, completionTokens, thinking);
    }

    /// <summary>Later non-null fields win; nulls never clear an existing value.</summary>
    private static ChatProfilePatch Merge(ChatProfilePatch? a, ChatProfilePatch b) =>
        a == null
            ? b
            : new ChatProfilePatch(
                Name:                b.Name                ?? a.Name,
                Phone:               b.Phone               ?? a.Phone,
                Address:             b.Address             ?? a.Address,
                State:               b.State               ?? a.State,
                PaymentMethod:       b.PaymentMethod       ?? a.PaymentMethod,
                FocusedProductId:    b.FocusedProductId    ?? a.FocusedProductId,
                LastShownProductIds: b.LastShownProductIds ?? a.LastShownProductIds);
}
