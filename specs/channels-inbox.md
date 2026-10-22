---
id: channels-inbox
status: current
prefix: CH
related: [business-integrations, ai-tenant-chatbot, chatbot-service-agent, crm-leads]
---
# Messaging Channels (WhatsApp / Instagram / Facebook)

## Purpose
Receive customer messages from Meta webhooks, decide which tenant or Chatbot-as-a-Service client they belong to, record them as leads and hand them to the right AI pipeline.

## Scope
- **In:** `WhatsAppWebhookController`, `InstagramWebhookController`, `FacebookWebhookController` (verify + receive), owner resolution, tenant inbound commands (`ProcessWhatsAppMessageCommand` → `HandleInboundMessageCommand`, `ProcessInstagramMessageCommand`, `ProcessFacebookMessageCommand`), `ChatbotClientWebhookHelper`, outbound send services.
- **Out:** what the AI replies (`ai-tenant-chatbot`, `chatbot-service-agent`), connecting accounts (`business-integrations`), WhatsApp templates / broadcasts (`marketing-wa-templates`).

## Functional behaviour
- **Verification (`GET`)**: Meta's `hub.challenge` is echoed when `hub.verify_token` matches `WhatsApp:VerifyToken` / `Instagram:VerifyToken` / `Facebook:VerifyToken` (defaults `replycart-verify`, `replycart-ig-verify`, `replycart-fb-verify`).
- **Inbound (`POST`)**, per entry / message:
  1. Resolve the **tenant** by the channel id stored on `Business` (WhatsApp `PhoneNumberId`, Facebook page id, Instagram account id).
  2. If no tenant matches, look for an active **Chatbot-as-a-Service client** with that id (`WaPhoneNumberId`, `FbPageId`, `IgAccountId`) and run `ChatbotClientWebhookHelper` (reply only, no orders — CH-R3).
  3. Otherwise log "no tenant/client found".
- **Tenant WhatsApp messages** run `HandleInboundMessageCommand`: idempotency check by message id, find-or-create the sender's `Lead` (+ `WhatsAppMessage` activity) — always, even when AI is off — then, if `AutoReplyEnabled`, the autopilot reply (`ai-tenant-chatbot`) is sent back through `WhatsAppService` and logged as a `WhatsAppAutoReply` activity.
- **Tenant Instagram / Facebook messages** only find-or-create the lead and log the message activity (echoes and non-text events skipped). No AI reply is sent on these channels today.
- Conversations and leads appear in *AI Conversations* and *Leads*.

## Rules
- **CH-R1** — Webhooks are anonymous; scope is resolved from the inbound channel identity, not a JWT (INV-11).
- **CH-R2** — A tenant match wins; only when no tenant owns the channel id is a `ChatbotClient` tried. Tenant messages go to the tenant chatbot, client messages to the chatbot-service path (INV-3).
- **CH-R3** — Chatbot-service channel replies cannot place orders yet (`CanPlaceOrders = false`) and hand off to the team instead.
- **CH-R4** — Every tenant inbound message creates or updates a Lead, independent of the AI toggle (CRM-R2).
- **CH-R5** — Inbound processing is idempotent per channel message id.

## Backend
- **API:** `GET|POST /api/v1/webhooks/whatsapp`, `GET|POST /api/v1/webhooks/instagram`, `GET|POST /api/v1/webhooks/facebook` (anonymous).
- **Logic:** controllers parse Meta payloads (`entry[].changes[].value.messages` for WhatsApp with contact profile name; `entry[].messaging[]` for Messenger / Instagram, skipping `is_echo`); `Application/WhatsApp|Instagram|Facebook/Commands/Process*MessageCommand`; `Application/Conversation/Commands/HandleInboundMessageCommand`; `Api/Controllers/v1/ChatbotClientWebhookHelper` (client credentials, `ChatbotPromptBuilder`, Graph `me/messages` / WhatsApp Cloud API send, token usage recorded per channel). Outbound: `Infrastructure/Services/WhatsAppService` (`SendTextMessageAsync`, `SendTemplateMessageAsync`, broadcasts; resolves tenant by phone number id), `InstagramService`, `FacebookService` (Graph API v19.0) using the tenant's `Business` credentials.

## Frontend
- No dedicated page; resulting conversations appear in `pages/ai/AiConversationsPage.tsx` and leads in `pages/leads/`. Webhook URLs and verify tokens are shown on `pages/settings/IntegrationsPage.tsx`.

## Known issues
Open items in [known-issues](known-issues.md): KI-002, KI-047.

## Suggestions
- Validate `X-Hub-Signature-256` on all three webhooks.
- Route Instagram / Facebook tenant messages through `HandleInboundMessageCommand` too.

## Changes to be done
