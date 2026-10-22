---
id: superadmin-landing
status: current
prefix: ADM
related: [superadmin, auth-identity, tenancy-plans, chatbot-service]
---
# In-app Landing Pages, Platform Leads & Chat Onboarding

## Purpose
The public pages of the dashboard app (`app.silarai.com/` for signed-out visitors): landing, about, blog, contact, pricing and legal pages, a lead-capture chat that can create a store on the spot, and the SuperAdmin inbox of those platform leads.

## Scope
- **In:** `pages/landing/*`, `pages/legal/*`, `components/landing/*` (Navbar, Footer, LandingLayout, LeadChatWidget), `LandingPageConfig` + *Admin → Landing page* editor, `PlatformLead` capture + *Admin → Platform leads*, `POST /chatbot/onboard`.
- **Out:** the separate marketing site `landing_website/` at `silarai.com` (own `context.md` / `changes.md`, no specs), dashboard sign-up (`auth-identity`), pricing data (`tenancy-plans`).

## Functional behaviour
- **Pages:** `/` (signed-out landing via `SmartRoot`), `/about`, `/blog`, `/contact`, `/pricing` (`tenancy-plans`), `/privacy`, `/terms`, `/refund`. Content is in the components.
- **Lead chat** (`LeadChatWidget` on the landing page): a scripted chat asks name, email, phone, business type, product count and a message → upserts a `PlatformLead` (source `chatbot`, UTM parameters, IP). It can then create a real store: `POST /chatbot/onboard` creates tenant + owner (`TenantAdmin`, email marked verified), `Business`, `StorefrontSettings`, a 14-day *Trial* on `basic`, marks the lead *converted*, and returns the store URL, login URL and a temporary password (`Welcome@NNNN`) shown in the chat. One account per email (409 if it exists).
- **Platform leads** (`/admin/platform-leads`): summary counts, paged list with status / search filters (name, email, phone, business type, product count, message, source, status new | contacted | converted | closed, admin notes, UTM), update status / notes, delete.
- **Landing content editor** (`/admin/landing-page`): edits a JSON content document (hero, stats, …) with defaults from `api/landing.api.ts` `DEFAULT_CONTENT`.

## Rules
- ADM-R1 applies (`superadmin`): management is SuperAdmin-only; reading landing content, submitting platform leads and chat onboarding are public.
- **ADM-R3** — `LandingPageConfig` drives the in-app landing page (`pages/landing/`), not `silarai.com`. *(Not wired — KI-060.)*
- **ADM-R5** — A platform lead is upserted by email: later submissions enrich it and never downgrade its status.

## Backend
- **Data:** `Config/LandingPageConfig` (single row, `ContentJson`), `Config/PlatformLead` (`BaseEntity`: `Name`, `Email`, `Phone`, `BusinessType`, `ProductCount`, `Message`, `Source` chatbot | form, `Status`, `AdminNotes`, `IpAddress`, `UtmSource/Medium/Campaign`).
- **API:** `LandingController` — `GET /api/v1/public/landing-content` (anonymous), `PUT /api/v1/admin/landing-content {contentJson}` (SuperAdmin). `PlatformLeadsController` — `POST /api/v1/platform-leads` (anonymous); `AdminPlatformLeadsController` `/api/v1/admin/platform-leads` (SuperAdmin) — `GET ?page&pageSize&status&search`, `PATCH {id} {status, adminNotes}`, `DELETE {id}`, `GET summary`. `ChatbotOnboardController` — `POST /api/v1/chatbot/onboard {businessName, ownerName, email, phone, country, businessType?}` → `{slug, storeUrl, loginUrl, tempPassword, message}` (anonymous).

## Frontend
- **Routes & screens:** `pages/landing/LandingPage.tsx`, `AboutPage.tsx`, `BlogPage.tsx`, `ContactPage.tsx`; `pages/legal/PrivacyPage.tsx`, `TermsPage.tsx`, `RefundPage.tsx`; `pages/admin/AdminLandingPage.tsx`, `PlatformLeadsPage.tsx`.
- **Code:** `api/landing.api.ts` (`getContent`, `updateContent`, `DEFAULT_CONTENT`), `api/platformLeads.api.ts` (`submitPlatformLead`, `chatbotOnboard`, admin `getAll`, `update`, `delete`, `getSummary`), `components/landing/LeadChatWidget.tsx`.

## Known issues
Open items in [known-issues](known-issues.md): KI-003, KI-007, KI-060.

## Suggestions
- Wire the landing page to `LandingPageConfig` or drop the editor; email a set-password link instead of returning a temporary password.

## Changes to be done
