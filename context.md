# ReplyCart / Silarai — Project Context

> Authoritative reference for this codebase's architecture. Read it with the relevant specs before implementing features, fixing bugs, or refactoring (see *Working with specs* below). Update it whenever architecture or cross-cutting behaviour changes. Log every change in `changes.md`. **Feature-level detail (functional behaviour, rules, entities, endpoints, frontend screens, planned changes) lives in `specs/` — one spec per feature, table of contents `specs/index.md`; all open problems are in `specs/known-issues.md`.** This file keeps the architecture and cross-cutting detail, plus a map of where each feature lives (§4.3).

Product name in code/branding is **Silarai** (the GitHub repo, package names, and some domain classes still say **ReplyCart** — the two names refer to the same product; "ReplyCart" is the original/legacy name). Repo: `github.com:psitraders/silarai.git`.

## Working with specs (read before every change)

1. **Before changing anything:** find the feature(s) the change touches in `specs/index.md` (or the feature map, §4.3) and read each spec, `specs/_invariants.md` and the spec's *Known issues* in `specs/known-issues.md`, then the relevant sections of this file. Don't break a listed rule (e.g. `CAT-R3`, `INV-2`) without the user's approval. Put planned work in the spec's *Changes to be done* first.
2. **After the change, in the same change:** update the affected specs to describe what the code now does (behaviour, rules, backend, frontend) and remove shipped items from *Changes to be done*; in `specs/known-issues.md` remove fixed issues and add new ones (next free `KI-NNN`, IDs listed in the specs); update `specs/index.md` for added / renamed / removed specs; update this file only for architecture / cross-cutting changes; add one line to `changes.md` tagged with the spec id.

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
│   ├── scripts/add_superadmins.sql   idempotent T-SQL adding the 5 extra SuperAdmins (admin_one..admin_five@silarai.com) to existing DBs (local Docker, staging); IDs match DataSeeder
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
├── landing_website/                  PUBLIC MARKETING SITE (silarai.com) — a SEPARATE static React 19 + Vite 6 app with its own build, deploy, context.md and changes.md. Not part of the dashboard SPA. See §5.9.
├── imported_landing_website/         Google AI Studio export kept only as a merge reference for landing_website. GITIGNORED — never built, never deployed.
├── demo/                             demo data generation (jewellery-products.csv, generate.py, demo-store.html, RAG knowledge-base sample docs, chatbot demo SQL)
├── DM2OrderMigrationScript.sql        one-off raw DB/data migration script (order-system migration, not part of runtime)
├── Meta-Integration-Guide.html        standalone static doc: Meta (WhatsApp/IG/FB) integration guide
├── Teams-Sitefinity-SSO-Guide.html    standalone static doc, UNRELATED to this product's domain (Sitefinity/Teams SSO) — appears to be a stray file, not part of ReplyCart/Silarai functionality
├── .github/workflows/                CI: azure-static-web-apps-lemon-sea-*.yml (frontend → app.silarai.com), azure-static-web-apps-black-mushroom-*.yml (landing_website → silarai.com), deploy-backend.yml (backend → Azure App Service)
├── docs/                             design notes / plans (plan-chatbot-redis-session-memory.md, plan-storefront-builder.md, storefront-builder-catalogue.md)
├── specs/                            per-feature functional + technical specs (behaviour, rules, data, API, frontend, known-issue IDs, planned changes) + cross-feature invariants; table of contents specs/index.md, open problems specs/known-issues.md. Platform only — no landing_website specs.
├── backend-fast-api/, _to_delete/    gitignored / untracked scratch — not part of any build
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
| Frontend host | Dual: Azure Static Web Apps **and** Vercel (both configs present). Canonical app domain is `https://app.silarai.com`. The apex `silarai.com` is the separate `landing_website/` marketing site (§5.9) and serves none of the SPA's files, so `VITE_APP_URL` (used to build the chatbot embed snippet) must point at `app.silarai.com`. `www.silarai.com` does not resolve (NXDOMAIN) — the WordPress marketing site that used to live there was retired 2026-09-04. |
| File storage | Cloudinary (current), Local disk (`wwwroot/uploads/`) as fallback provider |
| AI provider | OpenAI (`gpt-4o-mini`, current default) or Mock provider, swappable via config |
| Cache / session store | Azure Managed Redis (StackExchange.Redis) — chatbot-client session memory, cart and catalogue cache only (§4.8). Optional: `Redis:Enabled=false` falls back to in-process + SQL. Everything else still uses `IMemoryCache`. |
| Payments | Razorpay (primary, India), Stripe, PayPal — all per-tenant credentials stored on the `Business` entity |
| Edge/CDN | Cloudflare Worker in front of custom domains + canonical domain (bot rendering, custom-domain routing). DNS for `silarai.com` runs on Cloudflare. |
| Marketing site | `landing_website/` — React 19 + Vite 6 + Tailwind v4, fully static, no backend, deployed to its own Azure Static Web App at `silarai.com` (§5.9) |

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
3. **Plan gating** (business rule, not a security boundary): `BasicPlanAccessFilter`, a global `IAsyncAuthorizationFilter`, restricts tenants on the `"basic"` (chatbot-only) subscription plan to a fixed allow-list of route prefixes (auth, subscription, plans, business, chatbot-clients, chatbot-usage, activity, search, team) — everything else returns 403 `PLAN_CHATBOT_ONLY`.

