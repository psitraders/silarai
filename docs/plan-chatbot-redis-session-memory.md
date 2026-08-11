# Plan — Redis-backed session memory + server-side cart for the Chatbot-client module

Status: **DRAFT — awaiting approval.** No code changed yet.

---

## 1. How the chatbot-client module works today

### 1.1 Pieces

| Layer | File | Role |
|---|---|---|
| Domain | `Domain/Chatbot/ChatbotClient.cs` | The seller. `TenantId` nullable, `ApiKey` (`rc_bot_*`), own WA/FB/IG/Shopify/Razorpay creds, `CodEnabled`/`OnlineEnabled`, `WelcomeMessage`, `Currency`. |
| Domain | `ChatbotProduct.cs` / `ChatbotOrder.cs` / `ChatbotDocument.cs` / `ChatbotTokenUsage.cs` | Catalog, orders, KB docs (`ExtractedText`), per-turn token metering. |
| API | `Controllers/v1/ChatbotController.cs` (605 lines) | The whole widget surface: `POST {apiKey}/message`, `GET {apiKey}/config`, `GET {apiKey}/products`, `POST {apiKey}/orders/{id}/verify-payment`. Public, API-key auth, `AllowWidget` CORS. |
| API | `ChatbotClientWebhookHelper.cs` | WhatsApp / Messenger / Instagram path for the same clients — its own, simpler prompt builder. |
| API | `ChatbotOnboardController.cs`, `ChatbotUsageController.cs`, `AdminChatbotClientsController.cs` | Self-onboarding, usage reports, SuperAdmin management. |
| Memory | `Application/Common/Interfaces/IConversationMemoryService.cs` + `Infrastructure/Services/ConversationMemoryService.cs` | The only conversation state that exists. |
| Widget | `frontend/public/chatbot-widget.js` (699 lines) | Dependency-free embed. `sessionId` persisted in `localStorage["rc_s_" + apiKey]`. |

### 1.2 What happens on every single message

`POST /api/v1/chatbot/{apiKey}/message`

1. Look up `ChatbotClient` by `ApiKey` — **DB round-trip per turn, no cache**.
2. Derive `sessionId = "bot_{clientId}_{request.SessionId ?? Guid.NewGuid()}"`.
3. Load **every** available `ChatbotProduct` for the client — no paging, no projection.
4. Load **every** `ChatbotDocument` incl. full `ExtractedText`, re-chunk it into 600-char slices in memory, keyword-score, take ≤3000 chars. **Repeated from scratch every turn.**
5. Build the system prompt — either *focused* (one product) or the **entire catalog inlined**.
6. `chatMemory.GetHistory(sessionId)` → in-process `ConcurrentDictionary`.
7. `IAiProvider.HandleConversationAsync(systemPrompt, history, message)`.
8. Insert `ChatbotTokenUsage` + `SaveChangesAsync` (an extra DB write per turn).
9. If the AI emits `state == "order_ready"`: deserialize its `cart` JSON, re-resolve each line against the catalog by **fuzzy title match**, recompute unit prices server-side (this is the existing "server is the price authority" safeguard — good), create `ChatbotOrder`, optionally create a Razorpay order, fire the client webhook fire-and-forget.
10. Keyword-score products again to pick ≤6 cards to return.
11. `chatMemory.AddMessages(sessionId, user, assistant)`.

### 1.3 The memory implementation

`ConversationMemoryService` — registered `AddSingleton` in `Infrastructure/DependencyInjection.cs:67`:

- `ConcurrentDictionary<string, SessionData>`, `SessionData(List<ConversationMessage>, LastAccessed)`.
- Cap 40 messages/session, 2-hour sliding TTL.
- `EvictExpiredSessions()` runs a **full dictionary scan on every `GetHistory` call**.
- Shared by 6 call-sites: `ChatbotController`, `ChatbotClientWebhookHelper`, `PublicStorefrontController`, and the tenant WA/IG/FB webhooks.

