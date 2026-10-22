---
id: known-issues
status: current
prefix: KI
related: []
---
# Known Issues

Single register of verified defects, security gaps, missing pieces and limitations in the current code. Feature specs list only the IDs (section *Known issues*); the detail lives here. Found by a full code review on 2026-10-21 unless stated otherwise.

**Open:** 65 — High 9 · Medium 19 · Low 37. **Next free ID:** KI-066.

## How to use
- **Before changing a feature**, check its spec's *Known issues* IDs here — a fix may already be wanted, or a change may make an issue worse.
- **New problem found:** add a row with the next free ID (never reuse an ID), the severity, type and affected spec(s), and add the ID to each affected spec's *Known issues* line.
- **Agreed to fix:** add the work to the owning spec's *Changes to be done* and reference the ID.
- **Fixed:** delete the row here and the ID from the specs, update the specs to describe the new behaviour, and log one line in `../changes.md` (e.g. `[orders-checkout] Fixed KI-009 …`).
- **Severity:** *High* — money, security or a core flow is wrong; *Medium* — a feature misbehaves or data can be lost; *Low* — missing piece, cosmetic or limitation. **Type:** Security · Bug · Gap (not built / not enforced) · Decision (needs a product decision) · Limitation (known limit of shipped work) · Ops.

## High

| ID | Type | Issue | Specs |
|---|---|---|---|
| KI-001 | Security | **2FA bypass:** email-OTP and phone-OTP login (`verify-login-email`, `otp/verify`) issue tokens without the TOTP check, so a user with 2FA on can log in with *Email OTP* only. | [auth-identity](auth-identity.md) |
| KI-002 | Security | **Meta webhooks are not authenticated:** `POST /webhooks/whatsapp|instagram|facebook` don't verify `X-Hub-Signature-256` (`Meta:AppSecret` is configured but unused there), so anyone who knows the URL can inject messages / leads. | [channels-inbox](channels-inbox.md) |
| KI-003 | Security | **Chat onboarding is open:** `POST /chatbot/onboard` is anonymous with no rate limit or CAPTCHA, skips email verification, uses a weak 4-digit temporary password (`Welcome@NNNN`), returns it in the response, and hard-codes `https://silarai.app` in the returned URLs. | [superadmin-landing](superadmin-landing.md) |
| KI-009 | Bug | **Razorpay checkout breaks INV-2:** `payment/create-order` charges the `amount` sent by the browser and `payment/verify` saves the client's unit prices and total (B2B tier prices are not applied server-side either); nothing compares the paid amount with catalogue prices. | [orders-checkout](orders-checkout.md), [b2b-wholesale](b2b-wholesale.md) |
| KI-010 | Bug | Razorpay `verify` does not check or decrement stock and sends no owner / customer email (COD does). | [orders-checkout](orders-checkout.md) |
| KI-011 | Bug | **Coupon discounts are never applied:** the cart shows the validated discount, but COD (`cod-order`, `chat/confirm-cod-order`) and Razorpay orders are saved at full total, `Order.DiscountAmount` stays empty and `Coupon.UsedCount` is never incremented (so `MaxUses` never triggers). | [catalog-coupons](catalog-coupons.md), [orders-checkout](orders-checkout.md) |
| KI-019 | Bug | **SuperAdmins can't approve plan requests:** `POST /subscription/admin/approve|reject` (and `GET admin/pending`) only allow role `"Admin"` (doesn't exist) or one hard-coded email → 403 from *Admin → Tenant → Approve / Reject*. *Change plan* (`PUT /admin/tenants/{id}/subscription`) works. | [tenancy-plans](tenancy-plans.md), [superadmin](superadmin.md) |
| KI-020 | Bug | Subscription expiry is not enforced — nothing moves a subscription to `Expired` and the plan gate ignores `EndDate`, so ended trials / paid periods keep their access. | [tenancy-plans](tenancy-plans.md) |
| KI-026 | Bug | The repo copy of the Cloudflare worker proxies to `SWA_ORIGIN = https://www.silarai.com` and reads canonical-host SEO paths as `/store/{slug}`; `www.silarai.com` was retired (no DNS) and the app lives on `app.silarai.com/{slug}` — verify the deployed worker and update the file. | [storefront-custom-domains](storefront-custom-domains.md) |

