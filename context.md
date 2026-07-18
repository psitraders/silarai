# ReplyCart / Silarai — Project Context

> Authoritative reference for this codebase. Read this before implementing features, fixing bugs, or refactoring. Update it whenever functionality, architecture, or major flows change. Log every change in `changes.md`.

Product name in code/branding is **Silarai** (the GitHub repo, package names, and some domain classes still say **ReplyCart** — the two names refer to the same product; "ReplyCart" is the original/legacy name). Repo: `github.com:psitraders/silarai.git`.

## 1. What this product does

A multi-tenant SaaS platform for boutique/small-business sellers (clothing, jewelry, bakery, etc.) to run their store from one dashboard:

- Product catalog (with variants, categories, wholesale/B2B pricing).
- A unified inbox for inquiries arriving via WhatsApp, Instagram, and Facebook, tracked as **Leads** through a sales pipeline.
- Order and payment management (COD, Razorpay, Stripe, PayPal).
- An **autonomous AI chatbot** that can hold a full sales conversation over WhatsApp/Instagram/Facebook/embeddable-widget — discovering intent, recommending products, collecting customer details, and placing orders without human intervention (state machine, see §6).
- A public **storefront** per tenant (`/{slug}` or a connected custom domain) for direct customer browsing/checkout.
- AI-assisted marketing tools (social captions, reel scripts, product descriptions, auto-generated campaigns when a product goes live).
- A separate, smaller **"Chatbot-as-a-Service"** product line: a standalone embeddable chat widget (`public/chatbot-widget.js`) sold to external businesses independent of the main tenant/dashboard flow, authenticated by API key rather than JWT.
- A SuperAdmin backoffice for managing tenants, the marketing landing page content, and platform-wide settings.

## 2. Repository layout

```
├── backend/                          ASP.NET Core Web API (net8.0)
│   ├── ReplyCart.slnx / .sln
│   ├── ReplyCart_Database.sql        generated idempotent schema script (dotnet ef migrations script output)
│   ├── cleanup-demo-data.sql         dev helper: wipes all non-admin-tenant rows
│   ├── scripts/onboard_soniya.sql    one-off hand-written tenant onboarding script (real customer, raw T-SQL)
│   └── src/
│       ├── ReplyCart.Api/            Controllers, Middleware, Security, Program.cs, appsettings.json
│       ├── ReplyCart.Application/    CQRS commands/queries (MediatR), interfaces/ports, Rag prompt builders
│       ├── ReplyCart.Domain/         Entities, enums, no external dependencies
│       ├── ReplyCart.Infrastructure/ EF Core, DbContext, migrations, external service implementations
│       └── ReplyCart.Shared/         Constants: Roles, PlanLimits, ApiRoutes
├── frontend/                         React 19 + Vite + TypeScript + Tailwind v4
│   └── src/
│       ├── api/                      axios clients, one module per backend feature area
│       ├── components/               ai/ catalog/ landing/ layout/ onboarding/ storefront/ ui/
│       ├── context/                  CartContext, StorefrontAuthContext (React Context, not Zustand)
│       ├── pages/                    admin/ ai/ analytics/ auth/ b2b/ catalog/ chatbot/ customers/
│       │                             dashboard/ landing/ leads/ legal/ marketing/ orders/ settings/
│       │                             storefront/ subscription/ tools/
│       ├── store/                    Zustand: auth.store.ts, theme.store.ts
│       ├── i18n/                     i18next config + locales/ (12 languages)
│       ├── types/                    shared TS types (not exhaustive — many DTOs live in api/*.ts)
│       ├── hooks/, lib/, utils/, data/
│   ├── public/
│   │   ├── chatbot-widget.js         standalone vanilla-JS embeddable chat widget (external sites)
│   │   ├── sw.js                     service worker (network-first shell, cache-first hashed assets)
│   │   ├── manifest.json, staticwebapp.config.json (Azure SWA config, also copied to dist/)
│   └── api/manifest/[slug].js        Vercel serverless function — proxies per-tenant manifest.json
├── cloudflare-worker/storefront-proxy.js   edge proxy: bot/crawler OG-tag rendering, custom-domain routing, no-cache pass-through to Azure SWA
├── demo/                             demo data generation (jewellery-products.csv, generate.py, demo-store.html, RAG knowledge-base sample docs, chatbot demo SQL)
├── DM2OrderMigrationScript.sql        one-off raw DB/data migration script (order-system migration, not part of runtime)
├── Meta-Integration-Guide.html        standalone static doc: Meta (WhatsApp/IG/FB) integration guide
├── Teams-Sitefinity-SSO-Guide.html    standalone static doc, UNRELATED to this product's domain (Sitefinity/Teams SSO) — appears to be a stray file, not part of ReplyCart/Silarai functionality
└── global.json                       pins .NET SDK to 8.0.400
```

