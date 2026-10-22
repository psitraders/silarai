---
id: ai-tenant-chatbot-storefront
status: current
prefix: AIC
related: [ai-tenant-chatbot, orders-checkout, crm-leads, storefront]
---
# Tenant AI Chatbot — Storefront Chat

## Purpose
The chat bubble on every tenant storefront page: an AI shopping assistant that answers questions, shows matching products, captures the shopper as a lead and can take a COD or online order inside the chat.

## Scope
- **In:** `POST /public/{slug}/chat`, its prompt and session memory, lead capture, in-chat order flow (online → cart, COD → email OTP → `chat/confirm-cod-order`), product mini-cards, escalation, the `StoreChatbot` widget.
- **Out:** WhatsApp autopilot and simulator (`ai-tenant-chatbot`), checkout endpoints and emails (`orders-checkout`), the external embeddable widget (`chatbot-service-widget`).

## Functional behaviour
- The bubble loads lazily on every storefront page (`SB-R11`), greets the shopper, knows the category being browsed and, when the shopper is signed in, their name / email. A WhatsApp shortcut is shown when the store has a number.
- **Each turn:** the server loads store info and **all active products** (category, images, variants with final prices) into the prompt, adds the session history and calls `IAiProvider.HandleConversationAsync`. The reply carries a state signal.
- **Lead capture:** once the AI has extracted both a name and a phone (normalised to digits), a Lead (source Direct) and a CRM customer are created — only if no lead with that phone exists in the store yet — and the owner gets a *new lead* email.
- **Order (`order_ready`):** the server validates name, phone (COD) and address, then **reprices every cart line** from the catalogue.
  - *Online* (UPI / card / any digital method): the reply returns the priced cart; the widget fills the store cart with it and opens the cart drawer for normal Razorpay checkout (`orders-checkout`).
  - *COD*: stock is checked; the reply returns a *pending COD order*; the widget shows an email + code card (`cod-otp/send`) and calls `chat/confirm-cod-order`, which creates the order and shows the order card with a confirmation link.
- **Product cards:** products whose title words appear in the reply are shown as mini-cards (min variant price); "show me / browse" requests show featured products or the current category; no cards on the order turn.
- **Escalation:** when the AI signals `escalate`, the reply offers the store's WhatsApp support number.
- If the AI is unavailable a friendly fallback reply is returned.

## Rules
- **AIC-R7** — The AI's prices are never trusted: every order line is repriced from the catalogue before a cart or order is returned (INV-2).
- **AIC-R8** — A chat COD order is placed only after email-OTP verification (ORD-R4).
- **AIC-R9** — Storefront chat memory is in-process (`IConversationMemoryService`: 2 h sliding TTL, ≤ 40 messages per session) and independent of `ConversationSession` and of the chatbot-service store (INV-3).

## Backend
- **API — `PublicStorefrontController` (anonymous):** `POST /api/v1/public/{slug}/chat {sessionId?, message, categoryId?, categoryName?, customerName?, customerEmail?}` → `{sessionId, reply, leadCreated, mentionedProducts[], orderPlaced, onlinePaymentCart?, pendingCodOrder?, escalate?, supportWhatsapp?}`; `POST chat/confirm-cod-order` (see `orders-checkout`).
- **Logic:** all inside `PublicStorefrontController.Chat` + private `BuildRagSystemPrompt` (full catalogue, variants, currency, store context) — **not** `RagContextBuilder`; `Infrastructure/Services/ConversationMemoryService` (singleton); `ResolveUnitPrice`; `EmailService.SendNewLeadNotificationAsync`.

## Frontend
- **Code:** `storefront-builder/shell/chatbot/StoreChatbot.tsx` (lazy from `StoreShell`; session id in component state — a page reload starts a new session; product cards; online cart hand-off via `CartContext.addItem` + `onOpenCart`; COD OTP card; order card; WhatsApp escalation; markdown-light rendering).

## Known issues
Open items in [known-issues](known-issues.md): KI-048, KI-049, KI-050.

## Suggestions
- Phase 3 of the agent plan moves this chat onto `ChatbotAgent` (search tools, server cart).

## Changes to be done
