---
id: tenancy-plans
status: current
prefix: TEN
related: [auth-identity, app-shell, superadmin]
---
# Tenancy & Subscription Plans

## Purpose
Multi-tenant SaaS foundation: each merchant is a `Tenant` on a `SubscriptionPlan` that decides which features they can use. Plan changes are requested by the owner and approved by the Silarai team.

## Scope
- **In:** `Tenant`, `SubscriptionPlan`, `TenantSubscription`, tenant resolution, plan gating (Basic = chatbot-only), plan limits, trials, plan-change requests, the *Subscription* page, the public *Pricing* page.
- **Out:** SuperAdmin tenant management and approvals UI (`superadmin`), custom domains (`storefront-custom-domains`), the shell's client-side hiding (`app-shell`).

## Functional behaviour
- **Plans** (seeded by `DataSeeder`): `basic` (Basic — 50 products, AI suggestions off), `pro` (Pro — 500 products, custom branding, advanced analytics, AI), `professional` (unlimited). Prices / limits live in the `SubscriptionPlans` rows (INV-8).
- **Trials:** dashboard registration gives a 10-day `Trial` on `basic`; landing-chat onboarding gives 14 days (`superadmin-landing`).
- **Current plan** = newest subscription whose status is not `PendingApproval` / `Cancelled`; no subscription counts as `basic`.
- **Basic = chatbot-only:** the API answers 403 `PLAN_CHATBOT_ONLY` outside the allow-list and the dashboard shows only chatbot screens (`app-shell`).
- **Subscription page** (`/subscription`): current plan, status, dates, days remaining, plan features, any pending request; the owner sees *Want to change your plan?* with WhatsApp / email contact links; Business Admins only view.
- **Plan-change request API:** `POST /subscription/select/{planId}` creates a `PendingApproval` subscription (the current plan stays until approved) and emails the platform admin; a free plan (price 0) cancels all subscriptions immediately. Approval activates it for 30 / 365 days and cancels the previous one. (The dashboard UI does not call `select` today — requests come by WhatsApp / email.)
- **Limits enforced:** `MaxProducts` (create / clone product → 402). Custom domains require an Active / Trial `pro` or `professional` subscription. `AllowsCustomBranding` is sent to the storefront (hide "Powered by").
- **Pricing page** (`/pricing`, public): static marketing tiers (Starter / Growth / … in USD, flat fee + % of AI-attributed sales) with a WhatsApp CTA — not read from the DB.

## Rules
- **TEN-R1** — Tenant isolation follows INV-1; any tenant-scoping change touches all three layers.
- ~~**TEN-R2** — The `basic` plan is chatbot-only: allowed route prefixes are auth, subscription, plans, business, chatbot-clients, chatbot-usage, activity, search; everything else returns 403 `PLAN_CHATBOT_ONLY`. The sidebar mirrors this client-side.~~ Replaced by TEN-R5.
- **TEN-R3** — Plan limit breaches return 402 (`PlanLimitException`).
- **TEN-R4** — No self-serve checkout: pricing is performance-based (flat fee + % of AI-attributed sales); plan changes happen manually via WhatsApp/email and are activated by the Silarai team.
- **TEN-R5** — The `basic` plan is chatbot-only: allowed route prefixes are auth, subscription, plans, business, chatbot-clients (and the legacy `admin/chatbot-clients` path), chatbot-usage, activity, search, team; everything else returns 403 `PLAN_CHATBOT_ONLY`. SuperAdmin and anonymous endpoints are never gated. The sidebar mirrors this client-side (SHL-R2).
- **TEN-R6** — Only the `TenantAdmin` can request a plan change; a `BusinessAdmin` can view the plan but not change it (AUTH-R7).
- **TEN-R7** — A plan-change request never removes the current plan; only approval (or a free plan) changes access.
- See INV-8 (DB plans are authoritative).

## Backend
- **Data:** `Tenancy/Tenant` (`BaseEntity`: `Name`, `Slug`, `ContactEmail/Phone`, `IsActive` [false = suspended, blocks login and public slug resolution], `IsEmailVerified`, `Notes`, custom-domain fields), `SubscriptionPlan` (`Slug`, `MonthlyPrice`, `AnnualPrice`, `MaxProducts`, `MaxStaffUsers`, `MaxMonthlyLeads`, `MaxAiSuggestionsPerMonth`, `AllowsCustomBranding/AdvancedAnalytics/AiSuggestions`, `IsActive`, `SortOrder`), `TenantSubscription` (`Status` = Active 1 | Expired 2 | Cancelled 3 | Trial 4 | PastDue 5 | PendingApproval 6, `StartDate`, `EndDate`, `IsAnnual`, `PricePaid`, `ExternalPaymentId`).
- **Tenant resolution:** `Api/Middleware/TenantResolutionMiddleware` — authenticated: `tid` claim → tenant slug (cached 15 min), 401 if missing/unknown; anonymous `/public/{slug}/…`: `StorefrontSettings.Slug` joined to an active tenant (cached 15 min). `TenantContextService` holds the result for the request.
- **Plan gate:** `Api/Security/BasicPlanAccessFilter` (global `IAsyncAuthorizationFilter`; plan slug cached 2 min per tenant).
- **API:** `PlansController` `GET /api/v1/plans` (anonymous, active plans). `SubscriptionsController` `/api/v1/subscription` 🔒 — `GET` (current + pending + currency), `POST select/{planId} {isAnnual}`, `GET admin/pending`, `POST admin/approve/{id}`, `POST admin/reject/{id}`. SuperAdmin plan edits: `PUT /admin/tenants/{id}/subscription` (`superadmin`).
- **Limits:** `CreateProductCommand` / `CloneProductCommand` count products against `Plan.MaxProducts`.

## Frontend
- **Routes & screens:** `pages/subscription/SubscriptionPage.tsx` (`/subscription`, in the shell, allowed on Basic), `pages/subscription/PricingPage.tsx` (`/pricing`, public, static `PLANS`).
- **Code:** `GET /subscription` is read by `Sidebar` (plan badge, *N d left*), `AppShell` (chatbot-only redirect) and `IntegrationsPage`.

## Known issues
Open items in [known-issues](known-issues.md): KI-019, KI-020, KI-021, KI-022, KI-023.

## Suggestions
- Remove or align the stale `Shared.Constants.PlanLimits` (INV-8).
- Gate the subscription admin endpoints with `[Authorize(Roles = "SuperAdmin")]` and drop the hard-coded email.
- Add an expiry job (or check `EndDate` in the plan gate).

## Changes to be done