## 3. Tech stack (verified from actual code, not README)

**⚠️ The root `README.md` says ".NET 10" / "EF Core 9" — this is stale. The real, verified stack is below.**

| Layer | Technology |
|---|---|
| Backend framework | ASP.NET Core **8** (`net8.0` in every `.csproj`, `global.json` pins SDK `8.0.400`) |
| ORM | EF Core **8.0.0** + SQL Server (Azure SQL in production) |
| Architecture | Clean Architecture (Domain → Application → Infrastructure/Api), CQRS via MediatR |
| Auth | JWT Bearer (15 min access + 30-day refresh, refresh tokens stored hashed), BCrypt.Net passwords, optional TOTP 2FA |
| Background jobs | Hangfire packages referenced in `.csproj` but **not wired up anywhere** (no jobs/dashboard registered) — dead/aspirational dependency |
| Frontend | React 19.2 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 (native Vite plugin, no PostCSS config) |
| State | Zustand v5 (persisted: auth, theme) + React Context (cart, storefront-customer auth) |
| Data fetching | TanStack React Query v5 (no custom query-hook wrappers; each page calls `useQuery`/`useMutation` directly) |
| Forms | react-hook-form + zod |
| Charts | Recharts v3 |
| i18n | i18next / react-i18next, 12 locales |
| Backend host | Azure App Service (`silarai`, South India region) |
| Frontend host | Dual: Azure Static Web Apps **and** Vercel (both configs present) |
| File storage | Cloudinary (current), Local disk (`wwwroot/uploads/`) as fallback provider |
| AI provider | OpenAI (`gpt-4o-mini`, current default) or Mock provider, swappable via config |
| Payments | Razorpay (primary, India), Stripe, PayPal — all per-tenant credentials stored on the `Business` entity |
| Edge/CDN | Cloudflare Worker in front of custom domains + canonical domain (bot rendering, custom-domain routing) |

## 4. Backend architecture

### 4.1 Clean Architecture layers

- **`ReplyCart.Domain`** — entities and enums only, no dependencies on other layers.
- **`ReplyCart.Application`** — MediatR commands/queries + handlers (usually co-located in one file, e.g. `LoginCommand.cs` contains the record, result, and handler), plus **port interfaces** in `Common/Interfaces` that Infrastructure implements (`IAiProvider`, `IStorageProvider`, `ITenantContext`, `ICurrentUser`, `IWhatsAppService`, `IRazorpayService`, etc.).
- **`ReplyCart.Infrastructure`** — EF Core `AppDbContext`, migrations, and concrete implementations of every Application-layer port (AI providers, storage providers, payment gateways, messaging channel services, Cloudflare, JWT, OTP).
- **`ReplyCart.Api`** — controllers, middleware, `Program.cs` composition root, `appsettings.json`.
- **`ReplyCart.Shared`** — cross-cutting constants (`Roles`, `PlanLimits`, `ApiRoutes`) referenced by more than one layer.

**Validation note:** `FluentValidation` is a referenced dependency and its `ValidationFailure` type is reused for consistent error shapes, but there are **no `AbstractValidator<T>` classes anywhere** — validation is hand-written inline inside each command handler, not a MediatR pipeline behavior.

### 4.2 Multi-tenancy model

Flat shared-schema multi-tenancy: almost every entity inherits `TenantEntity : BaseEntity` which adds `TenantId (Guid)` + soft-delete fields (`IsDeleted`, `DeletedAt`, `DeletedBy`). Enforced in three layers that must all be present together:

