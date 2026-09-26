# Specs

High-level, per-feature specs for the Silarai platform (backend + dashboard + storefront + chatbot widget). Specs hold **intent**: purpose, scope, rules, UI, suggestions and agreed changes. Implementation detail stays in `../context.md`; history stays in `../changes.md`. The marketing site (`landing_website/`) is not covered.

## Index

| Spec | Prefix | Covers |
|---|---|---|
| [_invariants](_invariants.md) | INV | Rules shared across features |
| [auth-identity](auth-identity.md) | AUTH | Dashboard login, sessions, 2FA, roles |
| [tenancy-plans](tenancy-plans.md) | TEN | Tenants, subscription plans, plan gating |
| [business-integrations](business-integrations.md) | BIZ | Business profile, channel/payment credentials, onboarding |
| [catalog](catalog.md) | CAT | Products, categories, reviews, coupons, import |
| [crm-leads](crm-leads.md) | CRM | Customers, lead pipeline |
| [orders-payments](orders-payments.md) | ORD | Orders, payment gateways, COD |
| [channels-inbox](channels-inbox.md) | CH | WhatsApp/Instagram/Facebook webhooks and routing |
| [ai-tenant-chatbot](ai-tenant-chatbot.md) | AIC | Tenant AI sales chatbot (autopilot) |
| [chatbot-service](chatbot-service.md) | CBS | Chatbot-as-a-Service, embeddable widget |
| [storefront](storefront.md) | SF | Public storefront, custom domains, storefront accounts |
| [b2b-wholesale](b2b-wholesale.md) | B2B | Wholesale tiers, quote requests |
| [marketing-ai-tools](marketing-ai-tools.md) | MKT | Campaigns, templates, abandoned carts, AI content |
| [analytics-dashboard](analytics-dashboard.md) | ANA | Dashboard, analytics, search, activity |
| [superadmin](superadmin.md) | ADM | Platform admin, in-app landing content, platform leads |

## Workflow

1. **Before coding:** add the change to the spec's *Changes to be done* (new feature → copy `_template.md`, `status: draft`, add it to the index).
2. **Implement:** read `../context.md`, `_invariants.md` and the spec first.
3. **Same change:** update *Rules* / *Scope* / *UI* if behaviour changed, remove the shipped item from *Changes to be done*, update `../context.md` if implementation detail changed, and log one line in `../changes.md` tagged with the spec id, e.g. `2026-09-26 — [catalog] …`.

## Conventions

- Keep specs short and high-level; link to `context.md` sections instead of repeating detail.
- Rule IDs (`CAT-R3`) are stable: never renumber; strike through a retired rule instead of deleting it.
- Add extra sections only when a feature needs them (see the note at the end of `_template.md`).
