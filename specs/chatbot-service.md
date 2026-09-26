---
id: chatbot-service
status: current
context: "§4.8, §5.7"
---
# Chatbot-as-a-Service

## Purpose
A standalone AI sales chatbot sold to external businesses: an embeddable widget for any website plus WhatsApp/Messenger/Instagram, authenticated by API key and independent of the tenant dashboard.

## Scope
- **In:** `ChatbotClient`, `ChatbotProduct`, `ChatbotDocument` (knowledge base), `ChatbotOrder`, `ChatbotTokenUsage`, `ChatbotSession*`, `ChatbotAgent` + tools, Redis session store, `public/chatbot-widget.js`, onboarding, usage, SuperAdmin client management.
- **Out:** tenant chatbot (`ai-tenant-chatbot`), channel webhook entry (`channels-inbox`).

## Rules
- **CBS-R1** — Auth is the API key only; widget endpoints use the open `AllowWidget` CORS policy. The `ChatbotClient` row is never cached (holds payment secret).
- **CBS-R2** — The AI never states prices or writes orders: it names product ids, the server prices them and builds the order from the server cart. `place_order` is terminal; an empty cart is refused.
- **CBS-R3** — Agent loop is bounded (4 model calls, 8 tool calls); the final call has no tools, so a turn always ends in prose.
- **CBS-R4** — Prompt = static per-client prefix + dynamic suffix. Never move per-turn content above the prefix (breaks prompt caching).
- **CBS-R5** — Redis outage degrades, never fails, a buyer's message (Redis → in-memory → SQL). Health check never 503s on Redis.
- **CBS-R6** — Products with variants cannot be added/ordered without a chosen variant (widget and `update_cart`).
- **CBS-R7** — Unambiguous user actions (buttons) write the cart directly, not through the model.
- **CBS-R8** — The widget must stay backward compatible (legacy JSON and NDJSON responses); deploys require cache-busting the embed URL.
- **CBS-R9** — Carousel suppression is recomputed each turn; never inherit the monotonic `ChatProfile.State`.
- See INV-2, INV-3.

## UI
- `frontend/public/chatbot-widget.js` (Shadow DOM, tests in `frontend/test/chatbot-widget.test.mjs`).
- `pages/admin/` — AdminChatbotClientsPage, AdminChatbotClientDetailPage (embed snippet), AdminChatbotUsagePage.
- `pages/chatbot/ChatbotUsagePage.tsx`.

## Suggestions
- Review variant enforcement for the button-less channel path before Phase 2 ships (context §5.7).
- Background plan: `docs/plan-chatbot-redis-session-memory.md`.

## Changes to be done
- [ ] Phase 2: move WhatsApp/Messenger/Instagram onto `ChatbotAgent` (`CanPlaceOrders: false`).
- [ ] Add real order placement on the channel path.