1. **Database**: `AppDbContext.OnModelCreating` reflects over every `TenantEntity` subtype and applies a global EF Core query filter — `!IsDeleted && (TenantFilterId == null || TenantId == TenantFilterId)` — evaluated per-query against the live DbContext instance (deliberately, to avoid stale-tenant-id bugs). Cross-tenant/admin queries must explicitly call `.IgnoreQueryFilters()`.
2. **Request pipeline**: `TenantResolutionMiddleware` (runs after `UseAuthentication()`, before `UseAuthorization()`) reads the `tid` claim from the JWT for authenticated requests (caches slug lookups 15 min via `IMemoryCache`), or resolves tenant by `StorefrontSettings.Slug` for anonymous `/public/{slug}/...` routes, then populates the request-scoped `ITenantContext` (`TenantContextService`) that the DbContext filter reads from.
3. **Plan gating** (business rule, not a security boundary): `BasicPlanAccessFilter`, a global `IAsyncAuthorizationFilter`, restricts tenants on the `"basic"` (chatbot-only) subscription plan to a fixed allow-list of route prefixes (auth, subscription, plans, business, chatbot-clients, chatbot-usage, activity, search) — everything else returns 403 `PLAN_CHATBOT_ONLY`.

Public/anonymous endpoints (webhooks, public storefront, chatbot widget, health check) bypass JWT auth entirely and resolve tenant scope via slug or API key instead.

### 4.3 Domain model by area

