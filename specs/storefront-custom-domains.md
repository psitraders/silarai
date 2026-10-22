---
id: storefront-custom-domains
status: current
prefix: SF
related: [storefront, tenancy-plans]
---
# Storefront Custom Domains & Edge Worker

## Purpose
Let a Pro / Professional merchant serve their store on their own domain (e.g. `shop.example.com`), with Cloudflare for SaaS handling TLS and a Cloudflare Worker routing traffic, crawlers and per-store SEO files.

## Scope
- **In:** custom-domain settings (connect / status / remove / refresh), `ICloudflareService` (custom hostnames, worker routes), DNS verification, `GET /public/resolve-domain`, the SPA's custom-domain route tree, `cloudflare-worker/storefront-proxy.js`.
- **Out:** the store itself (`storefront`), plan rules (`tenancy-plans`).

## Functional behaviour
- **Connect** (*Storefront settings → Custom domain*): merchant enters a domain (protocol / path stripped, lower-cased, validated); the API refuses a domain used by another store (409), removes the old Cloudflare records when the domain changes, creates a Cloudflare **custom hostname** and a **worker route**, and saves status `pending`. Cloudflare failures are logged and the domain is still saved (retry with *Refresh*).
- The merchant adds a **CNAME** to `cname.silarai.com`. `GET` checks DNS over HTTPS while pending and flips the status to `active` (sets `CustomDomainVerifiedAt`). The UI polls every 15 s while `pending` / `awaiting_nameservers`.
- **Remove** deletes the Cloudflare hostname + route and clears the fields.
- **Visiting the domain:** the SPA sees a non-Silarai hostname, calls `GET /public/resolve-domain?domain=` (matches with / without `www.`), and renders the storefront routes without the `/{slug}` prefix (`/`, `/products`, `/products/:id`, `/category/:slug`, `/p/:slug`, `/order-confirmation/:id`).
- **Worker:** (1) `/sitemap.xml`, `/robots.txt`, `/manifest.json`, `/feed.xml`, `/favicon.svg` are fetched from the backend for the resolved slug; (2) social / search crawlers (Facebook, WhatsApp, Twitter, LinkedIn, Slack, Discord, Telegram, Google, Bing, DuckDuckGo) get a small server-rendered HTML page with OG / Twitter tags (5 min cache); (3) everything else is proxied to the static web app with edge caching disabled (`no-store`) and UTF-8 forced on HTML.

## Rules
- **SF-R4** — The Cloudflare worker serves bot/crawler OG HTML and per-tenant sitemap/robots/manifest, and passes everything else through with edge caching disabled.
- **SF-R5** — `AllowFrontend` CORS accepts any `https://` origin with credentials on purpose (custom domains).
- **SF-R10** — Custom domains require an Active or Trial subscription on `pro` or `professional` (403 otherwise); one domain belongs to at most one store.
- **SF-R11** — Store links are store-relative (SB-R15) so the same design works on `/{slug}` and on a custom domain.

## Backend
- **Data (`Tenant`):** `CustomDomain`, `CustomDomainStatus` (`pending` | `active` | …), `CloudflareHostnameId`, `CloudflareWorkerRouteId`, `CloudflareZoneId`, `CustomDomainVerifiedAt`.
- **API — `CustomDomainController` `/api/v1/storefront/custom-domain` 🔒:** `GET` (status, `cnameTarget`, auto-verify), `PUT {domain}`, `DELETE`, `POST refresh`. **`PublicDomainController`:** `GET /api/v1/public/resolve-domain?domain=` → `{slug}` (active tenants with a status).
- **Logic:** `Infrastructure/Services/CloudflareService` (`ICloudflareService`: create / delete custom hostname, add / delete worker route; `Cloudflare:ApiToken`, zone / account config); DNS check via `application/dns-json`.

## Frontend
- **Code:** `App.tsx` custom-domain detection + `CustomDomainStorefront` route tree; `components/storefront/CustomDomainSettings.tsx`; `api/customDomain.api.ts`.
- **Worker:** `cloudflare-worker/storefront-proxy.js` (deployed separately to Cloudflare).

## Known issues
Open items in [known-issues](known-issues.md): KI-026, KI-027.

## Suggestions
- Point `SWA_ORIGIN` at `app.silarai.com` and derive canonical slugs from `/{slug}/…`.

## Changes to be done
