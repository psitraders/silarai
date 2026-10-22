# Specs — Table of Contents

Every spec file, grouped by area. Files of one family share a name prefix and a rule-ID prefix. Architecture and cross-cutting setup: [`../context.md`](../context.md); history: [`../changes.md`](../changes.md).

| Spec | Prefix | Covers |
|---|---|---|
| **Start here** | | |
| [README](README.md) | — | How specs work: workflow, conventions, rule-ID table |
| [_invariants](_invariants.md) | INV | Rules shared across features |
| [known-issues](known-issues.md) | KI | Register of all open problems (security, bugs, gaps, limitations) with severity |
| [_template](_template.md) | — | Template for a new spec |
| **Platform** | | |
| [app-shell](app-shell.md) | SHL | Dashboard routing, guards, sidebar / top bar, plan-restricted nav, themes, i18n, PWA install |
| **Identity & tenancy** | | |
| [auth-identity](auth-identity.md) | AUTH | Register (email OTP), login (password / email OTP / 2FA), refresh, password reset, sessions, roles |
| [auth-team](auth-team.md) | AUTH | Business Admin invites, accept invite, deactivate, owner-only Team page |
| [tenancy-plans](tenancy-plans.md) | TEN | Tenants, plans, trials, plan gating (Basic = chatbot-only), plan-change requests, Subscription / Pricing pages |
| **Business setup** | | |
| [business-profile](business-profile.md) | BIZ | Business profile, store uploads, onboarding wizard, QR tool |
| [business-integrations](business-integrations.md) | BIZ | WhatsApp Embedded Signup, Instagram / Facebook, Razorpay / Stripe / PayPal credentials |
| **Catalogue** | | |
| [catalog-products](catalog-products.md) | CAT | Products, variants, images, tags, stock, inventory summary, clone, plan limit |
| [catalog-categories](catalog-categories.md) | CAT | Categories and one level of sub-categories |
| [catalog-coupons](catalog-coupons.md) | CAT | Coupons, validation, storefront coupon list |
| [catalog-reviews](catalog-reviews.md) | CAT | Product reviews, moderation, review summary |
| [catalog-import](catalog-import.md) | CAT | Shopify / WooCommerce / web-scraper import, WhatsApp catalogue import |
| **CRM** | | |
| [crm-customers](crm-customers.md) | CRM | Customers, merge / smart merge, CSV import / export, birthdays, B2B buyer approval |
| [crm-leads](crm-leads.md) | CRM | Lead pipeline, notes / activities, auto-created leads, conversion API |
| **Orders** | | |
| [orders-management](orders-management.md) | ORD | Dashboard orders, status, payments, cancel, payment links, invoice |
| [orders-checkout](orders-checkout.md) | ORD | Storefront checkout: COD + email OTP, Razorpay, confirmation, order emails |
| **Messaging & AI** | | |
| [channels-inbox](channels-inbox.md) | CH | Meta webhooks, tenant vs chatbot-client routing, leads from messages |
| [ai-tenant-chatbot](ai-tenant-chatbot.md) | AIC | WhatsApp autopilot, conversation sessions, simulator, AI settings |
| [ai-tenant-chatbot-storefront](ai-tenant-chatbot-storefront.md) | AIC | Storefront AI chat, in-chat leads and orders |
| [chatbot-service](chatbot-service.md) | CBS | Chatbot-as-a-Service clients: products, KB docs, channels, Shopify, orders, usage |
| [chatbot-service-agent](chatbot-service-agent.md) | CBS | Tool-calling agent, server cart, carousel, NDJSON, Redis/memory/SQL session store |
| [chatbot-service-widget](chatbot-service-widget.md) | CBS | Embeddable `chatbot-widget.js` (Shadow DOM) |
| **Storefront** | | |
| [storefront](storefront.md) | SF | Public store routes, store settings, public catalogue APIs, SEO files, PWA, cart |
| [storefront-accounts](storefront-accounts.md) | SF | Storefront customer accounts, wishlist, my account |
| [storefront-custom-domains](storefront-custom-domains.md) | SF | Custom domains, Cloudflare for SaaS, edge worker |
| [storefront-builder](storefront-builder.md) | SB | Builder core: module boundaries, packs, renderer, theming, documents, backend + public site APIs, roadmap |
| [storefront-builder-editor](storefront-builder-editor.md) | SB | Editor: panes, autosave, publish, undo / redo, versions, saved sections, preview link |
| [storefront-builder-templates](storefront-builder-templates.md) | SB | Template packs, signature widgets, wizard, apply-template, demo designs |
| [storefront-builder-commerce](storefront-builder-commerce.md) | SB | Product page / popup, product designs, cards, collection, cart placements, compare |
| [storefront-builder-ai](storefront-builder-ai.md) | SB | AI page / section generation |
| [b2b-wholesale](b2b-wholesale.md) | B2B | Wholesale tiers, quote requests, quote inbox |
| **Marketing** | | |
| [marketing-campaigns](marketing-campaigns.md) | MKT | Marketing hub, campaigns (click-to-chat), festival calendar |
| [marketing-wa-templates](marketing-wa-templates.md) | MKT | WhatsApp templates via Meta Cloud API, template broadcasts |
| [marketing-abandoned-carts](marketing-abandoned-carts.md) | MKT | Abandoned-cart capture and follow-up |
| [marketing-auto-campaigns](marketing-auto-campaigns.md) | MKT | AI launch posts on product publish (IG / FB / WhatsApp) |
| [marketing-ai-content](marketing-ai-content.md) | MKT | AI social posts, posters, descriptions, reel scripts, reply suggestions, reply templates |
| **Insights & platform** | | |
| [analytics-dashboard](analytics-dashboard.md) | ANA | Dashboard KPIs, analytics, GA4 report, activity feed, reminders, search |
| [superadmin](superadmin.md) | ADM | Tenant management, plan approvals, tenant delete, platform settings |
| [superadmin-landing](superadmin-landing.md) | ADM | In-app landing / legal pages, landing content, platform leads, chat onboarding |

**Keep this file current:** a new spec is added here (and in `README.md`'s rule-ID table if it brings a new prefix) in the same change that creates it; a removed or renamed spec is removed / renamed here.
