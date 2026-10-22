---
id: ai-tenant-chatbot
status: current
prefix: AIC
related: [ai-tenant-chatbot-storefront, channels-inbox, crm-leads, chatbot-service-agent]
---
# Tenant AI Chatbot — Channel Autopilot & Simulator

## Purpose
An AI salesperson for each tenant that answers customer messages on WhatsApp automatically (autopilot), with settings, a conversation viewer and an in-dashboard simulator.

## Scope
- **In:** autopilot settings (`ai-settings`), `ConversationSession` state machine, `RagContextBuilder`, `ConversationSystemPromptBuilder`, `HandleInboundMessageCommand` AI part, `SimulateChatbotCommand`, *AI Autopilot*, *AI Conversations*, *Chatbot Simulator* pages.
- **Out:** the storefront chat widget (`ai-tenant-chatbot-storefront` — same tenant, separate endpoint and memory), webhook routing (`channels-inbox`), Chatbot-as-a-Service (`chatbot-service*`), AI marketing tools (`marketing-ai-content`).

## Functional behaviour
- **AI Autopilot** (`/ai/autopilot`): toggle auto-reply, tone (e.g. Friendly), store context for the AI (free text: policies, delivery, FAQs), toggle AI auto-campaigns (`marketing-auto-campaigns`).
- **Autopilot turn** (WhatsApp, when auto-reply is on): get / create the `ConversationSession` for sender + channel → build context (store info, up to 5 keyword-matched active products — or the 10 featured-first active products when nothing matches —, the customer's last 3 orders by collected phone, last 20 messages) → system prompt → `IAiProvider.HandleConversationAsync` → reply text + state signal → update state and collected name / phone / email (regex fallback while collecting info) → keep at most 30 turns → send the reply → log it on the lead. If the AI fails, a polite fallback is sent.
- **States:** Greeting → Discovery → Interested → CollectingInfo → Confirming → Ordered → Closed (`escalate` closes the session).
- **AI Conversations** (`/ai/conversations`): paged sessions (channel, state, collected details, cart, message count, last message), *active only* filter, transcript view.
- **Simulator** (`/ai/simulator`): chat as a fake customer on a chosen channel; runs the same context, prompt, model and state machine even when auto-reply is off, never sends a real message and stores the session under sender `sim:{tenantId}`; *Reset* deletes it.

## Rules
- **AIC-R1** — Structured-context "RAG" (store info, keyword-matched products, order history, recent messages), not vector embeddings.
- **AIC-R2** — State machine: Greeting → Discovery → Interested → CollectingInfo → Confirming → Ordered → Closed.
- **AIC-R3** — On `Ordered` the server creates the `Order`/`Lead` and reprices from the live catalog (INV-2). *(Not implemented on the channel path — KI-046; the storefront chat does create orders, `ai-tenant-chatbot-storefront`.)*
- **AIC-R4** — Session memory for the channel path is the `ConversationSession` row (`MessagesJson`); the storefront chat uses the in-process `IConversationMemoryService`. Do not merge either with the chatbot-service Redis store (INV-3).
- **AIC-R5** — AI provider is OpenAI (`gpt-4o-mini`) or Mock, chosen by config (`AI:Provider`).
- **AIC-R6** — The simulator never sends to a real channel and never touches real leads.

## Backend
- **Data:** `Conversation/ConversationSession` (`ExternalCustomerId`, `Channel`, `State` 0–6, `CollectedName/Phone/Address/Email`, `InterestedProductId`, `CartJson`, `MessagesJson`, `LastMessageAt`, `IsActive`, `LeadId`, `OrderId`, `MessageCount`); `Business.AutoReplyEnabled`, `AutoReplyTone`, `AiStoreContext`, `AutoCampaignEnabled`.
- **API:** `GET|PUT /api/v1/business/ai-settings`, `GET /api/v1/business/conversations?page&pageSize&activeOnly`, `POST /api/v1/chatbot/simulate {message, channel}` → `{reply, sessionState, …}`, `DELETE /api/v1/chatbot/simulate` (all 🔒; `ChatbotSimulatorController` runs **this** tenant pipeline despite its `chatbot` route).
- **Logic:** `Application/Rag/RagContextBuilder` (keyword extraction + scoring over title / description), `Rag/ConversationSystemPromptBuilder`, `Conversation/Commands/HandleInboundMessageCommand`, `SimulateChatbotCommand`, `Queries/GetConversationSessionsQuery`, `Business/Commands/UpdateAiSettingsCommand`. Providers: `Infrastructure/Ai/OpenAiProvider`, `MockAiProvider` (`IAiProvider`).

## Frontend
- **Routes & screens:** `pages/ai/AiAutopilotPage.tsx`, `AiConversationsPage.tsx`, `ChatbotSimulatorPage.tsx`.
- **Code:** `api/business.api.ts` (`getAiSettings`, `updateAiSettings`, `getConversations`); the simulator calls `/chatbot/simulate` via `apiClient`.

## Known issues
Open items in [known-issues](known-issues.md): KI-046, KI-047, KI-049.

## Suggestions
- Decide whether channel autopilot should place orders (and with which payment step) or hand off to the team, then update AIC-R3.

## Changes to be done
- [ ] Phase 3: move this pipeline onto the tool-calling `ChatbotAgent` (planned in `chatbot-service-agent` Phasing).
