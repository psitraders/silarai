---
id: app-shell
status: current
prefix: SHL
related: [auth-identity, tenancy-plans, analytics-dashboard]
---
# Dashboard App Shell

## Purpose
The merchant dashboard frame every signed-in page lives in: routing and guards, sidebar navigation, top bar (search, notifications, language, install), dashboard colour themes, i18n and product analytics.

## Scope
- **In:** `App.tsx` route tree and guards, `AppShell` / `Sidebar` / `Topbar`, plan-restricted navigation (client side), dashboard theme store, i18n, PWA install prompt, platform GA4 page tracking.
- **Out:** what the search and notification feeds return (`analytics-dashboard`), plan gating on the server (`tenancy-plans`), storefront routing (`storefront`), the in-app landing pages (`superadmin-landing`).

## Functional behaviour
- `/` (`SmartRoot`) sends signed-in users to `/dashboard` and everyone else to the in-app landing page. Unknown paths go to `/dashboard`.
- A hostname that is not localhost / `silarai` / `replycart` / `azurestaticapps` is treated as a merchant custom domain and gets the storefront-only route tree (`storefront-custom-domains`).
- Sidebar shows the full menu (dashboard, leads, orders, customers, catalogue, storefront + *Customise store*, marketing, AI, chatbot clients, B2B quotes, analytics, integrations, settings). The owner (`TenantAdmin`) also sees **Team**. SuperAdmins get an extra *Admin* group (tenants, chatbot clients, token usage, landing page, platform leads).
- **Chatbot-only (Basic plan):** the sidebar shrinks to Chatbot Clients, Token Usage, Account & Security (+ Team for the owner) and `AppShell` redirects any other route to `/chatbot-clients` (allowed: `/chatbot-clients`, `/chatbot-usage`, `/subscription`, `/settings/account`, `/settings/team`). Mirrors TEN-R5.
- Top bar: global search (products, customers, orders, leads), notification bell (activity feed polled every 60 s, read state per browser), language switcher (12 locales), PWA *Install app* when the browser offers it, account menu / logout. The sidebar footer holds the dashboard theme switcher, the plan badge (*N d left*) and a link to the live store (custom domain when active, else `/{slug}`; hidden on chatbot-only).
- Document title is `<Business name> — Silarai`; the dashboard language follows `Business.Language` chosen at registration until the user switches it.

## Rules
- **SHL-R1** — Every authenticated page is nested inside `<AuthGuard><AppShell/></AuthGuard>`; the storefront editor is the only authenticated full-screen route outside the shell.
- **SHL-R2** — Client-side plan hiding mirrors, but never replaces, the server gate (TEN-R5); a route added to one list must be added to the other.
- **SHL-R3** — Guards wait for the persisted auth store to rehydrate (`_hasHydrated`) before redirecting, to avoid login ↔ dashboard loops.
- **SHL-R4** — Pages are `React.lazy` chunks; new pages follow the same pattern and the manual chunk groups in `vite.config.ts` (`../context.md` §5.6).

## Backend
No own endpoints. Reads `GET /business` (title, language), `GET /subscription` (plan slug), `GET /activity/feed`, `GET /search`, `GET /business/storefront` (store link).

## Frontend
- **Routes & screens:** `App.tsx` (whole router in one file) — `GuestGuard` (`/login`, `/register`, `/forgot-password`), `AuthGuard`, `TenantAdminGuard` (`/settings/team`), public `/reset-password`, `/accept-invite`, `/verify-email`, landing/legal pages, authenticated shell routes, `/storefront/editor`, DEV `/__storefront/gallery`, storefront `/:slug/...` routes.
- **Code:** `components/layout/AppShell.tsx` (`CHATBOT_ONLY_ROUTES`, language + title effects), `Sidebar.tsx` (`fullNavItems`, `chatbotNavItems`, admin group, Team item, `ThemeSwitcher`, store link), `Topbar.tsx` (search, notifications in `localStorage rc_read_notif`, language list from `data/countries.ts`, install prompt captured in `index.html`), `components/ui/*` (Button, Card, Modal, Input, Select, Badge, Pagination, StatCard, EmptyState, Spinner, ThemeSwitcher).
- **State:** `store/theme.store.ts` (Zustand persist `Silarai-theme`, 5 presets — teal, purple, blue, rose, orange — applied as CSS variables on `<html>`); `store/auth.store.ts` (see `auth-identity`).
- **i18n:** `i18n/index.ts` + `i18n/locales/` — `en, hi, ar, es, fr, pt, de, tr, id, bn, ta, zh`; key `Silarai_lang`; Arabic strings but no RTL layout.
- **Analytics:** `lib/analytics.ts` wraps the platform GA4 tag (`G-9PJVYCLH11` in `index.html`); `RouteTracker` sends a page view on every route change; `track.*` helpers for CTA / language events.

## Known issues
Open items in [known-issues](known-issues.md): KI-008, KI-025.

## Suggestions
- Add a `SuperAdminGuard` for `/admin/*` routes.

## Changes to be done