## Medium

| ID | Type | Issue | Specs |
|---|---|---|---|
| KI-004 | Security | Per-tenant channel tokens and gateway secrets (`Business`) and chatbot-client tokens / Shopify token / Razorpay secret (`ChatbotClient`) are stored in plain text. | [business-integrations](business-integrations.md), [chatbot-service](chatbot-service.md) |
| KI-005 | Security | `GET /public/{slug}/orders/{id}` and its invoice are public to anyone with the order id (GUID) and include phone and address. | [orders-checkout](orders-checkout.md) |
| KI-012 | Decision | Staff orders and lead → order conversion save the unit price sent by the client (no catalogue repricing, INV-2). The order form lets staff edit the price — confirm whether manual prices are intended and, if so, record it as a rule. | [orders-management](orders-management.md), [crm-leads](crm-leads.md) |
| KI-013 | Bug | Cancelling an order does not restore stock. | [orders-management](orders-management.md) |
| KI-021 | Gap | AI plan limits are not enforced: `MaxAiSuggestionsPerMonth` (Basic = 0) and `AllowsAiSuggestions` are unused — AI page generation logs only (decided 2026-10-18), other AI tools don't check at all. | [tenancy-plans](tenancy-plans.md), [storefront-builder-ai](storefront-builder-ai.md), [marketing-ai-content](marketing-ai-content.md) |
| KI-024 | Bug | Tenant delete doesn't remove storefront-builder rows (`StorefrontThemes`, `StorefrontPages`, `StorefrontVersions`, `StorefrontSavedSections`) or the tenant's chatbot clients (+ products, documents, orders, sessions, `ChatbotTokenUsages`). | [superadmin](superadmin.md) |
| KI-028 | Bug | Saving a store slug doesn't check that it's unused by another store, and the slug → tenant cache (15 min) keeps the old slug resolving for a while. | [storefront](storefront.md) |
| KI-029 | Bug | `StorefrontSettings.AllowPublicInquiries` is not enforced by `POST /public/{slug}/inquiry` (only the Crumb cake-request widget hides itself). | [storefront](storefront.md), [crm-leads](crm-leads.md) |
| KI-031 | Gap | No dashboard field for `GA4MeasurementId` / `GA4PropertyId`; the Analytics page links to `/analytics/ga4` (no route → `/dashboard`) and no screen calls `GET /analytics/ga4`. | [storefront](storefront.md), [analytics-dashboard](analytics-dashboard.md) |
| KI-033 | Bug | Storefront customer tokens expire after 15 min with no refresh while the browser keeps the login — customer calls (orders, wishlist, B2B pricing at checkout) get 401 until the shopper logs in again. | [storefront-accounts](storefront-accounts.md) |
| KI-035 | Bug | `POST /business/upload` (logo, banner, favicon, builder images) always writes to the API's local disk, not the configured `IStorageProvider` — files are lost on a file-system reset or scale-out. | [business-profile](business-profile.md), [storefront-builder](storefront-builder.md) |
| KI-036 | Bug | *Sync to WhatsApp* on the Products page calls `POST /integrations/whatsapp/sync-catalog`, which doesn't exist; `SyncWhatsAppCatalogCommand` is unreferenced. | [business-integrations](business-integrations.md), [catalog-products](catalog-products.md) |
| KI-043 | Bug | Phone matching differs by entry point — storefront chat and COD normalise to digits; staff orders, inquiries and Razorpay orders compare the raw string — creating duplicate customers. | [crm-customers](crm-customers.md) |
| KI-046 | Gap | The WhatsApp autopilot never creates an order — reaching `Ordered` only changes the session state (`OrderId` never set), so AIC-R3 does not hold on channels. | [ai-tenant-chatbot](ai-tenant-chatbot.md) |
| KI-047 | Gap | Instagram / Facebook tenant messages only create leads — no autopilot reply; the Facebook sender name is the PSID. | [channels-inbox](channels-inbox.md), [ai-tenant-chatbot](ai-tenant-chatbot.md) |
| KI-048 | Bug | OTP codes / cooldowns / the registration "verified" flag (`IMemoryCache`), COD OTPs (`CodOtpStore`) and storefront chat memory are per process — lost on restart or across App Service instances. | [auth-identity](auth-identity.md), [orders-checkout](orders-checkout.md), [ai-tenant-chatbot-storefront](ai-tenant-chatbot-storefront.md) |
| KI-054 | Bug | Email campaigns are never sent — *Send* only marks the campaign Sent and returns WhatsApp links; `ScheduledAt`, `OpenedCount`, per-recipient `IsSent` are unused; the Instagram type has no UI. | [marketing-campaigns](marketing-campaigns.md) |
| KI-056 | Bug | Auto-campaign WhatsApp step sends a free-form text broadcast — Meta delivers non-template messages only inside a 24-hour window, so most customers won't get it. | [marketing-auto-campaigns](marketing-auto-campaigns.md) |
| KI-060 | Bug | The in-app landing page doesn't read `GET /public/landing-content` — edits in *Admin → Landing page* are shown nowhere (ADM-R3 not met). | [superadmin-landing](superadmin-landing.md) |