- **Tenancy**: `Tenant` (root SaaS account — slug, contact info, custom-domain fields for Cloudflare), `SubscriptionPlan` (plan catalog: price, product/staff/lead/AI-suggestion limits, feature flags), `TenantSubscription` (tenant↔plan link with status/dates).
- **Identity**: `User` (BCrypt password, TOTP fields), `Role`/`UserRole` (flat roles: `SuperAdmin`, `TenantAdmin`, `Manager`, `Staff` — no custom per-tenant roles), `UserRefreshToken` (hashed, device info, revocation reason), `UserToken` (email verification / password reset, hashed).
- **Business**: `Business` (the merchant's profile — holds WhatsApp/Instagram/Facebook/Razorpay/Stripe/PayPal credentials directly on the entity, plus AI auto-reply config), `StorefrontSettings` (1:1, public storefront theming/SEO/GA4 config), `SocialLink`.
- **Catalog**: `Category` (1-level subcategories via `ParentCategoryId`), `Product` (variants, images, tags, B2B min/max order qty fields), `ProductReview`, `Coupon` (Percentage/Flat/BuyXGetY).
- **CRM/Sales**: `Customer` (CRM contact), `Lead` (pipeline: NewInquiry → PriceShared → Interested → FollowUpPending → OrderConfirmed / Lost / RepeatOpportunity, with `LeadNote`/`LeadActivity`), `Order` (New → Confirmed → PaymentPending → Paid → Packed → Delivered / Cancelled, with `OrderItem`/`Payment`/`OrderStatusHistory`).
- **Conversation (autonomous AI engine)**: `ConversationSession` — one row per external-customer+channel conversation, state machine `Greeting → Discovery → Interested → CollectingInfo → Confirming → Ordered → Closed`, rolling `MessagesJson` history, links to a produced `Lead`/`Order`.
- **AI**: `AiSuggestion` (logged reply suggestions), `AiUsageLog` (token usage per user), `ReplyTemplate` (canned replies).
- **Marketing**: `Campaign`/`CampaignRecipient` (WhatsApp/Email/Instagram blast campaigns), `AbandonedCart`, `WaTemplate` (WhatsApp template — supports both legacy AiSensy and current Meta Cloud API template submission flow), `AutoCampaign` (AI-generated social post auto-triggered when a product is published, per-channel results + status).
- **Storefront (B2C/B2B)**: `StorefrontCustomer` (separate login system from the internal `User`, with B2B fields — company name, GST, loyalty points, optional link to CRM `Customer`), `StorefrontWishlistItem`, `ProductWholesaleTier` (quantity-break B2B pricing), `QuoteRequest` (B2B quote inbox), `StorefrontPage` (custom CMS pages like About/FAQ).
- **Chatbot-as-a-Service** (separate product line, `TenantId` nullable): `ChatbotClient` (own WhatsApp/FB/IG/Shopify/Razorpay credentials, `ApiKey` auth), `ChatbotProduct`, `ChatbotOrder`, `ChatbotDocument` (uploaded KB doc, `ExtractedText` feeds RAG), `ChatbotTokenUsage`.
- **Admin/Config** (platform-level, not tenant-scoped): `SystemAnnouncement`, `TenantNote`, `LandingPageConfig` (marketing site content as JSON blob), `PlatformLead` (marketing-site signup leads, with UTM tracking), `PlatformSetting` (key-value store).

### 4.4 API surface (`Controllers/v1/`)

Grouped by area — see the backend for exact `[Route]` attributes:

- **Auth**: `AuthController` (`/auth` — register/login/refresh/logout/me/2FA/profile/sessions), `OtpController` (`/auth/otp`).
- **Merchant core**: `BusinessController` (`/business`), `CategoriesController`, `ProductsController`, `CouponsController`, `ReviewsController`, `CustomersController`, `LeadsController`, `OrdersController`, `ImportController` (bulk import preview/confirm).
- **Marketing/AI**: `MarketingController`, `WaTemplatesController`, `AbandonedCartsController`, `AiSuggestionsController` (`/ai`), `AnalyticsController`, `ActivityController`, `SearchController` (global topbar search).
- **B2B/Storefront config**: `B2BController`, `PagesController` (custom CMS pages), `IntegrationsController`, `SubscriptionsController`, `PlansController`, `CustomDomainController` (Cloudflare custom domain setup).
- **Public/anonymous**: `PublicDomainController` (custom-domain → tenant slug resolution), `PublicStorefrontController` (`/public/{slug}`), `StorefrontCustomerController` (+ nested `StorefrontQuoteController`, `PublicWholesaleTiersController`), `PaymentController` (`/public/{slug}/payment` — Razorpay/Stripe/PayPal), `HealthController`.
- **Channel webhooks**: `WhatsAppWebhookController`, `FacebookWebhookController`, `InstagramWebhookController` (`/webhooks/...` — inbound message entry points feeding `HandleInboundMessageCommand`).
- **Chatbot-as-a-Service**: `ChatbotController` (`/chatbot/{apiKey}/...`, public, `AllowWidget` CORS policy), `ChatbotOnboardController`, `ChatbotSimulatorController`, `ChatbotUsageController`.
- **SuperAdmin**: `AdminTenantsController`, `AdminPlatformSettingsController`, `AdminChatbotClientsController`, `LandingController`, `PlatformLeadsController`/`AdminPlatformLeadsController`.

### 4.5 Middleware pipeline (`Program.cs`, in order)

`UseResponseCompression` → `UseStaticFiles` → `GlobalExceptionMiddleware` (maps domain exceptions to HTTP status: `ValidationException`→422, `InsufficientStockException`→422, `NotFoundException`→404, `ForbiddenException`→403, `PlanLimitException`→402, else→500) → inline CORS-header stamping for `/api/v1/chatbot/*` (short-circuits OPTIONS preflight) → `UseRouting` → `UseCors("AllowFrontend")` → `UseAuthentication` → `TenantResolutionMiddleware` → `UseAuthorization` → `MapControllers` (with global `BasicPlanAccessFilter`).

CORS has two policies: `AllowWidget` (fully open, for the public embeddable chatbot) and `AllowFrontend` (allows localhost, configured origins, wildcard `*.replycart.app`, **and any `https://` origin outright** with `AllowCredentials()` — intentionally permissive to support arbitrary tenant custom domains).

**Known operational gaps** (flag before changing deploy/DB behavior): DB auto-migration and `DataSeeder` seeding on startup are both commented out in `Program.cs` — schema changes require manually running `dotnet ef database update` or applying the generated `ReplyCart_Database.sql`. `appsettings.json` currently has real secrets committed (Azure SQL password, Cloudinary secret, Meta app secret, Cloudflare token, Google service-account key) — treat this file as sensitive.

### 4.6 Migrations

**Correction (2026-07-19, superseding earlier notes below and in `changes.md`):** a prior session attempted to delete the entire migration history and squash it into a single fresh `InitialCreate` migration. That deletion never made it into a commit and was subsequently reverted (the working tree — and `git HEAD` — still has the original, pre-squash migration set). So: **the squash never actually happened.** Two migration folders coexist for historical/namespace reasons and both are real, active migration history:

- `Infrastructure/Migrations/` (namespace `ReplyCart.Infrastructure.Migrations`) — the original 18 migrations, `20260430052403_InitialSchema` through `20260517000000_AddAutonomousAi`.
- `Infrastructure/Persistence/Migrations/` (namespace `ReplyCart.Infrastructure.Persistence.Migrations`) — 16 more migrations continuing chronologically from `20260521115712_AddFaviconAndLoaderToStorefrontSettings` through `20260709000000_AddChatbotTokenUsage`.

EF Core discovers migrations across both folders/namespaces fine as long as each migration class carries `[DbContext(typeof(AppDbContext))]` + `[Migration("<id>")]` (normally scaffolded into a sibling `.Designer.cs`, but several migrations here are hand-written raw-SQL migrations with the attributes declared inline in the main file instead — both styles are valid and both patterns exist in this repo). A single `AppDbContextModelSnapshot.cs` lives in `Infrastructure/Migrations/` and is the one EF actually uses.

**Known landmine — migrations missing `[Migration]`/`[DbContext]` attributes are silently skipped, not errored.** Several migrations were hand-written (not scaffolded via `dotnet ef migrations add`) and never got these attributes, so `dotnet ef database update` / `Database.Migrate()` silently ignores them — no error, no warning, the table/column just never gets created. As of 2026-07-19, 6 migrations are *intentionally* left this way because they're fully superseded duplicates of a later migration (see below); any other migration file found without these attributes is a bug, not a design choice — check whether it's a genuine duplicate before blindly attributing it.

**Root cause of the recurring `dotnet ef database update` failures, fixed 2026-07-19:** `20260521115712_AddFaviconAndLoaderToStorefrontSettings` was scaffolded by comparing the current `AppDbContext` model against a snapshot that was stale by 9 migrations (because migrations `20260509000000_AddPlatformSettings` through `20260517000000_AddAutonomousAi` were hand-written without the `[Migration]` attribute and therefore never got applied or folded into the snapshot). As a result it redundantly tried to `CreateTable`/`AddColumn` things already created by `AddCouponsReviewsAbandonedCarts`, `AddLandingPageConfig`, and `AddAuthProductionFlows` — guaranteed "there is already an object named X" on any fresh DB. Fixed by trimming the duplicate `CreateTable`/`AddColumn`/`CreateIndex` calls out of that migration (kept only what's genuinely new, plus what only *it* creates because the corresponding hand-written migration stays unattributed — see below) and attributing the 11 other hand-written migrations that turned out to be genuine prerequisites (not duplicates) of later migrations' `AlterColumn` calls or of tables the chatbot migrations depend on.

**Migrations intentionally left without attributes (fully superseded — do not attribute these without also stripping the duplicate work from the migration that supersedes them):**
`20260509000000_AddPlatformSettings`, `20260512000000_AddCustomerBirthday`, `20260512100000_AddWhatsAppCatalogId`, `20260512130000_AddPaymentGatewayFields`, `20260517000000_AddAutonomousAi` (all fully re-implemented inside the trimmed `AddFaviconAndLoaderToStorefrontSettings`), and `20260522000000_AddB2CB2BFeatures` (fully re-implemented inside `20260523025922_AddLeadCreatedAtIndex`). Known gap: `AddPlatformSettings`'s seed-data `INSERT` (2Factor.in OTP API key into `PlatformSettings`) is lost since that migration never runs — the table gets created (by the trimmed Favicon migration) but the seed row does not. Add it back via a small new migration or manual insert if OTP relies on it.

**Known gap — `AppDbContextModelSnapshot.cs` is stale.** It doesn't reflect `BrandColors`, `AutonomousAi`, `MetaWhatsApp`, `ChatbotClients`/`ChatbotClientChannels`, `StorefrontPages`, `ChatbotOrders`/`ChatbotDocuments`/`ChatbotTokenUsage` changes (all applied via raw-SQL or now-attributed migrations that never went through `dotnet ef migrations add`, so the snapshot was never regenerated). This doesn't block `dotnet ef database update` (the snapshot isn't consulted for applying migrations), but running `dotnet ef migrations add` next will produce a large diff reflecting all of that — review carefully before accepting it, since some of it (things added via idempotent raw SQL in `AddChatbotClients`/`AddChatbotClientChannels`/etc.) will already exist in the real DB and re-adding them via a normal (non-idempotent) EF migration would break a *second* fresh install.

**Production caveat**: if this schema was ever deployed to the production Azure SQL instance (§3), verify its `__EFMigrationsHistory` table before applying these changes there — specifically check whether `20260521115712_AddFaviconAndLoaderToStorefrontSettings` is already marked applied, since its trimmed content differs from what may have originally run.

`dotnet ef` commands (e.g. `dotnet ef database update`) don't go through `Program.cs`/DI — they use `Infrastructure/Persistence/AppDbContextFactory.cs` (`IDesignTimeDbContextFactory<AppDbContext>`), which has its own hardcoded connection string (defaults to the Dockerized SQL Server on `localhost,1433`, matching `appsettings.Development.json`; override via `ConnectionStrings__DefaultConnection` env var). If this factory's connection string ever drifts from the real DB target, `dotnet ef` commands fail even though the app itself connects fine.

### 4.7 The autonomous AI conversation flow ("Rag" module)

Not vector-embedding RAG — a structured-context approach:

1. A channel webhook (`WhatsAppWebhookController`/`InstagramWebhookController`/`FacebookWebhookController`) or the chatbot widget (`ChatbotController`) receives an inbound message.
2. `HandleInboundMessageCommand` (or the chatbot-widget equivalent) loads/creates the `ConversationSession` for that customer+channel.
3. `RagContextBuilder` assembles a `RagContext`: store info, keyword-matched relevant products, the customer's order history, and recent conversation messages.
4. `ConversationSystemPromptBuilder` turns that into a system prompt.
5. `IAiProvider.HandleConversationAsync` (OpenAI or Mock) generates the reply, potentially advancing `ConversationSession.State` and populating collected fields (name/phone/address/cart).
6. When the state reaches `Ordered`, an `Order` (and/or `Lead`) is created; the server always recomputes prices from the live catalog rather than trusting AI-stated prices (price-authority safeguard, see `changes.md` history).

## 5. Frontend architecture

### 5.1 Routing (`src/App.tsx` — router lives entirely in this one file)

- **Custom-domain detection**: if `window.location.hostname` isn't localhost/`silarai`/`replycart`/`azurestaticapps`, the app assumes a merchant custom domain and renders a dedicated `<CustomDomainStorefront />` route tree (resolves slug via `GET /public/resolve-domain?domain=...`) instead of the normal routes.
- **`SmartRoot`** (`/`): redirects authenticated users to `/dashboard`, otherwise shows the public `LandingPage`.
- **`AuthGuard`** wraps the entire authenticated app shell; **`GuestGuard`** redirects already-authenticated users away from `/login`/`/register`/`/forgot-password`.
- Authenticated routes (`/dashboard`, `/catalog/*`, `/leads/*`, `/orders/*`, `/customers/*`, `/ai/*`, `/analytics`, `/settings/*`, `/storefront`, `/pages`, `/integrations`, `/subscription`, `/marketing/*`, `/chatbot-clients*`, `/chatbot-usage`, `/b2b/quotes`, `/tools/qr-code`, `/admin/*`) are nested inside `<AppShell />` (sidebar + topbar layout).
- Public storefront routes: `/{slug}`, `/{slug}/products/:productId`, `/{slug}/category/:categorySlug`, `/{slug}/order-confirmation/:orderId`, `/{slug}/p/:pageSlug` — each wrapped in a `SlugCartProvider` so cart state (`localStorage` key `cart_{slug}`) never bleeds across tenants.
- Nearly all pages are `React.lazy`-loaded with manual Vite chunk groupings (see §5.6).

### 5.2 State management

- **`store/auth.store.ts`** (Zustand, `persist`, localStorage key `silarai-auth`): `accessToken`, `refreshToken`, `user`, `isAuthenticated`, `_hasHydrated` (guards redirect races before rehydration). Tokens are duplicated into plain `localStorage` keys (`accessToken`/`refreshToken`) for the axios interceptor to read without importing the store.
- **`store/theme.store.ts`** (Zustand, `persist`, key `Silarai-theme`): 5 preset dashboard color themes, applied via CSS custom properties on `document.documentElement`.
- **`context/CartContext.tsx`**: storefront shopping cart, persisted to `localStorage` under a per-tenant key.
- **`context/StorefrontAuthContext.tsx`**: separate auth system for public storefront customers (distinct from merchant dashboard auth), persisted to `sessionStorage` key `sf_customer`; exposes `useCustomerApi(slug)` for customer-scoped calls that bypass the shared JWT-refresh axios client.

### 5.3 API layer (`src/api/*.ts`)

One module per backend feature area (`auth`, `catalog`, `leads`, `orders`, `customers`, `ai`, `analytics`, `b2b`, `business`, `abandonedCarts`, `coupons`, `customDomain`, `import`, `landing`, `marketing`, `notifications`, `pages`, `payment`, `platformLeads`, `reviews`, `search`), each mapping close to 1:1 with a backend controller. Shared axios instance (`api/client.ts`) attaches the JWT bearer token and implements a queued single-flight refresh-on-401 flow, falling back to `forceLogout()` (clears all auth storage + hard redirect to `/login`) if refresh fails — this exists specifically to avoid a login↔dashboard redirect loop after backend restarts invalidate stored refresh tokens.

### 5.4 Key components

- **`layout/AppShell.tsx`**: sidebar + topbar shell; enforces the "Basic plan = chatbot-only" navigation restriction client-side (mirrors `BasicPlanAccessFilter` server-side), sets document title and applies the tenant's saved dashboard language.
- **`layout/Sidebar.tsx`** / **`layout/Topbar.tsx`**: full nav vs. reduced chatbot-only nav; global search, language switcher (12 locales), notification bell, PWA install prompt handling.
- **`storefront/CartDrawer.tsx`**: Razorpay checkout (dynamic script load) or COD with email-OTP verification.
- **`storefront/CustomDomainSettings.tsx`**: custom-domain connect UI, polls provisioning status every 15s.
- **`onboarding/OnboardingWizard.tsx`**: first-run setup flow with a gamified setup-completion score.
- **`landing/LeadChatWidget.tsx`**: lead-capture chat widget on the marketing site itself, can self-provision a demo tenant.

### 5.5 i18n

12 locales (`en, hi, ar, es, fr, pt, de, tr, id, bn, ta, zh`) in `src/i18n/locales/`, registered statically in `src/i18n/index.ts`. Persisted language key: `Silarai_lang`. Arabic is supported for translation strings but the UI stays LTR (no RTL layout switch implemented).

### 5.6 Build & deploy

- Vite build splits vendor and route-based chunks (`vendor-react`, `vendor-router`, `vendor-query`, `vendor-charts`, `chunk-storefront`, `chunk-landing`, `chunk-admin`, `chunk-ai`, `chunk-marketing`, `chunk-analytics`).
- Dual deploy target: **Azure Static Web Apps** (`staticwebapp.config.json`, matching GitHub Actions workflow at repo root) and **Vercel** (`vercel.json` + `api/manifest/[slug].js` serverless function that proxies per-tenant PWA manifests around a Chrome CORS restriction).
- Backend URL is always read from `VITE_API_URL` (`.env` locally, injected as a build-time env var in CI/Vercel) — no hardcoded fallback in app code, `vite.config.ts`, or `index.html`'s `%VITE_API_URL%` placeholders. The standalone `public/chatbot-widget.js` embed script is the one exception: it has no bundler/`.env` access (loaded directly by third-party sites), so it still falls back to the production Azure URL when the embedder doesn't pass `apiBase`.
- No test framework is configured on the frontend.

### 5.7 Embeddable chatbot widget (`public/chatbot-widget.js`)

A dependency-free vanilla-JS widget (~700 lines) that external site owners embed via `<script>` + `window.RCChatbotConfig = { apiKey, apiBase, ... }`. Talks directly to `GET/POST /api/v1/chatbot/{apiKey}/...` (config, message, order verify-payment), identified purely by API key — no relation to the dashboard's JWT auth. Supports product carousels, Razorpay checkout, and COD, essentially a framework-free clone of the in-app public storefront's chat/checkout experience for use on third-party (non-Silarai-hosted) sites.

### 5.8 Cloudflare Worker (`cloudflare-worker/storefront-proxy.js`)

Sits in front of both the canonical domain and merchant custom domains. Three responsibilities: (1) serves per-tenant `sitemap.xml`/`robots.txt`/`manifest.json`/`favicon.svg` directly from the backend, bypassing the SPA; (2) detects social/search crawlers and returns a minimal server-rendered HTML page with Open Graph/Twitter Card tags (since the React SPA can't be crawled for link previews); (3) passes everything else through to the Azure Static Web App origin with edge caching explicitly disabled, so custom-domain visitors never get a stale JS bundle.

## 6. Business logic highlights worth knowing before changing things

- **Multi-tenancy is enforced by three cooperating mechanisms** (DB query filter + request middleware + plan filter) — changing tenant-scoping logic requires touching all three consistently; see §4.2.
- **Order pricing must always be recomputed server-side from the live catalog**, never trusted from AI-provided or client-provided prices — this was fixed as a bug (see git history: "server is the price authority") and any change to order/checkout flows must preserve it.
- **Two independent customer identities exist per tenant**: the internal `Customer` (CRM contact tracked by staff) and `StorefrontCustomer` (self-service public storefront login), optionally linked via `LinkedCrmCustomerId`. Don't conflate the two when working on customer-related features.
- **Two independent auth systems on the frontend**: merchant dashboard auth (Zustand `auth.store`, JWT) and storefront customer auth (`StorefrontAuthContext`, separate token/session storage) — they use different axios paths and never share state.
- **`ReplyCart.Shared.Constants.PlanLimits`** (Free/Starter/Growth/Pro) looks superseded by the DB-driven `SubscriptionPlan` table and the newer `"basic"` (chatbot-only) plan tier enforced by `BasicPlanAccessFilter` — don't assume the hardcoded constants reflect current plan behavior; check `SubscriptionPlan` rows and `BasicPlanAccessFilter` instead.
- **WhatsApp templates are mid-migration** from a third-party BSP (AiSensy) to Meta's own Cloud API template submission flow (`WaTemplate.MetaTemplateId`/`MetaStatus`) — expect both code paths to still be present.
- **Self-serve subscription checkout was removed**: pricing is now performance-based (flat fee + % of AI-attributed sales) and plan changes happen manually via WhatsApp/email contact rather than in-app checkout (see recent git history).
- **DB migrations/seeding do not run automatically** on backend startup — must be applied manually. Don't assume a fresh `dotnet run` gives you a working schema/demo data.

## 7. Known inconsistencies / tech debt (verified, not assumed)

- README claims .NET 10/EF Core 9; actual code is net8.0/EF Core 8.0.0 everywhere including CI.
- FluentValidation and Hangfire are referenced dependencies with no actual usage — don't build on the assumption either is wired up.
- Two migration folders/namespaces coexist (`Infrastructure/Migrations/` and `Infrastructure/Persistence/Migrations/`) — a prior attempt to delete the older one and squash history was reverted; both are live history. See §4.6 for details and for the list of migrations that are deliberately left without `[Migration]` attributes (superseded duplicates, not bugs).
- `appsettings.json` has real secrets committed — be careful not to further leak or duplicate this pattern in new config.
- CORS `AllowFrontend` permits any `https://` origin with credentials — intentional (custom domains) but worth knowing before touching CORS.
- `Teams-Sitefinity-SSO-Guide.html` at repo root is unrelated to this product's domain — likely a stray file, not a real feature doc.

## 8. Where to look for more detail

- Full endpoint list and DTOs: the relevant `Controllers/v1/*Controller.cs` and matching `frontend/src/api/*.api.ts`.
- Full entity list: `backend/src/ReplyCart.Domain/*/**.cs`.
- Full migration history: `backend/src/ReplyCart.Infrastructure/Persistence/Migrations/`.
- Config keys: `backend/src/ReplyCart.Api/appsettings.json`.
- Chronological history of changes made to this codebase since context.md was introduced: `changes.md` (repo root).