Public/anonymous endpoints (webhooks, public storefront, chatbot widget, health check) bypass JWT auth entirely and resolve tenant scope via slug or API key instead.

### 4.3 Feature map (where each feature lives)

Entities are in `ReplyCart.Domain/<Area>/`, handlers in `ReplyCart.Application/<Area>/`, endpoints in `ReplyCart.Api/Controllers/v1/`, screens in `frontend/src/pages/<area>/`. Full detail per feature: the linked spec (all specs: `specs/index.md`; open problems: `specs/known-issues.md`).

| Feature | Main entities | Controllers | Frontend | Spec |
|---|---|---|---|---|
| Dashboard auth, sessions, 2FA | `User`, `Role`/`UserRole`, `UserRefreshToken`, `UserToken` | `AuthController`, `OtpController` | `pages/auth/`, `pages/settings/AccountSecurityPage` | `auth-identity` |
| Team (Business Admins) | `User` + `BusinessAdmin` role, `UserToken` (Invitation) | `TeamController` | `pages/settings/TeamPage`, `pages/auth/AcceptInvitePage` | `auth-team` |
| Tenancy, plans, subscriptions | `Tenant`, `SubscriptionPlan`, `TenantSubscription` | `SubscriptionsController`, `PlansController` | `pages/subscription/` | `tenancy-plans` |
| Dashboard shell, nav, i18n, themes | — | — | `App.tsx`, `components/layout/`, `store/`, `i18n/` | `app-shell` |
| Business profile, onboarding | `Business`, `SocialLink` | `BusinessController` | `pages/settings/BusinessProfilePage`, `components/onboarding/`, `pages/tools/` | `business-profile` |
| Channel + payment credentials | `Business` (credential fields) | `IntegrationsController` | `pages/settings/IntegrationsPage` | `business-integrations` |
| Products | `Product`, `ProductVariant`, `ProductImage`, `ProductTag` | `ProductsController` | `pages/catalog/Products*`, `ProductFormPage` | `catalog-products` |
| Categories | `Category` | `CategoriesController` | `pages/catalog/CategoriesPage` | `catalog-categories` |
| Coupons | `Coupon` | `CouponsController` (+ public validate / list) | `pages/catalog/CouponsPage` | `catalog-coupons` |
| Reviews | `ProductReview` | `ReviewsController` (+ public) | `pages/catalog/ReviewsPage` | `catalog-reviews` |
| Product import | — | `ImportController`, `BusinessController` (WA catalogue) | `pages/catalog/ImportProductsPage` | `catalog-import` |
| Customers (CRM) | `Customer` | `CustomersController` | `pages/customers/` | `crm-customers` |
| Leads | `Lead`, `LeadNote`, `LeadActivity` | `LeadsController` | `pages/leads/` | `crm-leads` |
| Dashboard orders | `Order`, `OrderItem`, `Payment`, `OrderStatusHistory` | `OrdersController`, `InvoiceHelper` | `pages/orders/` | `orders-management` |
| Storefront checkout | `Order` (+ customer upsert) | `PublicStorefrontController` (COD), `PaymentController` (Razorpay) | `components/storefront/CartDrawer`, `storefront-builder/core/commerce/useBuyNow`, `pages/storefront/OrderConfirmationPage` | `orders-checkout` |
| Meta webhooks | (`Lead`, `ConversationSession`) | `WhatsApp/Instagram/FacebookWebhookController`, `ChatbotClientWebhookHelper` | — | `channels-inbox` |
| Tenant AI autopilot + simulator | `ConversationSession` | `BusinessController` (ai-settings, conversations), `ChatbotSimulatorController` | `pages/ai/AiAutopilotPage`, `AiConversationsPage`, `ChatbotSimulatorPage` | `ai-tenant-chatbot` |
| Storefront AI chat | (in-process memory) | `PublicStorefrontController` (`chat`) | `storefront-builder/shell/chatbot/StoreChatbot` | `ai-tenant-chatbot-storefront` |
| Chatbot-as-a-Service clients | `ChatbotClient`, `ChatbotProduct`, `ChatbotDocument`, `ChatbotOrder`, `ChatbotTokenUsage` | `AdminChatbotClientsController`, `ChatbotUsageController` | `pages/admin/AdminChatbot*`, `pages/chatbot/` | `chatbot-service` |
| Chatbot agent + session store | `ChatbotSession`, `ChatbotSessionMessage` | `ChatbotController` | — | `chatbot-service-agent` |
| Embeddable widget | — | — | `public/chatbot-widget.js` | `chatbot-service-widget` |
| Public storefront + settings | `StorefrontSettings` | `PublicStorefrontController`, `BusinessController` (storefront) | `storefront-builder/shell/`, `pages/settings/StorefrontSettingsPage` | `storefront` |
| Storefront accounts | `StorefrontCustomer`, `StorefrontWishlistItem` | `StorefrontCustomerController` | `context/StorefrontAuthContext`, `components/storefront/` | `storefront-accounts` |
| Custom domains + edge | `Tenant` (domain fields) | `CustomDomainController`, `PublicDomainController` | `components/storefront/CustomDomainSettings`, `cloudflare-worker/` | `storefront-custom-domains` |
| Storefront builder | `StorefrontTheme`, `StorefrontPage`, `StorefrontVersion`, `StorefrontSavedSection` | `StorefrontBuilderController`, `PublicStorefrontSiteController`, `StorefrontBuilderAiController` | `src/storefront-builder/` | `storefront-builder` (+ `-editor`, `-templates`, `-commerce`, `-ai`) |
| B2B / wholesale | `ProductWholesaleTier`, `QuoteRequest` | `B2BController`, `StorefrontQuoteController`, `PublicWholesaleTiersController` | `pages/b2b/`, `components/catalog/WholesaleTiersEditor` | `b2b-wholesale` |
| Campaigns | `Campaign`, `CampaignRecipient` | `MarketingController` | `pages/marketing/` | `marketing-campaigns` |
| WhatsApp templates | `WaTemplate` | `WaTemplatesController` | `pages/marketing/WaTemplatesPage` | `marketing-wa-templates` |
| Abandoned carts | `AbandonedCart` | `AbandonedCartsController` | `pages/marketing/AbandonedCartsPage` | `marketing-abandoned-carts` |
| Auto-campaigns | `AutoCampaign` | `BusinessController` (auto-campaigns) | `pages/ai/AiCampaignsPage` | `marketing-auto-campaigns` |
| AI content tools | `AiUsageLog`, `AiSuggestion`, `ReplyTemplate` | `MarketingController`, `AiSuggestionsController` | `pages/ai/` | `marketing-ai-content` |
| Dashboard, analytics, search | — | `AnalyticsController`, `ActivityController`, `SearchController` | `pages/dashboard/`, `pages/analytics/` | `analytics-dashboard` |
| SuperAdmin | `TenantNote`, `SystemAnnouncement`, `PlatformSetting` | `AdminTenantsController`, `AdminPlatformSettingsController` | `pages/admin/` | `superadmin` |
| In-app landing, platform leads | `LandingPageConfig`, `PlatformLead` | `LandingController`, `PlatformLeadsController`, `ChatbotOnboardController` | `pages/landing/`, `pages/legal/`, `components/landing/` | `superadmin-landing` |

