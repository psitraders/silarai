---
id: business-integrations
status: current
prefix: BIZ
related: [business-profile, channels-inbox, orders-checkout, orders-management]
---
# Integrations (Channels & Payment Gateways)

## Purpose
Connect the merchant's own WhatsApp Business, Instagram and Facebook Messenger accounts and their Razorpay / Stripe / PayPal keys, so messages and payments flow to the right tenant.

## Scope
- **In:** WhatsApp Embedded Signup connect / disconnect / test, Instagram and Facebook credentials + webhook info + test, Razorpay / Stripe / PayPal credentials, default payment gateway, *App Theme* colour.
- **Out:** handling inbound messages (`channels-inbox`), what the AI replies (`ai-tenant-chatbot`), checkout (`orders-checkout`), payment links (`orders-management`), WhatsApp templates (`marketing-wa-templates`).

## Functional behaviour
- **Integrations** page (`/integrations`), one card per integration with a *Configured* badge:
  - **WhatsApp Business** — *Connect with Facebook* runs Meta's Embedded Signup (`FB.login` with the app id / config id from the API). The server exchanges the short-lived user token for a 60-day token, auto-detects the WABA and phone number (`/me/businesses` → `/whatsapp_business_accounts` → `/phone_numbers`) when the JS events didn't provide them, and stores them. *Send test* sends Meta's `hello_world` template. *Disconnect* clears the credentials. Webhook URL / verify token instructions are shown.
  - **Instagram Messaging** / **Facebook Messenger** — account / page id + access token, webhook info, *Send test* to a scoped user id. Saving Facebook subscribes the page to the app (`/{pageId}/subscribed_apps`).
  - **Payment Gateway** — default gateway (Razorpay / Stripe / PayPal); **Razorpay** key id + secret, **Stripe** secret key, **PayPal** client id + secret + sandbox flag. Secrets are shown masked; each can be removed.
  - **App Theme** — pick one of the 5 dashboard themes; it is applied to the dashboard and its colour is saved as `StorefrontSettings.ThemeColor` (creating the storefront row if missing). That is also the store's brand colour, which the editor's *Publish* overwrites (SB-R16).
- Razorpay keys power the storefront checkout; the default gateway decides which provider creates staff *payment links*.

## Rules
- **BIZ-R1** — Channel and payment credentials are per tenant and stored on the `Business` entity.
- **BIZ-R4** — Secrets are write-only from the UI: GET endpoints return masked values / `isConfigured` only; an empty field on save keeps the stored secret.
- **BIZ-R5** — The public storefront receives only the Razorpay key id and an *enabled* flag, never a secret.
- See INV-6 (platform secrets never in `appsettings.json`).

## Backend
- **Data (`Business`):** `WhatsAppPhoneNumberId`, `WhatsAppAccessToken`, `WhatsAppWabaId`, `WhatsAppCatalogId`, `InstagramAccountId`, `InstagramAccessToken`, `FacebookPageId`, `FacebookPageAccessToken`, `PaymentGateway` (default "Razorpay"), `RazorpayKeyId/KeySecret`, `StripeSecretKey`, `PayPalClientId/ClientSecret`, `PayPalSandbox`.
- **API — `IntegrationsController` `/api/v1/integrations` 🔒:** `GET` / `PUT` (Instagram, Facebook, gateway, theme colour), `GET whatsapp/embedded-signup-config` (`Meta:AppId`, `Meta:EmbeddedSignupConfigId`), `POST whatsapp/connect {accessToken, phoneNumberId?, wabaId?}`, `DELETE whatsapp/disconnect`, `POST whatsapp/test {toId}`, `GET whatsapp|instagram|facebook/webhook-info`, `POST instagram/test`, `POST facebook/test`, `GET|PUT|DELETE razorpay`, `GET|PUT|DELETE stripe`, `GET|PUT|DELETE paypal`.
- **Logic:** `Application/Business/Commands/SaveIntegrationSettingsCommand`, `Queries/GetIntegrationSettingsQuery`; token exchange uses `Meta:AppId` / `Meta:AppSecret` (Graph API v19.0). Outbound channel services `Infrastructure/Services/WhatsAppService`, `InstagramService`, `FacebookService` read the current tenant's credentials from `Business`; `RazorpayService`, `StripeService`, `PayPalService` take them per call.

## Frontend
- **Routes & screens:** `pages/settings/IntegrationsPage.tsx` (`WhatsAppCard`, `RazorpaySettingsCard`, `StripeSettingsCard`, `PayPalSettingsCard`, `WebhookAccordion`, Instagram / Facebook / Payment Gateway / App Theme forms).
- **Code:** `api/business.api.ts` (`getIntegrationSettings`, `saveIntegrationSettings`, `getWhatsAppEmbeddedSignupConfig`, `connectWhatsApp`, `disconnectWhatsApp`, `testWhatsApp`, `testInstagram`, `testFacebook`, `get*WebhookInfo`); gateway cards call `/integrations/{gateway}` directly.

## Known issues
Open items in [known-issues](known-issues.md): KI-004, KI-036.

## Suggestions
- Encrypt per-tenant secrets at rest (Data Protection / Key Vault).
- Either expose `SyncWhatsAppCatalogCommand` at the route the UI calls or remove the button.

## Changes to be done