## Low

| ID | Type | Issue | Specs |
|---|---|---|---|
| KI-006 | Security | `GET /admin/platform-settings` returns every value in clear text although `TwoFactor:ApiKey` is declared sensitive (masking never implemented). | [superadmin](superadmin.md) |
| KI-007 | Security | `POST /platform-leads` has no rate limiting. | [superadmin-landing](superadmin-landing.md) |
| KI-008 | Security | `/admin/*` routes have no client-side SuperAdmin guard (only the sidebar hides them; the API returns 403). | [app-shell](app-shell.md), [superadmin](superadmin.md) |
| KI-014 | Gap | ORD-R1 order is not enforced — any order status can be set from any status. | [orders-management](orders-management.md) |
| KI-015 | Gap | No gateway webhooks: a paid payment link doesn't update the order; staff record the payment manually. | [orders-management](orders-management.md) |
| KI-016 | Gap | Product `MinOrderQuantity` / `MaxOrderQuantity` / `IsB2BOnly` have no form fields and are not enforced at checkout (no API sets the B2B quantity fields; `Sku` and `Attributes` also have no form field). | [catalog-products](catalog-products.md), [orders-checkout](orders-checkout.md), [b2b-wholesale](b2b-wholesale.md) |
| KI-017 | Gap | Stripe / PayPal are not offered at storefront checkout (only for staff payment links). | [orders-checkout](orders-checkout.md) |
| KI-018 | Gap | BuyXGetY coupons have no client-side calculation in the cart (the API returns discount 0). | [catalog-coupons](catalog-coupons.md) |
| KI-022 | Gap | `MaxMonthlyLeads` and `MaxStaffUsers` are not enforced (display only). | [tenancy-plans](tenancy-plans.md), [auth-team](auth-team.md) |
| KI-023 | Gap | The public Pricing page tiers (USD, chat-volume based) don't match the seeded DB plans. | [tenancy-plans](tenancy-plans.md) |
| KI-025 | Gap | `/admin` is a placeholder page; *Platform settings* has no sidebar link (URL only). | [app-shell](app-shell.md), [superadmin](superadmin.md) |
| KI-027 | Gap | The worker hard-codes the backend URL and its bot list. | [storefront-custom-domains](storefront-custom-domains.md) |
| KI-030 | Bug | `StorefrontSettings.ShowOutOfStockProducts` is saved but not applied anywhere; `CustomCss` is stored but unused. | [storefront](storefront.md) |
| KI-032 | Gap | The GA4 report uses one platform OAuth refresh token; `StorefrontSettings.GA4ServiceAccountJson` / `GA4RefreshToken` are stored but unused. | [analytics-dashboard](analytics-dashboard.md) |
| KI-034 | Gap | No password reset or email verification for storefront accounts; `LoyaltyPoints` is never earned. | [storefront-accounts](storefront-accounts.md) |
| KI-037 | Gap | Products status tabs filter the loaded list client-side (≤ 500 products); there is no *Archived* tab. | [catalog-products](catalog-products.md) |
| KI-038 | Bug | CAT-R1 is enforced only by the UI — the API accepts a sub-category as parent. | [catalog-categories](catalog-categories.md) |
| KI-039 | Bug | Deleting a category leaves its products and sub-categories pointing at it. | [catalog-categories](catalog-categories.md) |
| KI-040 | Gap | Reviews: the purchase check is skipped when no phone is given (anyone can submit a pending review); the merchant isn't notified of pending reviews. | [catalog-reviews](catalog-reviews.md) |
| KI-041 | Gap | Web import skips the plan product limit (CAT-R7) and the auto-campaign; Shopify import reads only the first 250 products and the first variant; imported products get no `Slug` until next saved. | [catalog-import](catalog-import.md) |
| KI-042 | Gap | The WhatsApp Commerce catalogue import API has no UI. | [catalog-import](catalog-import.md) |
| KI-044 | Gap | *Birthday reminders* (`/customers/birthdays`) is not linked anywhere (URL only); birthday / anniversary can be edited only on the customer detail page. | [crm-customers](crm-customers.md) |
| KI-045 | Gap | Lead → order conversion (`POST /leads/{id}/convert`) has no screen; lead `AssignedUserId`, `Priority`, `Tags` aren't editable. | [crm-leads](crm-leads.md) |
| KI-049 | Gap | AI token usage is not logged for autopilot turns, storefront chat or `generate-message`; `AiSuggestion.WasUsed` / `WasEdited` are never updated. | [ai-tenant-chatbot](ai-tenant-chatbot.md), [ai-tenant-chatbot-storefront](ai-tenant-chatbot-storefront.md), [marketing-ai-content](marketing-ai-content.md) |
| KI-050 | Gap | The storefront chat inlines the whole active catalogue in every prompt — cost grows with catalogue size. | [ai-tenant-chatbot-storefront](ai-tenant-chatbot-storefront.md) |
| KI-051 | Gap | Chatbot-service channel path still uses the single-shot builder (stale-shortlist behaviour, no order placement, variant rule depends on the model). | [chatbot-service-agent](chatbot-service-agent.md) |
| KI-052 | Gap | Chatbot-client Shopify sync reads only the first 250 active products. | [chatbot-service](chatbot-service.md) |
| KI-053 | Ops | The `PlatformSettings` seed row for `TwoFactor:ApiKey` was lost with the superseded `AddPlatformSettings` migration (`../context.md` §4.6); set it in *Admin → Platform settings* if SMS OTP is used. | [auth-identity](auth-identity.md) |
| KI-055 | Bug | Marketing hub tile *Reminders* links to `/marketing/reminders` (no route → `/dashboard`). | [marketing-campaigns](marketing-campaigns.md) |
| KI-057 | Bug | Auto-campaigns run fire-and-forget on the request's scoped services (`_ = mediator.Send(...)`) and can be cut off when the request ends. | [marketing-auto-campaigns](marketing-auto-campaigns.md) |
| KI-058 | Gap | WhatsApp templates: edit / delete don't update Meta (an edited approved template diverges); broadcasts run inside the HTTP request with no opt-out handling; comments still mention AiSensy. | [marketing-wa-templates](marketing-wa-templates.md) |
| KI-059 | Gap | A completed order never marks its abandoned cart recovered; abandoned-cart totals use client-sent prices (display only). | [marketing-abandoned-carts](marketing-abandoned-carts.md) |
| KI-061 | Limitation | Builder preview link shows only saved drafts; one link per store; no expiry or password. | [storefront-builder-editor](storefront-builder-editor.md) |
| KI-062 | Limitation | Stores published before builder Phase 5a have no versions until their next publish. | [storefront-builder-editor](storefront-builder-editor.md) |
| KI-063 | Limitation | AI page generation never fills image fields and may leave `[placeholders]`; no warning on Publish. | [storefront-builder-ai](storefront-builder-ai.md) |
| KI-064 | Limitation | Assigning many products to a product design loads each product by id in the editor (capped at 200). | [storefront-builder-commerce](storefront-builder-commerce.md) |
| KI-065 | Limitation | Not built yet: product 360° / per-product shop-the-look hotspots, cart order note (Phase 3); Mandi *Reorder favourites* and a sticky category chip rail (Phase 4). | [storefront-builder-commerce](storefront-builder-commerce.md), [storefront-builder-templates](storefront-builder-templates.md) |