Public / anonymous endpoints (webhooks, `/public/{slug}/…`, `/chatbot/{apiKey}/…`, `/public/resolve-domain`, landing content, platform leads, `/chatbot/onboard`, `/api/v1/health`) bypass JWT auth and resolve scope by slug, hostname, API key or channel id (INV-11).

### 4.4 API surface

All routes are under `/api/v1`, controllers in `ReplyCart.Api/Controllers/v1/` (MediatR handlers or, for simpler areas, `AppDbContext` directly). Each spec lists its endpoints with auth under *Backend → API*; the frontend mirror is `frontend/src/api/*.api.ts`.

### 4.5 Middleware pipeline (`Program.cs`, in order)

`UseResponseCompression` → `UseStaticFiles` → `GlobalExceptionMiddleware` (maps domain exceptions to HTTP status: `ValidationException`→422, `InsufficientStockException`→422, `NotFoundException`→404, `ForbiddenException`→403, `PlanLimitException`→402, else→500) → inline CORS-header stamping for `/api/v1/chatbot/*` (short-circuits OPTIONS preflight) → `UseRouting` → `UseCors("AllowFrontend")` → `UseAuthentication` → `TenantResolutionMiddleware` → `UseAuthorization` → `MapControllers` (with global `BasicPlanAccessFilter`).

CORS has two policies: `AllowWidget` (fully open, for the public embeddable chatbot) and `AllowFrontend` (allows localhost, configured origins, wildcard `*.replycart.app`, **and any `https://` origin outright** with `AllowCredentials()` — intentionally permissive to support arbitrary tenant custom domains).

**Known operational gaps** (flag before changing deploy/DB behavior): DB auto-migration and `DataSeeder` seeding on startup are both commented out in `Program.cs` — schema changes require manually running `dotnet ef database update` or applying the generated `ReplyCart_Database.sql`.

### 4.5.1 Secrets / configuration

**`appsettings.json` holds no credentials. Keep it that way.** Every secret value is an empty string in the committed file and is supplied at runtime instead. The 13 keys treated as secret:

`ConnectionStrings:DefaultConnection`, `Jwt:Secret`, `AI:OpenAI:ApiKey`, `Storage:Cloudinary:ApiKey`, `Storage:Cloudinary:ApiSecret`, `Razorpay:KeyId`, `Razorpay:KeySecret`, `WhatsApp:AccessToken`, `WhatsApp:VerifyToken`, `Meta:AppSecret`, `GoogleAnalytics:ServiceAccountPrivateKey`, `GoogleAnalytics:ServiceAccountPrivateKeyId`, `Cloudflare:ApiToken`, `Redis:AccessKey`.

