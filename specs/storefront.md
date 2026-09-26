---
id: storefront
status: current
context: "§4.2, §4.3 Storefront, §5.1, §5.2, §5.8"
---
# Public Storefront

## Purpose
Each tenant gets a public shop at `/{slug}` or its own custom domain, where customers browse, sign in and check out.

## Scope
- **In:** public storefront pages, `StorefrontSettings` (theme, SEO, GA4), `StorefrontCustomer` accounts, wishlist, custom CMS pages (`StorefrontPage`), cart, custom domains (Cloudflare), PWA manifest, Cloudflare worker.
- **Out:** checkout payments (`orders-payments`), B2B quotes and tiers (`b2b-wholesale`).

## Rules
- **SF-R1** — Tenant is resolved by slug (`/public/{slug}`) or custom-domain lookup; storefront routes are anonymous.
- **SF-R2** — Cart is per tenant (`localStorage` key `cart_{slug}`) and must never leak across tenants.
- **SF-R3** — Storefront customer auth is separate from dashboard auth (INV-4, INV-5).
- **SF-R4** — The Cloudflare worker serves bot/crawler OG HTML and per-tenant sitemap/robots/manifest, and passes everything else through with edge caching disabled.
- **SF-R5** — `AllowFrontend` CORS accepts any `https://` origin with credentials on purpose (custom domains).

## UI
- `pages/storefront/` — PublicStorefrontPage, StorefrontCustomPage, OrderConfirmationPage.
- `components/storefront/` — CartDrawer, CustomerAuthModal, MyAccountPanel, CustomDomainSettings.
- `pages/settings/StorefrontSettingsPage.tsx`, `pages/PagesPage.tsx`.

## Suggestions

## Changes to be done
