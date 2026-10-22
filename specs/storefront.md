---
id: storefront
status: current
prefix: SF
related: [storefront-builder, storefront-accounts, storefront-custom-domains, orders-checkout, catalog-products]
---
# Public Storefront

## Purpose
Each tenant gets a public shop at `app.silarai.com/{slug}` (or its own domain) where shoppers browse, search, ask the AI, sign in and check out. This spec covers the store's public data, settings, SEO files, PWA and cart persistence; how pages look is the storefront builder.

## Scope
- **In:** public store routes, `StorefrontSettings` (*Storefront* settings page), public store / catalogue endpoints, inquiry and newsletter endpoints, SEO (`seo.ts`, sitemap, Google Shopping feed, robots, favicon), PWA manifest, per-tenant cart, store GA4 tag.
- **Out:** page design and rendering (`storefront-builder*`), customer accounts / wishlist (`storefront-accounts`), custom domains + Cloudflare worker (`storefront-custom-domains`), checkout (`orders-checkout`), B2B (`b2b-wholesale`), AI chat (`ai-tenant-chatbot-storefront`).

## Functional behaviour
- **Routes:** `/{slug}` (home), `/{slug}/products` (all products, `?q=` search), `/{slug}/products/:productId` (product page or popup over home), `/{slug}/category/:categorySlug`, `/{slug}/p/:pageSlug` (custom page), `/{slug}/order-confirmation/:orderId`. A custom domain uses the same paths without `/{slug}`.
- `StorefrontRoute` loads the store (`GET /public/{slug}`) and the published site (`GET /public/{slug}/site`) and renders through the builder shell; with no published design the **Starter** template is shown (SB-R5). A suspended tenant or unknown slug → not found.
- **Shell on every page:** header / footer, product view, cart, sign-in / account, return policy, back-to-top, mobile bottom bar, lazily loaded AI chat (SB-R11).
- **Storefront settings** (`/storefront`): *Store URL* (slug), *Announcement bar* (used by Starter), *Appearance* (logo, banner, favicon, SEO title / description / keywords), *Return & refund policy*, *CTA labels* (WhatsApp / Instagram / Facebook buttons), *Visibility* (show out-of-stock products, allow public inquiries, sub-categories, B2B), *Branded loading screen*, store QR code, *Custom domain* (`storefront-custom-domains`). Colours and page design live in the editor (`storefront-builder-editor`, SB-R16).
- **Inquiries:** product / enquiry forms post a Lead (+ CRM customer, abandoned cart when cart items + phone are sent) and email the owner (`crm-leads`). **Newsletter:** email → Lead tagged `newsletter` (CRM-R3).
- **SEO:** per-page title / description / canonical / OG / JSON-LD (store, page, product), favicon, sitemap link; `sitemap.xml` (home, categories, products with images; 1 h cache — builder custom pages are not listed), `feed.xml` (Google Merchant RSS: id, title, description, link, image, availability, price, sale price), `robots.txt` (points to the backend sitemap), `favicon.svg` (letter avatar fallback). Crawlers get server-rendered OG HTML from the Cloudflare worker.
- **PWA:** `GET /public/{slug}/manifest.json` (name, short name, theme colour, logo icons or Silarai fallback PNGs); on Vercel it is proxied same-origin by `frontend/api/manifest/[slug].js` so Chrome can offer install.
- **Analytics:** when `GA4MeasurementId` is set the shell loads that store's GA4 tag (`seo.ts` `useGa4`) and sends events such as `add_to_cart` and `purchase` (`core/analytics.ts`).

## Rules
- **SF-R1** — Tenant is resolved by slug (`/public/{slug}` → `StorefrontSettings.Slug` of an active tenant) or custom-domain lookup; storefront routes are anonymous.
- **SF-R2** — Cart is per tenant (`localStorage` key `cart_{slug}`, wrapped by `SlugCartProvider`) and must never leak across tenants.
- SF-R3 → `storefront-accounts`; SF-R4, SF-R5 → `storefront-custom-domains`.
- **SF-R6** — Public catalogue responses include only *Active* and *OutOfStock* products and never cost / secret fields; the store response carries only the Razorpay key id (BIZ-R5).
- **SF-R7** — `Tenant.Slug` is kept equal to `StorefrontSettings.Slug` on every save.

## Backend
- **Data:** `Business/StorefrontSettings` (1:1 with `Business`: `Slug`, `ThemeColor`, `SecondaryColor`, `AccentColor`, `SeoTitle/Description/Keywords`, `ReturnPolicy`, `WhatsAppCtaLabel`, `InstagramCtaLabel`, `FacebookCtaLabel`, `ShowOutOfStockProducts`, `AllowPublicInquiries`, `SubCategoriesEnabled`, `B2BEnabled`, `CustomCss`, `AnnouncementText`, `FaviconUrl`, `LoaderEnabled`, `GA4MeasurementId`, `GA4PropertyId`, `GA4ServiceAccountJson`, `GA4RefreshToken`).
- **API — merchant:** `GET|PUT /api/v1/business/storefront` (`UpdateStorefrontSettingsCommand` also syncs `Tenant.Slug`, logo / banner on `Business`).
- **API — `PublicStorefrontController` `/api/v1/public/{slug}` (anonymous):** `GET` (store: name, description, logo, banner, contact handles, currency, colours, CTA label, announcement, GA4 id, `allowsCustomBranding`, social links, `razorpayEnabled` + key id, SEO fields, return policy, favicon, loader, `allowPublicInquiries`, `b2bEnabled`; `max-age=300, swr=60`), `GET manifest.json`, `GET categories`, `GET products?categoryId&search&sort=price_asc|price_desc|newest&inStockOnly&page&pageSize&minPrice&maxPrice&withPriceBounds` (`max-age=120, swr=60`; category includes its sub-categories), `GET products/{slugOrId}` (detail with images and available variants), `POST inquiry`, `POST newsletter {email, name?}`, `GET coupons`, `GET reviews/summary`, product reviews, chat, checkout and order endpoints (other specs), `GET sitemap.xml`, `GET feed.xml`, `GET robots.txt`, `GET favicon.svg`. Builder site API: `storefront-builder`.

## Frontend
- **Routes:** `App.tsx` `/:slug/*` routes → `storefront-builder` `StorefrontRoute` (`kind` home | all-products | product | category | custom) inside `SlugCartProvider`; `pages/storefront/OrderConfirmationPage.tsx`.
- **Code:** `storefront-builder/shell/` (`StorefrontRoute`, `ShellFrame`, `StoreShell`, `seo.ts`, `PreviewBanner`), `context/CartContext.tsx` (lines keyed by product + variant), `pages/settings/StorefrontSettingsPage.tsx`, `components/storefront/` (CartDrawer, CustomerAuthModal, MyAccountPanel, QuoteRequestModal, CustomDomainSettings), `api/manifest/[slug].js` (Vercel), `public/sw.js` (service worker: network-first shell, cache-first hashed assets).

## Known issues
Open items in [known-issues](known-issues.md): KI-028, KI-029, KI-030, KI-031.

## Suggestions
- Validate slug uniqueness + format on save and evict `tenant-slug:{old}` from the cache.

## Changes to be done
