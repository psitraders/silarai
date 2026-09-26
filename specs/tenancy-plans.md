---
id: tenancy-plans
status: current
context: "§4.2, §4.3 Tenancy, §6"
---
# Tenancy & Subscription Plans

## Purpose
Multi-tenant SaaS foundation: each merchant is a `Tenant` on a `SubscriptionPlan` that decides which features they can use.

## Scope
- **In:** `Tenant`, `SubscriptionPlan`, `TenantSubscription`, tenant resolution, plan gating, pricing/subscription pages.
- **Out:** SuperAdmin tenant management (`superadmin`), custom domains (`storefront`).

## Rules
- **TEN-R1** — Tenant isolation follows INV-1; any tenant-scoping change touches all three layers.
- ~~**TEN-R2** — The `basic` plan is chatbot-only: allowed route prefixes are auth, subscription, plans, business, chatbot-clients, chatbot-usage, activity, search; everything else returns 403 `PLAN_CHATBOT_ONLY`. The sidebar mirrors this client-side.~~ Replaced by TEN-R5.
- **TEN-R3** — Plan limit breaches return 402 (`PlanLimitException`).
- **TEN-R4** — No self-serve checkout: pricing is performance-based (flat fee + % of AI-attributed sales); plan changes happen manually via WhatsApp/email.
- **TEN-R5** — The `basic` plan is chatbot-only: allowed route prefixes are auth, subscription, plans, business, chatbot-clients, chatbot-usage, activity, search, team; everything else returns 403 `PLAN_CHATBOT_ONLY`. The sidebar mirrors this client-side.
- **TEN-R6** — Only the `TenantAdmin` can request a plan change; a `BusinessAdmin` can view the plan but not change it (AUTH-R7).
- See INV-8 (DB plans are authoritative).

## UI
- `pages/subscription/` — SubscriptionPage, PricingPage.
- `components/layout/AppShell.tsx`, `Sidebar.tsx` — plan-restricted navigation.

## Suggestions
- Remove or align the stale `Shared.Constants.PlanLimits` (INV-8).

## Changes to be done