### 1.4 Problems this creates

**Memory**

- **Lost on every restart/deploy/App Service recycle.** A customer mid-checkout loses name, phone, address, and cart, and the bot starts over.
- **Not shared across instances.** Any scale-out (or Azure moving the app) silently breaks conversations.
- **No durable transcript anywhere.** `ChatbotOrder.SessionId` points at a conversation that no longer exists — you cannot audit "what did the bot promise this buyer?".
- `EvictExpiredSessions` is O(sessions) per request.

**Cart / context**

- **There is no cart.** State exists only in the single AI turn that emits `order_ready`. Multi-turn "add one more" depends entirely on the LLM re-reading 40 messages correctly.
- Cart lines are matched back to real products by **fuzzy title string matching** (`Contains` both directions) — ambiguous or similar titles resolve to the wrong product.
- Collected name/phone/address are never stored; they must survive purely inside the transcript.

**Cost / performance**

- Full catalog + KB re-inlined into the prompt every turn. Prompt tokens scale with catalog size, and you **bill on tokens** (`ChatbotTokenUsage`) — this is a direct margin problem.
- 2 reads + 1 write to SQL per turn before the AI call even starts.

**Structural**

- `ChatbotController` holds business logic that, per project convention (§4.1 of `context.md`), belongs in `ReplyCart.Application` as a MediatR command.
- Prompt-building is **duplicated and already divergent** between `ChatbotController.BuildSystemPrompt` (KB, focused mode, order creation) and `ChatbotClientWebhookHelper.BuildPrompt` (none of those). WhatsApp buyers get a materially worse bot than widget buyers.

---

## 2. Decisions taken (confirmed)

| Decision | Choice |
|---|---|
| Scope | **Chatbot-client only** — `ChatbotController` + `ChatbotClientWebhookHelper`. `PublicStorefrontController` and the tenant webhooks keep the existing in-memory service, untouched. |
| Cart | **Server-side authoritative running cart**, held in Redis, resolved against `ChatbotProducts` each turn. |
| Redis down | **In-memory fallback, rehydrated from SQL** (conversation history + products) so the bot degrades but keeps its context. |
| Client | **StackExchange.Redis directly** (LIST/HASH, server-side TTL and trim). |

---

## 3. Target design

### 3.1 Three-tier session state

```
turn → RedisChatSessionStore   (hot, authoritative)
         ↓ on failure / circuit open
       InMemoryChatSessionStore (per-instance, best effort)
         ↓ on cold miss
       SQL rehydrate  (ChatbotSessions + ChatbotSessionMessages)
```

SQL is written asynchronously off the request path, and read only on a double miss.

### 3.2 Redis key layout

All keys namespaced per client so a compromised/rotated API key can be swept:

| Key | Type | Contents | TTL |
|---|---|---|---|
| `rc:bot:{clientId}:{sessionId}:msgs` | LIST | one JSON `{role,content,ts}` per element; `RPUSH` + `LTRIM -40 -1` | 24h sliding |
| `rc:bot:{clientId}:{sessionId}:cart` | STRING (JSON) | authoritative lines `[{productId, title, qty, variant, unitPrice}]` | 24h sliding |
| `rc:bot:{clientId}:{sessionId}:profile` | HASH | `name`, `phone`, `address`, `focusedProductId`, `lastShownProductIds`, `state` | 24h sliding |
| `rc:bot:cfg:{apiKey}` | STRING (JSON) | client config snapshot — kills the per-turn client lookup | 60s |
| `rc:bot:{clientId}:catalog` | STRING (JSON) | compact catalog brief for prompt building | 5m, invalidated on product write |

TTLs configurable via `Redis:SessionTtlHours`. Reads refresh TTL (`EXPIRE` alongside the read pipeline), so an active buyer never expires mid-order.

### 3.3 New abstraction

A **new** interface in `Application/Common/Interfaces` — `IConversationMemoryService` is left alone so the other four consumers are not touched:

```csharp
public interface IChatSessionStore
{
    Task<IReadOnlyList<ConversationMessage>> GetHistoryAsync(ChatSessionKey key, CancellationToken ct);
    Task AppendAsync(ChatSessionKey key, ConversationMessage user, ConversationMessage assistant, CancellationToken ct);

    Task<ChatCart> GetCartAsync(ChatSessionKey key, CancellationToken ct);
    Task SetCartAsync(ChatSessionKey key, ChatCart cart, CancellationToken ct);

    Task<ChatProfile> GetProfileAsync(ChatSessionKey key, CancellationToken ct);
    Task PatchProfileAsync(ChatSessionKey key, ChatProfilePatch patch, CancellationToken ct);

    Task ClearAsync(ChatSessionKey key, CancellationToken ct);
}
```

Implementations, all in `Infrastructure/Services/Chat/`:

- `RedisChatSessionStore` — StackExchange.Redis, one pipelined round-trip per phase (history+cart+profile fetched in a single batch).
- `InMemoryChatSessionStore` — the current `ConcurrentDictionary` behaviour, extended to cart/profile, with a proper timer-based eviction instead of the per-read scan.
- `ResilientChatSessionStore` — the registered decorator. Short Redis timeout (250 ms) + circuit breaker; on trip, delegates to in-memory; on cold miss, rehydrates from SQL and warms the in-memory tier.
- `SqlChatSessionArchive` — async write-behind of messages/cart/profile; the rehydrate source.

### 3.4 New tables (Phase 2)

```
ChatbotSessions        Id, ClientId, SessionId, Channel, State,
                       CustomerName, CustomerPhone, DeliveryAddress,
                       CartJson, CreatedAt, LastMessageAt
ChatbotSessionMessages Id, SessionRowId, Role, Content, CreatedAt
                       IX (SessionRowId, CreatedAt)
```

Also links `ChatbotOrder` to a real conversation, which unlocks a seller-visible transcript later.

**Migration hazard (`context.md` §4.6):** the model snapshot is stale. This migration will be **hand-written with the `[Migration]` attribute, idempotent raw SQL (`IF NOT EXISTS`), in `Infrastructure/Persistence/Migrations/`**, matching how `AddChatbotDocuments` / `AddChatbotTokenUsage` were done. **`dotnet ef migrations add` will not be run.** A matching `demo/AddChatbotSessions.sql` will be produced, as with the other chatbot migrations.

### 3.5 Server-side cart

The AI contract changes from "one terminal cart at `order_ready`" to "optional cart operations every turn":

```json
{ "reply": "...", "cart_ops": [ {"op":"add","product_id":"<guid>","qty":2,"variant":"M"} ] }
```

- `product_id` is preferred and is validated against `lastShownProductIds` stored in Redis — this **removes the fuzzy title matching** entirely. Title matching stays only as a fallback for models that ignore the id.
- The server applies ops, resolves against live `ChatbotProducts`, recomputes `unitPrice` from `SalePrice ?? Price`, and writes the result to Redis. **The AI never sets a price.** This preserves and strengthens the existing price-authority rule.
- The prompt gains a rendered `=== CURRENT CART ===` block, so the model reads cart state rather than remembering it.
- At `order_ready`, `ChatbotOrder` is built **from the Redis cart**, not from AI JSON.
- The `/message` response gains a `cart` object so the widget can render it.
- `ChatbotClientWebhookHelper` gets the same store + cart, closing the widget-vs-WhatsApp capability gap.

### 3.6 Configuration

```
Redis:ConnectionString    Azure Managed Redis, primary access key
Redis:SessionTtlHours     default 24
Redis:Enabled             default false → in-memory only (safe local dev default)
Redis:TimeoutMs           default 250
```

The connection string goes in **App Service application settings / user-secrets only — never `appsettings.json`**, which already has committed secrets (`context.md` §7) and must not accumulate more. `Program.cs` registers `IConnectionMultiplexer` as a singleton with `abortConnect=false` and adds a Redis health check.