- **Local dev**: values live in `backend/src/ReplyCart.Api/appsettings.Development.json`, which is gitignored (`.gitignore:9`). `appsettings.Development.example.json` is the tracked template — copy it and fill in. `dotnet run` defaults to the Development environment, so this layer loads automatically.
- **Azure App Service**: set them as application settings, replacing `:` with `__` (e.g. `AI__OpenAI__ApiKey`). Environment variables outrank both JSON layers.
- `Jwt:Secret` must be ≥32 characters or token signing throws at startup. An empty value fails fast and loudly — that is intentional, not a bug.

**History caveat:** these secrets were committed and pushed before this change and remain in git history on `main` and several feature branches. Blanking the file does not un-leak them — anything that was in there must be rotated at the provider, and was. Do not treat the current clean file as evidence that an old key is safe.

### 4.6 Migrations

**Correction (2026-07-19, superseding earlier notes below and in `changes.md`):** a prior session attempted to delete the entire migration history and squash it into a single fresh `InitialCreate` migration. That deletion never made it into a commit and was subsequently reverted (the working tree — and `git HEAD` — still has the original, pre-squash migration set). So: **the squash never actually happened.** Two migration folders coexist for historical/namespace reasons and both are real, active migration history:

- `Infrastructure/Migrations/` (namespace `ReplyCart.Infrastructure.Migrations`) — the original 18 migrations, `20260430052403_InitialSchema` through `20260517000000_AddAutonomousAi`.
- `Infrastructure/Persistence/Migrations/` (namespace `ReplyCart.Infrastructure.Persistence.Migrations`) — 16 more migrations continuing chronologically from `20260521115712_AddFaviconAndLoaderToStorefrontSettings` through `20260709000000_AddChatbotTokenUsage`.

EF Core discovers migrations across both folders/namespaces fine as long as each migration class carries `[DbContext(typeof(AppDbContext))]` + `[Migration("<id>")]` (normally scaffolded into a sibling `.Designer.cs`, but several migrations here are hand-written raw-SQL migrations with the attributes declared inline in the main file instead — both styles are valid and both patterns exist in this repo). A single `AppDbContextModelSnapshot.cs` lives in `Infrastructure/Migrations/` and is the one EF actually uses.

**Known landmine — migrations missing `[Migration]`/`[DbContext]` attributes are silently skipped, not errored.** Several migrations were hand-written (not scaffolded via `dotnet ef migrations add`) and never got these attributes, so `dotnet ef database update` / `Database.Migrate()` silently ignores them — no error, no warning, the table/column just never gets created. As of 2026-07-19, 6 migrations are *intentionally* left this way because they're fully superseded duplicates of a later migration (see below); any other migration file found without these attributes is a bug, not a design choice — check whether it's a genuine duplicate before blindly attributing it.

