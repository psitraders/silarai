---
id: chatbot-service
status: current
prefix: CBS
related: [chatbot-service-agent, chatbot-service-widget, channels-inbox, tenancy-plans]
---
# Chatbot-as-a-Service — Clients & Administration

## Purpose
A standalone AI sales chatbot sold to businesses that may not use the Silarai store: each **chatbot client** has its own catalogue, knowledge base, channels, payment keys and API key, and is embedded on any website or connected to WhatsApp / Messenger / Instagram. Basic-plan tenants manage their own clients; SuperAdmins manage all of them.

## Scope
- **In:** `ChatbotClient`, `ChatbotProduct`, `ChatbotDocument`, `ChatbotOrder`, `ChatbotTokenUsage`; client CRUD, API key, channels, Shopify sync, CSV import, knowledge-base documents, orders, token-usage reports, embed snippet, test chat.
- **Out:** the conversation pipeline (`chatbot-service-agent`), the embeddable script (`chatbot-service-widget`), webhook routing (`channels-inbox`), the tenant's own store chatbot (`ai-tenant-chatbot*`).

## Functional behaviour
- **Chatbot Clients** (`/chatbot-clients` for tenants, `/admin/chatbot-clients` for SuperAdmin): list (name, products, status, owner tenant for admins), create (name, description, currency, language, contact, welcome message — gets an API key `rc_bot_<guid>`), activate / deactivate, delete.
- **Client detail** tabs: **Products** (add / edit / delete, bulk replace, CSV import with columns `title, description, price, sale_price, variants, image_url, category` — replaces all products), **Orders** (orders placed through the chatbot; change status placed / confirmed / cancelled / fulfilled), **Channels** (WhatsApp phone number id + token + WABA id, Facebook page id + token, Instagram account id + token), **Catalog Sync** (Shopify domain + Admin token → *Sync* imports up to 250 active products; knowledge-base documents: upload PDF / DOCX / TXT / MD / CSV ≤ 10 MB — text is extracted and chunked for answers), **Payments** (COD on/off, online via Razorpay key id + secret), **Settings** (name, business description, currency, language, welcome message, logo, contact, order webhook URL), **Embed** (copy-paste `<script>` snippet with `window.RCChatbotConfig = { apiKey, apiBase, … }`). The page also has a test chat (session `admin-test`, renders the server's `thinking` lines) and *Regenerate key* (old key stops working).
- **Token usage** (`/chatbot-usage` tenant; `/admin/chatbot-usage` SuperAdmin per tenant): prompt / completion / total tokens for 1–365 days, per client, per channel, per day.
- **New orders** are POSTed to the client's `WebhookUrl` (fire-and-forget) and appear in the Orders tab; online orders are confirmed by `verify-payment`.
- Every write to products, documents, Shopify or the client invalidates the cached catalogue / knowledge base.

## Rules
- **CBS-R1** — Auth is the API key only; widget endpoints use the open `AllowWidget` CORS policy. The `ChatbotClient` row is never cached (holds payment secret).
- **CBS-R10** — A tenant sees and edits only clients whose `TenantId` is its own; SuperAdmin sees all and may assign a client to a tenant.
- **CBS-R11** — `RazorpayKeySecret` and channel tokens are never returned to the widget; the widget config carries only the Razorpay key id when online payment is on.
- **CBS-R12** — Any product / document / Shopify / client write must invalidate `IChatbotContextCache` for that client.

## Backend
- **Data (`Domain/Chatbot`, `BaseEntity`, `TenantId` nullable):** `ChatbotClient` (`Name`, `BusinessDesc`, `ApiKey`, `Currency`, `Language`, `WebhookUrl`, `ContactEmail/Phone`, `LogoUrl`, `WelcomeMessage`, `IsActive`, `WaPhoneNumberId`, `WaAccessToken`, `WaPhoneNumber`, `WaBusinessId`, `FbPageId`, `FbPageAccessToken`, `IgAccountId`, `IgAccessToken`, `ShopifyDomain`, `ShopifyApiKey`, `LastShopifySync`, `CodEnabled`, `OnlineEnabled`, `RazorpayKeyId`, `RazorpayKeySecret`), `ChatbotProduct` (`Title`, `Description`, `Price`, `SalePrice`, `Variants` JSON array, `ImageUrl`, `Category`, `IsAvailable`), `ChatbotDocument` (`FileName`, `ContentType`, `SizeBytes`, `CharCount`, `ExtractedText`), `ChatbotOrder` (`OrderNumber` `RC-yyMMdd-XXXX`, `SessionId`, customer fields, `ItemsJson`, `Total`, `Currency`, `PaymentMethod` cod | online, `PaymentStatus` pending | paid | failed, `OrderStatus` placed | confirmed | cancelled | fulfilled, `RazorpayOrderId/PaymentId`), `ChatbotTokenUsage` (`ClientId`, `TenantId`, `Channel` web | whatsapp | facebook | instagram, `PromptTokens`, `CompletionTokens`), `ChatbotSession` / `ChatbotSessionMessage` (`chatbot-service-agent`).
- **API — `AdminChatbotClientsController` `/api/v1/admin/chatbot-clients` and `/api/v1/chatbot-clients` 🔒:** `GET`, `GET {id}`, `POST`, `PUT {id}`, `POST {id}/import-csv`, `POST {id}/sync-shopify`, `PUT {id}/toggle-status`, `POST {id}/regenerate-key`, `DELETE {id}`, `PUT {id}/products` (bulk replace), `POST {id}/products`, `DELETE {id}/products/{productId}`, `GET {id}/orders`, `PUT {id}/orders/{orderId}/status`, `GET|POST {id}/documents`, `DELETE {id}/documents/{docId}`.
- **API — `ChatbotUsageController` `/api/v1/chatbot-usage` 🔒:** `GET ?days=30` (own clients), `GET admin` (SuperAdmin, per tenant).
- **Public widget API** (`ChatbotController`) — see `chatbot-service-agent`.
- **Logic:** `Api/Services/DocumentTextExtractor` (txt/md/csv direct, docx via OpenXML, pdf best-effort FlateDecode); `Application/Chatbot/ChatbotKnowledgeSelector` (600-char chunks, cached per client); `IChatbotContextCache` (`ChatbotContextCache`, Redis + `IMemoryCache`, `Redis:CatalogCacheSeconds` = 300).

## Frontend
- **Routes & screens:** `pages/admin/AdminChatbotClientsPage.tsx`, `AdminChatbotClientDetailPage.tsx` (tabs above; embed snippet uses `VITE_APP_URL` → `{APP_URL}/chatbot-widget.js`), `AdminChatbotUsagePage.tsx`, `pages/chatbot/ChatbotUsagePage.tsx`. Tenants and admins use the same pages; the UI always calls the `/admin/chatbot-clients` path (allowed on Basic, TEN-R5).

## Known issues
Open items in [known-issues](known-issues.md): KI-004, KI-052.

## Suggestions
- Background plan: `docs/plan-chatbot-redis-session-memory.md`.

## Changes to be done
