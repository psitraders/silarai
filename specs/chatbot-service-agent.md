---
id: chatbot-service-agent
status: current
prefix: CBS
related: [chatbot-service, chatbot-service-widget, channels-inbox, ai-tenant-chatbot]
---
# Chatbot-as-a-Service — Conversation Agent & Session Store

## Purpose
The server side of a chatbot-client conversation: a bounded tool-calling agent that searches the client's catalogue, keeps a server-side cart, collects delivery details and places orders whose prices the AI never decides; backed by a Redis → memory → SQL session store that degrades instead of failing.

## Scope
- **In:** `ChatbotController` (`/chatbot/{apiKey}/…`), `ChatbotAgent` + `ChatbotAgentTools` + `ChatbotAgentPromptBuilder`, `ChatbotCartResolver`, carousel policy, NDJSON transport, `IAgentAiProvider`, `IChatSessionStore` (Redis / in-memory / SQL archive), `IChatbotContextCache`, token accounting, the channel single-shot path (`ChatbotClientWebhookHelper` + `ChatbotPromptBuilder`), order creation and Razorpay verify.
- **Out:** client administration (`chatbot-service`), the browser widget (`chatbot-service-widget`), the tenant pipelines (`ai-tenant-chatbot*`, INV-3).

## Functional behaviour
- **Per turn (`POST /chatbot/{apiKey}/message`, web widget + admin test panel):**
  1. Resolve the `ChatbotClient` by API key from SQL (never cached — it carries `RazorpayKeySecret`).
  2. `IChatbotContextCache` supplies the catalogue (`ChatbotCatalogItem` projections) and the **pre-chunked** knowledge base from Redis + `IMemoryCache`; invalidated by every product / document / Shopify / client write.
  3. `IChatSessionStore.GetAsync` returns history + cart + profile in one round trip.
  4. `ChatbotCartResolver.Reprice` re-resolves every stored cart line against the live catalogue — stale prices and delisted products never reach an order.
  5. `ChatbotAgentPromptBuilder` builds the prompt (static prefix + dynamic suffix). The catalogue is **never inlined** — the model gets a category index and searches for the rest (~570 tokens at 50 or 2,000 products).
  6. `ChatbotAgent.RunAsync`: call the model with tools → run tool calls server-side → feed results back → repeat until prose. Max 4 model calls and 8 tool calls per turn; the last iteration has **no tools**, forcing prose. Token usage is summed across the turn and recorded once to `ChatbotTokenUsages`.
  7. `place_order` is **terminal**: the loop stops with a `ChatbotOrderIntent`; the controller builds the order from the **server cart** (order number, total and Razorpay hand-off are server-generated), refuses an empty cart, clears the cart and sets state `ordered`. COD orders are `placed` / `pending`; online orders get a Razorpay order and are confirmed by `POST orders/{id}/verify-payment` (HMAC check with the client's secret). New orders are POSTed to the client's `WebhookUrl`.
- **Tools (`ChatbotAgentTools`):**

  | Tool | Server behaviour |
  |---|---|
  | `search_catalog(query, category?, min_price?, max_price?)` | Filter + keyword rank over the cached catalogue, max 8. Falls back to the filtered set if ranking finds nothing, and to a "we don't stock it" instruction if there is genuinely no match. |
  | `get_product_details(product_ids[])` | Full description (clamped 220 chars) + variants, max 6, ids validated against the catalogue. |
  | `update_cart(ops[])` | `ChatbotCartResolver.Apply`; unresolvable ops dropped; an unchanged cart after a mutating op is reported as a failure; `add`/`set` on a product with variants but no `variant` is held back and the model is told to ask (CBS-R6). |
  | `save_customer_details(name?, phone?, address?, payment_method?)` | Persists to `ChatProfile`, sets state `collecting_info`. |
  | `place_order(name, phone, address, payment_method?)` | Terminal — see step 7. |

  In **focused mode** (`focusedProductId`, widget pinned to one product) the two catalogue tools are withheld, so "only discuss this product" is enforced by absence. `place_order` is withheld when `CanPlaceOrders` is false.
- **Thinking lines:** one-liners such as "Searching for gold earrings under INR 5,000…" are generated server-side from each tool call (`ChatbotAgentTools.Describe`) — no tokens, no latency.
- **Product carousel** (`ChatbotAgent.Finish`, authoritative — the widget has no fallback): (1) products the model looked up this turn (deduped, max 6); else (2) exact product titles named in the model's **own reply** (`ChatbotCatalogSelector.MentionedIn`, longest title first, `MinTitleLength` 6). Suppressed in focused mode and during the order flow (`collecting_info` / `confirming` / `order_ready`). The reply-text fallback runs **after** the order-flow check, so a product named at checkout never resurrects the carousel; only a real search this turn (`justSearched`) overrides order-flow suppression.
- **Direct cart writes:** `GET|POST /chatbot/{apiKey}/cart` mutate the server cart without the model (same resolver and pricing) — used by the widget's buttons.
- **Channels (WhatsApp / Messenger / Instagram)** still run the older single-shot path: `ChatbotPromptBuilder` + `ChatbotCatalogSelector.BuildPromptSet` + `ChatbotCardPolicy`, with `CanPlaceOrders: false` (hand-off to the team, CH-R3). Those classes are live and must not be deleted.

## Rules
- **CBS-R2** — The AI never states prices or writes orders: it names product ids, the server prices them (`SalePrice ?? Price`) and builds the order from the server cart. `place_order` is terminal; an empty cart is refused.
- **CBS-R3** — Agent loop is bounded (4 model calls, 8 tool calls); the final call has no tools, so a turn always ends in prose.
- **CBS-R4** — Prompt = static per-client prefix + dynamic suffix (focused product, `CURRENT CART`, collected fields, KB passages). Never move per-turn content above the prefix (breaks prompt caching).
- **CBS-R5** — Redis outage degrades, never fails, a buyer's message (Redis → in-memory → SQL). Health check never 503s on Redis.
- **CBS-R6** — Products with variants cannot be added/ordered without a chosen variant (widget and `update_cart`).
- **CBS-R7** — Unambiguous user actions (buttons) write the cart directly, not through the model.
- **CBS-R9** — Carousel suppression is recomputed each turn; never inherit the monotonic `ChatProfile.State`.
- **CBS-R13** — `ChatProfile.State` is monotonic: `ordered` is terminal (it must not suppress later turns), and a fresh `search_catalog` / `get_product_details` this turn overrides `collecting_info` even when the same turn also saved details. A new state must decide explicitly whether a same-turn search overrides it.
- **CBS-R14** — `LastShownProductIds` is kept only to resolve follow-ups like "add the second one"; it is never fed back into prompt selection (the old stale-shortlist bug).
- See INV-2, INV-3.

## Backend
- **API — `ChatbotController` `/api/v1/chatbot` (anonymous, `[EnableCors("AllowWidget")]`; `Program.cs` also stamps CORS headers and short-circuits OPTIONS for `/api/v1/chatbot/*`):** `POST {apiKey}/message {sessionId?, message, focusedProductId?}` (JSON, or NDJSON when `Accept: application/x-ndjson`: `{"type":"thinking","text":…}` lines then `{"type":"final","payload":{…legacy object…}}`; the JSON payload also carries a `thinking` string array), `GET {apiKey}/config` (name, welcome, logo, currency, COD / online flags, Razorpay key id), `GET {apiKey}/products`, `GET|POST {apiKey}/cart`, `POST {apiKey}/orders/{orderId}/verify-payment`.
- **Session store (`IChatSessionStore`)** — distinct from the tenant `IConversationMemoryService`; async, carries cart + profile:

  | Tier | Implementation | Role |
  |---|---|---|
  | Hot | `RedisChatSessionStore` | Azure Managed Redis: `{prefix}:{clientId}:{sessionId}:msgs` LIST (RPUSH + LTRIM), `:cart` STRING (JSON), `:profile` HASH; sliding TTL on read and write. |
  | Warm | `InMemoryChatSessionStore` | Per process, written every turn even when Redis is healthy; timer-swept. |
  | Cold | `SqlChatSessionArchive` → `ChatbotSessions` / `ChatbotSessionMessages` | Durable transcript + cart, written behind by `ChatSessionArchiveWorker` (bounded `Channel`, `DropOldest`), never on the request path; read only on a Redis-down + cold-instance double miss. |

  `ResilientChatSessionStore` (registered `IChatSessionStore`) opens a circuit for `Redis:CircuitOpenSeconds` (30) after `Redis:CircuitFailureThreshold` (3) consecutive failures. `Redis:Enabled=false` registers no Redis at all (supported in-process + SQL mode). Overrides: `Redis__Enabled`, `Redis__Endpoint`, `Redis__AccessKey`.
- **AI contract:** `Application/Common/Interfaces/IAgentAiProvider` (tool calling), separate from `IAiProvider.HandleConversationAsync`; `OpenAiProvider` and `MockAiProvider` implement both. `MockAiProvider.RunAgentStepAsync` calls `search_catalog` once then answers, so tools, thinking and carousel work without an API key.
- **Code:** `Application/Chatbot/Agent/` (`ChatbotAgent`, `ChatbotAgentTools`, `ChatbotAgentPromptBuilder`), `Application/Chatbot/` (`ChatbotCartResolver`, `ChatbotCatalogSelector`, `ChatbotKnowledgeSelector`, `ChatbotPromptBuilder`, `ChatbotCardPolicy`, `ChatbotContext`), `Infrastructure/Services/Chat/` (stores, archive worker, context cache), `Api/Controllers/v1/ChatbotController.cs`, `ChatbotClientWebhookHelper.cs`, `HealthController` (`/api/v1/health` reports Redis).

## Frontend
- `public/chatbot-widget.js` (`chatbot-service-widget`) and the test chat on `AdminChatbotClientDetailPage`.

## Known issues
Open items in [known-issues](known-issues.md): KI-051.

## Suggestions
- Review variant enforcement for the channel path before Phase 2 ships.

## Changes to be done
- [ ] Phase 2: move WhatsApp/Messenger/Instagram onto `ChatbotAgent` (`CanPlaceOrders: false`).
- [ ] Add real order placement on the channel path.
- [ ] Phase 3: migrate the tenant storefront chatbot onto `ChatbotAgent` (`ai-tenant-chatbot-storefront`).