**Root cause of the recurring `dotnet ef database update` failures, fixed 2026-07-19:** `20260521115712_AddFaviconAndLoaderToStorefrontSettings` was scaffolded by comparing the current `AppDbContext` model against a snapshot that was stale by 9 migrations (because migrations `20260509000000_AddPlatformSettings` through `20260517000000_AddAutonomousAi` were hand-written without the `[Migration]` attribute and therefore never got applied or folded into the snapshot). As a result it redundantly tried to `CreateTable`/`AddColumn` things already created by `AddCouponsReviewsAbandonedCarts`, `AddLandingPageConfig`, and `AddAuthProductionFlows` — guaranteed "there is already an object named X" on any fresh DB. Fixed by trimming the duplicate `CreateTable`/`AddColumn`/`CreateIndex` calls out of that migration (kept only what's genuinely new, plus what only *it* creates because the corresponding hand-written migration stays unattributed — see below) and attributing the 11 other hand-written migrations that turned out to be genuine prerequisites (not duplicates) of later migrations' `AlterColumn` calls or of tables the chatbot migrations depend on.

**Migrations intentionally left without attributes (fully superseded — do not attribute these without also stripping the duplicate work from the migration that supersedes them):**
`20260509000000_AddPlatformSettings`, `20260512000000_AddCustomerBirthday`, `20260512100000_AddWhatsAppCatalogId`, `20260512130000_AddPaymentGatewayFields`, `20260517000000_AddAutonomousAi` (all fully re-implemented inside the trimmed `AddFaviconAndLoaderToStorefrontSettings`), and `20260522000000_AddB2CB2BFeatures` (fully re-implemented inside `20260523025922_AddLeadCreatedAtIndex`). Known gap: `AddPlatformSettings`'s seed-data `INSERT` (2Factor.in OTP API key into `PlatformSettings`) is lost since that migration never runs — the table gets created (by the trimmed Favicon migration) but the seed row does not. Add it back via a small new migration or manual insert if OTP relies on it.

**Resolved 2026-08-17 — `AppDbContextModelSnapshot.cs` regenerated.** It had drifted because every migration from `20260529000001_AddChatbotClients` onwards was hand-written idempotent SQL rather than scaffolded. Regenerated via `dotnet ef migrations add SyncModelSnapshot`; the scaffolder's diff re-created 8 tables (`ChatbotClients`, `ChatbotProducts`, `ChatbotDocuments`, `ChatbotOrders`, `ChatbotTokenUsages`, `ChatbotSessions`, `ChatbotSessionMessages`, `StorefrontPages`) and 4 columns (`StorefrontSettings.B2BEnabled`/`SubCategoriesEnabled`, `Categories.IsFeatured`/`ParentCategoryId`) that the hand-written migrations already create, so `20260817174237_SyncModelSnapshot.Up()` was trimmed to the only two objects present in the model but in no migration — `IX_ChatbotProducts_ClientId` and `FK_Categories_Categories_ParentCategoryId` — written as guarded raw SQL. Its `.Designer.cs` and the regenerated snapshot are the scaffolder's output, unmodified. **From here on `dotnet ef migrations add` produces a correct diff and should be the normal way to add migrations again**; only fall back to hand-written raw SQL when a change genuinely can't be expressed through the model.

**Production caveat**: if this schema was ever deployed to the production Azure SQL instance (§3), verify its `__EFMigrationsHistory` table before applying these changes there — specifically check whether `20260521115712_AddFaviconAndLoaderToStorefrontSettings` is already marked applied, since its trimmed content differs from what may have originally run.

**Baselining scripts (untracked, working tree only):** `backend/baseline_01_verify_schema.sql` verifies that every object created by migrations up to `20260709000000` exists and must return **zero rows**; `backend/baseline_02_write_history.sql` then writes the 31 guarded `__EFMigrationsHistory` inserts. These are the scripts used for the 2026-08-17 production baselining (`changes.md` calls them throwaway). They are deliberately not committed — treat them as the reference procedure if the history table ever needs baselining again.

`dotnet ef` commands (e.g. `dotnet ef database update`) don't go through `Program.cs`/DI — they use `Infrastructure/Persistence/AppDbContextFactory.cs` (`IDesignTimeDbContextFactory<AppDbContext>`), which has its own hardcoded connection string (defaults to the Dockerized SQL Server on `localhost,1433`, matching `appsettings.json`; override via `ConnectionStrings__DefaultConnection` env var). Run them from `backend/` as `dotnet ef database update --project src/ReplyCart.Infrastructure --startup-project src/ReplyCart.Api` — `backend/` itself holds only the solution. If this factory's connection string ever drifts from the real DB target, `dotnet ef` commands fail even though the app itself connects fine.

### 4.7 AI pipelines (summary)

Three conversation paths share only the AI provider (`IAiProvider` single-shot JSON, `IAgentAiProvider` tool calling; OpenAI `gpt-4o-mini` or Mock via `AI:Provider`) — never merge them (INV-3):

- **Tenant channel autopilot** — WhatsApp webhook → `HandleInboundMessageCommand` → `RagContextBuilder` (structured context, not embeddings) → `ConversationSystemPromptBuilder` → reply + `ConversationSession` state. Instagram / Facebook tenant messages only create leads. Spec `ai-tenant-chatbot`.
- **Tenant storefront chat** — `POST /public/{slug}/chat` with its own inline prompt (full catalogue) and in-process `IConversationMemoryService`; reprices and places COD / online orders. Spec `ai-tenant-chatbot-storefront`.
- **Chatbot-as-a-Service** — `ChatbotController` → bounded tool-calling `ChatbotAgent` with a server cart and the Redis → memory → SQL `IChatSessionStore`; channels still single-shot (`ChatbotClientWebhookHelper`). Specs `chatbot-service`, `chatbot-service-agent`, `chatbot-service-widget`.

### 4.8 Chatbot-as-a-Service

Moved to `specs/chatbot-service-agent.md` (agent loop, tools, prompt split, carousel rules, NDJSON transport, session store tiers, phasing) and `specs/chatbot-service.md` (clients, admin API). Redis settings: `Redis` section of `appsettings.json`; `Redis:Enabled=false` runs in-process + SQL only; `/api/v1/health` reports Redis but never 503s on it.

### 4.9 Storefront builder (backend slice)

Moved to `specs/storefront-builder.md` (data model, validation, smart values, merchant + public APIs, demo designs) and the family specs `storefront-builder-editor` / `-templates` / `-commerce` / `-ai`. Phase history: `changes.md` (`[storefront-builder]`); plan `docs/plan-storefront-builder.md`.

## 5. Frontend architecture

### 5.1 Routing (`src/App.tsx` — router lives entirely in this one file)

- **Custom-domain detection**: if `window.location.hostname` isn't localhost/`silarai`/`replycart`/`azurestaticapps`, the app assumes a merchant custom domain and renders a dedicated `<CustomDomainStorefront />` route tree (resolves slug via `GET /public/resolve-domain?domain=...`) instead of the normal routes.
- **`SmartRoot`** (`/`): redirects authenticated users to `/dashboard`, otherwise shows the public `LandingPage`.
- **`AuthGuard`** wraps the entire authenticated app shell; **`GuestGuard`** redirects already-authenticated users away from `/login`/`/register`/`/forgot-password`; **`TenantAdminGuard`** protects owner-only pages (`/settings/team`) and redirects everyone else to `/dashboard`. `/accept-invite` (Business Admin sets password from the invite email) is public, like `/reset-password`.
- Authenticated routes (`/dashboard`, `/catalog/*`, `/leads/*`, `/orders/*`, `/customers/*`, `/ai/*`, `/analytics`, `/settings/*`, `/storefront`, `/integrations`, `/subscription`, `/marketing/*`, `/chatbot-clients*`, `/chatbot-usage`, `/b2b/quotes`, `/tools/qr-code`, `/admin/*`) are nested inside `<AppShell />` (sidebar + topbar layout).
- Public storefront routes: `/{slug}`, `/{slug}/products`, `/{slug}/products/:productId`, `/{slug}/category/:categorySlug`, `/{slug}/p/:pageSlug` all render the storefront builder's `StorefrontRoute` (§5.10) with a `kind`; `/{slug}/order-confirmation/:orderId` stays `OrderConfirmationPage`. Each is wrapped in a `SlugCartProvider` so cart state (`localStorage` key `cart_{slug}`) never bleeds across tenants (custom pages too, since Phase 1). The custom-domain route tree mirrors these. Dev builds also route `/__storefront/gallery` (pack gallery).
- **Storefront editor**: `/storefront/editor?page=home|collection|<pageId>` — full screen, `AuthGuard` but outside `AppShell`, lazy (`loadEditor()`); sidebar item *Customise store*. `/pages` redirects to it (the old `PagesPage.tsx` / `api/pages.api.ts` were deleted in Phase 2).
- Nearly all pages are `React.lazy`-loaded with manual Vite chunk groupings (see §5.6).

### 5.2 State management

- **`store/auth.store.ts`** (Zustand, `persist`, localStorage key `silarai-auth`): `accessToken`, `refreshToken`, `user`, `isAuthenticated`, `_hasHydrated` (guards redirect races before rehydration). Tokens are duplicated into plain `localStorage` keys (`accessToken`/`refreshToken`) for the axios interceptor to read without importing the store.
- **`store/theme.store.ts`** (Zustand, `persist`, key `Silarai-theme`): 5 preset dashboard color themes, applied via CSS custom properties on `document.documentElement`.
- **`context/CartContext.tsx`**: storefront shopping cart, persisted to `localStorage` key `cart_{slug}` (lines keyed by product + variant).
- **`context/StorefrontAuthContext.tsx`**: separate auth system for public storefront customers (distinct from merchant dashboard auth), persisted to `localStorage` key `sf_customer_{slug}` (migrates the old `sessionStorage` key); exposes `useCustomerApi(slug)` for customer-scoped calls that bypass the shared JWT-refresh axios client.

### 5.3 API layer (`src/api/*.ts`)

One module per backend feature area (`auth`, `catalog`, `leads`, `orders`, `customers`, `ai`, `analytics`, `b2b`, `business`, `abandonedCarts`, `coupons`, `customDomain`, `import`, `landing`, `marketing`, `notifications`, `payment`, `platformLeads`, `reviews`, `search`, `team`; some pages also call `apiClient` directly; the storefront builder has its own `core/data` / `core/commerce` / `editor/api.ts` clients), each mapping close to 1:1 with a backend controller. Shared axios instance (`api/client.ts`) attaches the JWT bearer token and implements a queued single-flight refresh-on-401 flow, falling back to `forceLogout()` (clears all auth storage + hard redirect to `/login`) if refresh fails — this exists specifically to avoid a login↔dashboard redirect loop after backend restarts invalidate stored refresh tokens.

### 5.4 Key components

Feature components are documented in their specs: shell (`AppShell`, `Sidebar`, `Topbar`) → `app-shell`; `CartDrawer` → `orders-checkout`; `CustomDomainSettings` → `storefront-custom-domains`; `OnboardingWizard` → `business-profile`; `LeadChatWidget` → `superadmin-landing`; `components/ui/*` are the shared dashboard primitives.

### 5.5 i18n

12 locales (`en, hi, ar, es, fr, pt, de, tr, id, bn, ta, zh`) in `src/i18n/locales/`, registered statically in `src/i18n/index.ts`. Persisted language key: `Silarai_lang`. Arabic is supported for translation strings but the UI stays LTR (no RTL layout switch implemented).

### 5.6 Build & deploy

- Vite build splits vendor and route-based chunks (`vendor-react`, `vendor-router`, `vendor-query`, `vendor-charts`, `chunk-storefront`, `chunk-landing`, `chunk-admin`, `chunk-ai`, `chunk-marketing`, `chunk-analytics`). `chunk-storefront` includes the storefront-builder `core/`, `ui/` and `shell/`; each pack layout stays its own lazy chunk, and DOMPurify loads only when a page has rich text. The registry loads every runtime `manifest.ts` eagerly, but editor-only metadata (fields, blocks, presets, thumbnails) lives in each pack's `editor.ts`, loaded only by the editor (Phase 3). Product-view parts (`ui/product/`, `ui/Overlay`, `core/commerce/use*|api|razorpay`) and `shell/chatbot/` are excluded from the chunk so they load with the layouts / on demand. ~125 kB / 39 kB gzip after Phase 3 (165 / 49 kB after Phase 2). The editor is its own chunk (`StorefrontEditor-*.js`, ~231 kB / 65 kB gzip incl. `@dnd-kit` and all `editor.ts` metadata).
- Dual deploy target: **Azure Static Web Apps** (`staticwebapp.config.json`, matching GitHub Actions workflow at repo root) and **Vercel** (`vercel.json` + `api/manifest/[slug].js` serverless function that proxies per-tenant PWA manifests around a Chrome CORS restriction).
- Backend URL is always read from `VITE_API_URL` (`.env` locally, injected as a build-time env var in CI/Vercel) — no hardcoded fallback in app code, `vite.config.ts`, or `index.html`'s `%VITE_API_URL%` placeholders. The standalone `public/chatbot-widget.js` embed script is the one exception: it has no bundler/`.env` access (loaded directly by third-party sites), so it still falls back to the production Azure URL when the embedder doesn't pass `apiBase`.
- No test framework is configured on the frontend.

### 5.7 Embeddable chatbot widget (`public/chatbot-widget.js`)

Dependency-free vanilla JS loaded by third-party sites (Shadow DOM, API-key auth, NDJSON streaming, server-mirrored cart). Outside the Vite build and never type-checked; only coverage is `frontend/test/chatbot-widget.test.mjs` (`npm install --no-save jsdom && node test/chatbot-widget.test.mjs`). Deploys need cache-busting the embed URL and must stay backward compatible. Full detail, layout traps and rules: `specs/chatbot-service-widget.md`.

### 5.8 Cloudflare Worker (`cloudflare-worker/storefront-proxy.js`)

Sits in front of merchant custom domains: per-tenant `sitemap.xml` / `robots.txt` / `manifest.json` / `feed.xml` / `favicon.svg` from the backend, OG HTML for crawlers, everything else proxied with edge caching disabled. Deployed separately. Detail: `specs/storefront-custom-domains.md` (origin issue KI-026).

### 5.9 Marketing website (`landing_website/`) — a separate application

`silarai.com` is **not** served by `frontend/`. It is a standalone, fully static React 19 + Vite 6 + Tailwind v4 site in `landing_website/` with no backend of its own, deployed to its own Azure Static Web App by `.github/workflows/azure-static-web-apps-black-mushroom-050c17800.yml` (`app_location: ./landing_website`, `output_location: dist`, built by Oryx in CI; `SITE_URL` is injected there because Vite inlines `VITE_*`/build-time values inside the action).

**It has its own authoritative `landing_website/context.md` and `landing_website/changes.md`. Read those before touching anything under `landing_website/`** — this section is only the pointer. Worth knowing from here:

- Hand-rolled client routing (no router library); heavy SEO/GEO/AEO layer with build-time generation of `sitemap.xml`, `robots.txt`, `llms.txt`, `ai-manifest.json`, `.well-known/*` and `/ai/*.json` via `scripts/generate-static-discovery.mts`.
- Enquiry forms are a **`mailto:` handoff** to the visitor's own mail client — no form service, no backend, and therefore no server-side record of leads.
- Brand palette rebranded 2026-09-16 to Dark Teal `#245668` / Teal Green `#0D8F81` / Persimmon `#F47A38`; the legacy `plum-*`/`peach-*`/`coral-*` token names were kept and remapped onto the new ramps.
- `imported_landing_website/` is a Google AI Studio export kept **only** as a merge reference. It is gitignored, still carries the retired Express/Vercel setup (`server.ts`, `api/`, `vercel.json`, express/nodemailer/@google/genai), and must never be built or deployed — see `landing_website/context.md` §4.0.

**Do not conflate this with the dashboard's own in-app landing page** (`frontend/src/pages/landing/`, served at `app.silarai.com/` by `SmartRoot`, content editable by SuperAdmin via `LandingPageConfig`). They are different apps with different content stores.

### 5.10 Storefront builder module (`src/storefront-builder/`)

Replaced the fixed storefront pages (deleted in Phase 1). Only `index.ts` (`StorefrontRoute`, `loadEditor`, `loadDevGallery`) may be imported by the app — enforced by the ESLint rule `storefront-builder/boundaries`. Folders: `core/` (types, registry, renderer, theme, data, commerce), `ui/`, `shell/`, `packs/`, `templates/`, `editor/`, `dev/`. Full detail: `specs/storefront-builder.md` and family; UI rules `frontend/design.md` §2.2 / §13; options catalogue `docs/storefront-builder-catalogue.md`.

## 6. Business logic highlights worth knowing before changing things

- **Multi-tenancy is enforced by three cooperating mechanisms** (DB query filter + request middleware + plan filter) — changing tenant-scoping logic requires touching all three consistently; see §4.2.
- **Order pricing must always be recomputed server-side from the live catalog**, never trusted from AI-provided or client-provided prices — this was fixed as a bug (see git history: "server is the price authority") and any change to order/checkout flows must preserve it. In the Chatbot-as-a-Service module this is stronger still: the AI cannot state a price at all, only product ids (§4.8). **Known violations (2026-10-21):** the storefront Razorpay checkout and staff-entered orders take client prices — KI-009, KI-012 in `specs/known-issues.md`.
- **Independent chatbot pipelines exist** (tenant channel autopilot, tenant storefront chat, Chatbot-as-a-Service — §4.7). They share only the AI provider interfaces. Changing one does not change the others, and merging them is not a small refactor.
- **Two independent customer identities exist per tenant**: the internal `Customer` (CRM contact tracked by staff) and `StorefrontCustomer` (self-service public storefront login), optionally linked via `LinkedCrmCustomerId`. Don't conflate the two when working on customer-related features.
- **Dashboard roles**: `SuperAdmin` (platform, Silarai team — 6 accounts on the `Silarai System` tenant: `admin@silarai.app` plus `admin_one..admin_five@silarai.com`; created only by `DataSeeder.SeedAdminAsync`/`SeedExtraSuperAdminsAsync` on fresh DBs or `backend/scripts/add_superadmins.sql` on existing ones, no UI/API), `TenantAdmin` (store owner — created by register / chatbot onboarding / onboarding scripts) and `BusinessAdmin` (invited by the TenantAdmin from **Team**; email link → `/accept-invite` sets the password and verifies the email). A BusinessAdmin has the same tenant access as the TenantAdmin except team management (`TeamController` is TenantAdmin-only) and plan changes (`SubscriptionsController.SelectPlan` rejects BusinessAdmin; `SubscriptionPage` hides the change-plan card). Deactivating a BusinessAdmin revokes their refresh tokens (access token still valid ≤ 15 min). No limit on the number of admins (`MaxStaffUsers` is display-only). Emails are globally unique, so one person can't be a user of two tenants.
- **Two independent auth systems on the frontend**: merchant dashboard auth (Zustand `auth.store`, JWT) and storefront customer auth (`StorefrontAuthContext`, separate token/session storage) — they use different axios paths and never share state.
- **`ReplyCart.Shared.Constants.PlanLimits`** (Free/Starter/Growth/Pro) looks superseded by the DB-driven `SubscriptionPlan` table and the newer `"basic"` (chatbot-only) plan tier enforced by `BasicPlanAccessFilter` — don't assume the hardcoded constants reflect current plan behavior; check `SubscriptionPlan` rows and `BasicPlanAccessFilter` instead.
- **WhatsApp templates run on the Meta Cloud API** (`WaTemplate.MetaTemplateId` / `MetaStatus`, tenant WABA credentials); the earlier AiSensy path is gone — only names / comments still mention it (`specs/marketing-wa-templates.md`).
- **Self-serve subscription checkout was removed**: pricing is performance-based (flat fee + % of AI-attributed sales); plan changes are requested via WhatsApp / email (or the `select` API, which creates a `PendingApproval` subscription) and activated by a SuperAdmin (`specs/tenancy-plans.md`).
- **DB migrations/seeding do not run automatically** on backend startup — must be applied manually. Don't assume a fresh `dotnet run` gives you a working schema/demo data.

## 7. Known inconsistencies / tech debt (verified, not assumed)

- README claims .NET 10/EF Core 9; actual code is net8.0/EF Core 8.0.0 everywhere including CI.
- FluentValidation and Hangfire are referenced dependencies with no actual usage — don't build on the assumption either is wired up.
- Two migration folders/namespaces coexist (`Infrastructure/Migrations/` and `Infrastructure/Persistence/Migrations/`) — a prior attempt to delete the older one and squash history was reverted; both are live history. See §4.6 for details and for the list of migrations that are deliberately left without `[Migration]` attributes (superseded duplicates, not bugs).
- `appsettings.json` no longer contains secrets — they were blanked 2026-08-01 (§4.5.1). But they remain in **git history** on `main` and several feature branches, so the leak is not undone; rotation at the provider was the actual mitigation. Don't reintroduce the pattern in new config.
- CORS `AllowFrontend` permits any `https://` origin with credentials — intentional (custom domains) but worth knowing before touching CORS.
- `Teams-Sitefinity-SSO-Guide.html` at repo root is unrelated to this product's domain — likely a stray file, not a real feature doc.
- Feature-level defects and mismatches (e.g. coupon discounts not applied, Razorpay pricing, webhook signatures, subscription admin role check) are tracked in `specs/known-issues.md` with severity and affected specs.

## 8. Where to look for more detail

- Full endpoint list and DTOs: the relevant `Controllers/v1/*Controller.cs` and matching `frontend/src/api/*.api.ts`.
- Full entity list: `backend/src/ReplyCart.Domain/*/**.cs`.
- Full migration history: `backend/src/ReplyCart.Infrastructure/Persistence/Migrations/`.
- Config keys: `backend/src/ReplyCart.Api/appsettings.json`.
- The marketing website at `silarai.com`: `landing_website/context.md` and `landing_website/changes.md` — authoritative for that app; this file only points at it (§5.9).
- Chronological history of changes made to this codebase since context.md was introduced: `changes.md` (repo root).
- Per-feature behaviour, rules, entities, endpoints, frontend screens and planned changes: `specs/` (table of contents `specs/index.md`, workflow `specs/README.md`, shared rules `specs/_invariants.md`, open problems `specs/known-issues.md`).
- Storefront builder: plan `docs/plan-storefront-builder.md`, option catalogue `docs/storefront-builder-catalogue.md`, UI rulebook `frontend/design.md`.