---

## 4. Phasing

Each phase is independently shippable and independently revertible.

| Phase | Work | Verifiable by |
|---|---|---|
| **0** | StackExchange.Redis package, `IConnectionMultiplexer` singleton, config binding, health check. No behaviour change. | `/health` reports Redis up; app still runs with `Redis:Enabled=false`. |
| **1** | `IChatSessionStore` + Redis / in-memory / resilient decorator, **history only**. Swap `ChatbotController` and `ChatbotClientWebhookHelper` onto it. Fix the `sessionId` bug (§5). No schema change. | Start a conversation, restart the API mid-flow, continue — bot remembers. Kill Redis — bot keeps working from in-memory. |
| **2** | `ChatbotSessions` + `ChatbotSessionMessages` tables (hand-written migration), write-behind archive, rehydrate-on-double-miss. | Flush Redis + restart API → history still recovered from SQL. |
| **3** | Server-side cart + profile. `cart_ops` prompt contract, cart resolution, `CURRENT CART` prompt block, order built from Redis cart, `cart` in the API response. | Multi-turn "add this, also add that, remove the first" produces a correct order total; AI-stated prices are ignored. |
| **4** | Widget cart UI — "Add to cart" on product cards, cart strip with qty controls, checkout from cart. ~150 lines of vanilla JS. Embed script versioned to defeat third-party caching. | Manual run through `demo/demo-store.html`. |
| **5** *(optional, needs your go-ahead)* | Client-config + catalog-brief caching in Redis; replace full-catalog prompt stuffing with brief + top-N matches. | Token count per turn drops measurably in `ChatbotTokenUsage`; verify before/after on a 200-product client. |

**Explicitly out of scope** unless you ask: moving `ChatbotController` logic into a MediatR command, unifying the two divergent prompt builders, touching `PublicStorefrontController` or the tenant webhooks.

---

## 5. Bugs found during analysis (fix in Phase 1)

1. **`ChatbotController.cs:45`** — when the widget omits `sessionId`, the server mints `Guid.NewGuid()` *per request*, so memory can never accumulate for that caller. Should mint once and return it.
2. **`ChatbotController.cs:288`** — the response echoes `request.SessionId` (which may be `null`) instead of the session key actually used, so a client that relied on the server to assign an id never learns it.
3. **`ConversationMemoryService.GetHistory`** — full-dictionary eviction scan on every read.
4. `ChatbotClientWebhookHelper` relies on `client.Products` being eager-loaded by the caller; if a webhook path ever forgets the `Include`, the bot silently reports an empty catalog rather than failing.

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Stale EF model snapshot makes `migrations add` dangerous | Hand-write the migration with `[Migration]`, idempotent SQL — never scaffold. See §3.4. |
| Redis secret leaking into the repo | App Service config / user-secrets only; `Redis:Enabled=false` default so nothing is needed for local dev. |
| Redis latency (App Service is South India) | Provision Managed Redis in the same region; 250 ms timeout + circuit breaker means a slow Redis degrades rather than stalls. |
| Third-party sites cache the old `chatbot-widget.js` | Version the embed URL; keep the API backward-compatible (missing `cart` key must be tolerated by old widgets). |
| Sessions live in Redis across a deploy that changes the JSON shape | Version the payload (`v` field); unknown version → treat as cold miss, not a crash. |
| No test project exists in `backend/src` | Verification is manual + a dev-only diagnostic endpoint added in Phase 1 to dump a session's Redis state. Flag if you'd rather I stand up a test project first. |

---

## 7. What I need from you

1. Approve the phasing, or tell me to collapse phases.
2. Confirm the Redis instance exists (or should I write the plan assuming `Redis:Enabled=false` until you provision it?).
3. Confirm Phase 5 (token-cost reduction) is wanted — it's the highest-margin item but it changes prompt content, which changes bot behaviour.
