---
id: ai-tenant-chatbot
status: current
context: "§4.7, §6"
---
# Tenant AI Chatbot (Autopilot)

## Purpose
An autonomous AI salesperson for each tenant that holds the whole sales conversation on WhatsApp/Instagram/Facebook and the storefront: finds intent, recommends products, collects details and places orders.

## Scope
- **In:** `ConversationSession` state machine, `RagContextBuilder`, `ConversationSystemPromptBuilder`, `IConversationMemoryService`, autopilot settings, conversation viewer, in-dashboard simulator (`/chatbot/simulate`).
- **Out:** Chatbot-as-a-Service (`chatbot-service`), AI marketing tools (`marketing-ai-tools`).

## Rules
- **AIC-R1** — Structured-context "RAG" (store info, keyword-matched products, order history, recent messages), not vector embeddings.
- **AIC-R2** — State machine: Greeting → Discovery → Interested → CollectingInfo → Confirming → Ordered → Closed.
- **AIC-R3** — On `Ordered` the server creates the `Order`/`Lead` and reprices from the live catalog (INV-2).
- **AIC-R4** — Session memory is in-process (`IConversationMemoryService`); do not merge with the chatbot-service Redis store (INV-3).
- **AIC-R5** — AI provider is OpenAI (`gpt-4o-mini`) or Mock, chosen by config.

## UI
- `pages/ai/` — AiAutopilotPage, AiConversationsPage, ChatbotSimulatorPage.

## Suggestions
- context.md §4.4 lists `ChatbotSimulatorController` under Chatbot-as-a-Service, but it runs this tenant pipeline (`Application/Conversation`); correct the grouping.

## Changes to be done
- [ ] Phase 3: move this pipeline onto the tool-calling `ChatbotAgent` (planned in context §4.8 Phasing).
