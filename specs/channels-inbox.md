---
id: channels-inbox
status: current
context: "§4.4 Channel webhooks, §4.7, §4.8"
---
# Messaging Channels (WhatsApp / Instagram / Facebook)

## Purpose
Receive customer messages from Meta channels and route them to the right AI pipeline.

## Scope
- **In:** `WhatsAppWebhookController`, `InstagramWebhookController`, `FacebookWebhookController`, inbound routing (`HandleInboundMessageCommand` / `ChatbotClientWebhookHelper`), outbound channel services.
- **Out:** what the AI replies (`ai-tenant-chatbot`, `chatbot-service`), WhatsApp templates and campaigns (`marketing-ai-tools`).

## Rules
- **CH-R1** — Webhooks are anonymous; scope is resolved from the inbound channel identity, not a JWT.
- **CH-R2** — If the identity matches a `ChatbotClient` the message goes to the chatbot-service path; otherwise to the tenant chatbot (INV-3).
- **CH-R3** — Chatbot-service channel replies cannot place orders yet (`CanPlaceOrders = false`) and hand off to the team instead.

## UI
- No dedicated page; resulting conversations appear in `pages/ai/AiConversationsPage.tsx` and leads in `pages/leads/`.

## Suggestions

## Changes to be done
