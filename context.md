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
| Cache / session store | Azure Managed Redis (StackExchange.Redis) — chatbot-client session memory, cart and catalogue cache only (§4.8). Optional: `Redis:Enabled=false` falls back to in-process + SQL. Everything else still uses `IMemoryCache`. |
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
- **Chatbot-as-a-Service** (separate product line, `TenantId` nullable): `ChatbotClient` (own WhatsApp/FB/IG/Shopify/Razorpay credentials, `ApiKey` auth), `ChatbotProduct`, `ChatbotOrder`, `ChatbotDocument` (uploaded KB doc, `ExtractedText` feeds RAG), `ChatbotTokenUsage`, `ChatbotSession` + `ChatbotSessionMessage` (durable transcript + cart behind the Redis session store, see §4.8).
- **Admin/Config** (platform-level, not tenant-scoped): `SystemAnnouncement`, `TenantNote`, `LandingPageConfig` (marketing site content as JSON blob), `PlatformLead` (marketing-site signup leads, with UTM tracking), `PlatformSetting` (key-value store).

### 4.4 API surface (`Controllers/v1/`)

Grouped by area — see the backend for exact `[Route]` attributes:

- **Auth**: `AuthController` (`/auth` — register/login/refresh/logout/me/2FA/profile/sessions), `OtpController` (`/auth/otp`).
- **Merchant core**: `BusinessController` (`/business`), `CategoriesController`, `ProductsController`, `CouponsController`, `ReviewsController`, `CustomersController`, `LeadsController`, `OrdersController`, `ImportController` (bulk import preview/confirm).
- **Marketing/AI**: `MarketingController`, `WaTemplatesController`, `AbandonedCartsController`, `AiSuggestionsController` (`/ai`), `AnalyticsController`, `ActivityController`, `SearchController` (global topbar search).
- **B2B/Storefront config**: `B2BController`, `PagesController` (custom CMS pages), `IntegrationsController`, `SubscriptionsController`, `PlansController`, `CustomDomainController` (Cloudflare custom domain setup).
- **Public/anonymous**: `PublicDomainController` (custom-domain → tenant slug resolution), `PublicStorefrontController` (`/public/{slug}`), `StorefrontCustomerController` (+ nested `StorefrontQuoteController`, `PublicWholesaleTiersController`), `PaymentController` (`/public/{slug}/payment` — Razorpay/Stripe/PayPal), `HealthController`.
- **Channel webhooks**: `WhatsAppWebhookController`, `FacebookWebhookController`, `InstagramWebhookController` (`/webhooks/...` — inbound message entry points feeding `HandleInboundMessageCommand`).
- **Chatbot-as-a-Service**: `ChatbotController` (`/chatbot/{apiKey}/...` — `message`, `config`, `products`, `cart` (GET+POST), `orders/{id}/verify-payment`; public, `AllowWidget` CORS policy), `ChatbotOnboardController`, `ChatbotSimulatorController`, `ChatbotUsageController`.
- **SuperAdmin**: `AdminTenantsController`, `AdminPlatformSettingsController`, `AdminChatbotClientsController`, `LandingController`, `PlatformLeadsController`/`AdminPlatformLeadsController`.

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

`dotnet ef` commands (e.g. `dotnet ef database update`) don't go through `Program.cs`/DI — they use `Infrastructure/Persistence/AppDbContextFactory.cs` (`IDesignTimeDbContextFactory<AppDbContext>`), which has its own hardcoded connection string (defaults to the Dockerized SQL Server on `localhost,1433`, matching `appsettings.json`; override via `ConnectionStrings__DefaultConnection` env var). Run them from `backend/` as `dotnet ef database update --project src/ReplyCart.Infrastructure --startup-project src/ReplyCart.Api` — `backend/` itself holds only the solution. If this factory's connection string ever drifts from the real DB target, `dotnet ef` commands fail even though the app itself connects fine.

### 4.7 The autonomous AI conversation flow ("Rag" module)

Not vector-embedding RAG — a structured-context approach:

1. A channel webhook (`WhatsAppWebhookController`/`InstagramWebhookController`/`FacebookWebhookController`) or the chatbot widget (`ChatbotController`) receives an inbound message.
2. `HandleInboundMessageCommand` (or the chatbot-widget equivalent) loads/creates the `ConversationSession` for that customer+channel.
3. `RagContextBuilder` assembles a `RagContext`: store info, keyword-matched relevant products, the customer's order history, and recent conversation messages.
4. `ConversationSystemPromptBuilder` turns that into a system prompt.
5. `IAiProvider.HandleConversationAsync` (OpenAI or Mock) generates the reply, potentially advancing `ConversationSession.State` and populating collected fields (name/phone/address/cart).
6. When the state reaches `Ordered`, an `Order` (and/or `Lead`) is created; the server always recomputes prices from the live catalog rather than trusting AI-stated prices (price-authority safeguard, see `changes.md` history).

**This flow is the TENANT chatbot only.** The Chatbot-as-a-Service product line has its own, separate pipeline — see §4.8. Do not conflate them: they share `IAiProvider` and nothing else.

### 4.8 Chatbot-as-a-Service conversation flow (external clients)

Entry points: `ChatbotController` (`POST /api/v1/chatbot/{apiKey}/message`, web widget — **runs the tool-calling agent**) and `ChatbotClientWebhookHelper` (WhatsApp / Messenger / Instagram, called from the three webhook controllers when the inbound identity matches a `ChatbotClient` rather than a tenant — **still single-shot**, see Phasing below).

**Session state — `IChatSessionStore` (three tiers).** Distinct from `IConversationMemoryService`, which is still the in-process store for the tenant chatbot and tenant webhooks. Do not merge them; this one is async and carries cart + collected fields.

| Tier | Implementation | Role |
|---|---|---|
| Hot | `RedisChatSessionStore` | Azure Managed Redis. `{prefix}:{clientId}:{sessionId}:msgs` LIST (RPUSH + LTRIM), `:cart` STRING (JSON), `:profile` HASH. Sliding TTL refreshed on read and write. |
| Warm | `InMemoryChatSessionStore` | Per-process. Written on every turn even when Redis is healthy, so a Redis outage degrades to "this instance still remembers you". Timer-swept. |
| Cold | `SqlChatSessionArchive` → `ChatbotSessions` / `ChatbotSessionMessages` | Durable transcript + cart. Written write-behind by `ChatSessionArchiveWorker` (bounded `Channel`, `DropOldest`), never on the request path. Read **only** on a Redis-down + cold-instance double miss. |

`ResilientChatSessionStore` is the registered `IChatSessionStore` and owns the failure policy: it tries Redis, and after `Redis:CircuitFailureThreshold` consecutive failures opens a circuit for `Redis:CircuitOpenSeconds` so every turn stops paying the timeout. **A Redis outage degrades the chatbot; it never fails a buyer's message.** `/api/v1/health` reports Redis status but never 503s on it.

Config lives in the `Redis` section of `appsettings.json`. `Enabled=false` means no Redis is registered at all and the module runs on the in-process store + SQL archive — that is the supported way to run without a Redis instance. Override per environment with `Redis__Enabled` / `Redis__Endpoint` / `Redis__AccessKey` App Service settings.

**The web widget path runs a tool-calling AGENT (`Application/Chatbot/Agent/`).** The WhatsApp / Messenger / Instagram path still runs the older single-shot builder — see "Phasing" at the end of this section. Do not assume the two are the same.

**Per-turn flow (`ChatbotController` → `ChatbotAgent`):**

1. Resolve `ChatbotClient` by API key from SQL. Deliberately *not* cached — the row carries `RazorpayKeySecret`.
2. `IChatbotContextCache` supplies the catalogue (`ChatbotCatalogItem` projections) and the **pre-chunked** knowledge base, from Redis + `IMemoryCache`. Invalidated by every product/document/Shopify/client write in `AdminChatbotClientsController`.
3. `IChatSessionStore.GetAsync` returns history + cart + profile in one round-trip.
4. `ChatbotCartResolver.Reprice` re-resolves every stored cart line against the live catalogue — stale prices and delisted products can never reach an order.
5. `ChatbotAgentPromptBuilder` builds the system prompt (below). The catalogue is **never inlined** — the model gets a category index and searches for the rest.
6. `ChatbotAgent.RunAsync` drives the loop: call the model with tools → execute any tool calls server-side → feed results back → repeat until it answers in prose. Bounded at 4 model calls and 8 tool calls per turn; the final iteration is made with **no tools at all**, which forces prose, so a model that loops on `search_catalog` costs a fixed ceiling and can never hang a buyer's message. Token usage is summed across the whole turn and recorded once to `ChatbotTokenUsages`.
7. `place_order` is **terminal**: the loop stops and returns a `ChatbotOrderIntent`. The controller creates the order from the **server cart** — order number, total and Razorpay handoff are all server-generated, so the model can never announce an order that was not written. An empty cart at `place_order` is refused. Cart is then cleared and state set to `ordered`.

**Prompt structure — the split is load-bearing.** `ChatbotAgentPromptBuilder` emits a static prefix (identity, catalogue index, rules) that is byte-identical per client on every turn, so the provider's automatic prompt cache hits; then a dynamic suffix (focused product, `CURRENT CART`, already-collected fields, KB passages). **Moving any per-turn content above the prefix silently destroys the cache hit on every turn.** Measured: the prompt is ~570 tokens at 50 products and ~570 tokens at 2,000 — prompt cost does not scale with catalogue size.

**Tools (`ChatbotAgentTools`).** In focused (single-product) mode the two catalogue tools are withheld entirely, so "only discuss this product" is enforced by absence rather than by instruction. `place_order` is withheld when `CanPlaceOrders` is false.

| Tool | Server behaviour |
|---|---|
| `search_catalog(query, category?, min_price?, max_price?)` | Filter + keyword rank over the cached catalogue, max 8. Falls back to the filtered set if ranking finds nothing, and to a "we don't stock it" instruction if the store genuinely has no match. |
| `get_product_details(product_ids[])` | Full description + variants, max 6, ids validated against the catalogue. |
| `update_cart(ops[])` | Same `ChatbotCartResolver.Apply` as before. Unresolvable ops are dropped, and an unchanged cart after a mutating op is reported back as an explicit failure so the model cannot claim it added something it didn't. |
| `save_customer_details(name?, phone?, address?, payment_method?)` | Persists to `ChatProfile`, sets state `collecting_info`. Replaces the old JSON-envelope field scraping. |
| `place_order(name, phone, address, payment_method?)` | Terminal — not executed here. See step 7. |

**Product carousel.** Cards are whatever the model actually looked up this turn (`search_catalog` / `get_product_details` results, deduped, max 6), so the cards and the words cannot disagree. Suppressed entirely in focused mode (the widget pins the product in its header) and during the order flow (`collecting_info` / `confirming` / `order_ready`). The widget renders `mentionedProducts` and has **no fallback of its own** — the decision is made server-side in `ChatbotAgent.Finish` and is authoritative.

**Cards have two sources, in strict priority order** (`ChatbotAgent.Finish`):

1. **Tool results this turn** (`surfaced`) — the primary source, used whenever the model called `search_catalog`/`get_product_details`.
2. **Products the reply text itself names** (`ChatbotCatalogSelector.MentionedIn`) — the fallback, used only when (1) is empty. The model can answer a product question from what it already said last turn ("tell me more about the pearl ones") without calling any tool, which previously produced a product-listing reply with no carousel under it.

Source (2) matches exact product titles inside the model's **own reply**, longest-title-first so a longer title claims its span before a shorter substring title can match inside it (`Antique Peacock Contemporary Earrings` must not also emit a separate `Peacock Earrings` card), ordered by position of mention, with a `MinTitleLength` floor so a generic one-word title can't turn an unrelated sentence into a card. **This is not the client-side ranker that was removed** (§4.8 history): that one ranked the *buyer's* message and fell back to a category spread, so it fired after every message including "hi". This one is derived from the model's own words, so cards still cannot disagree with the reply, and a reply naming no product yields no cards.

**Ordering between the two checks is load-bearing.** The reply-text fallback sits *after* the `inOrderFlow` check, never before. During checkout the model naturally names the item being bought ("your Gold Jhumka Earrings will be delivered soon") — letting a text mention reach the carousel there would resurrect it mid-order. Only a real tool call (`justSearched`) is trusted to override order-flow suppression; a text mention is not.

**`ChatProfile.State` is monotonic — the carousel rule must never simply inherit it.** Nothing in `IChatSessionStore` ever writes the state back down: `save_customer_details` only advances it to `collecting_info`, a placed order pins it at `ordered`, and `PatchProfileAsync` ignores nulls by design. `ChatbotAgent.Finish` therefore **recomputes** `inOrderFlow` each turn from two independent signals, not from the stored state alone: (1) `ordered` is treated as terminal rather than in-flight (the ordering turn itself is covered by `intent != null`), so it never suppresses a later turn; (2) a fresh `search_catalog`/`get_product_details` result THIS turn (`justSearched`) overrides `collecting_info` even when the SAME turn also called `save_customer_details` — a buyer who volunteers a detail in the same breath as a product question ("Hi, I'm Ravi, show me some sarees") gets both captured, and the model's own tool calls this turn are a stronger signal of current intent than an incidentally-set state field. Skipping (1) kills the carousel for the rest of the session after the first order and survives a page refresh (the widget keeps `sessionId` in `localStorage["rc_s_" + apiKey]` and the Redis profile TTL slides on every read); skipping (2) intermittently kills the carousel on any turn where a search and a detail-capture land together — same symptom, harder to reproduce on demand since it depends on the model's own tool-call choices. If you add a new state, decide explicitly whether a same-turn search should be able to override it.

> **Why this replaced the old design.** Previously the reply hung on a 12-product shortlist built by `ChatbotCatalogSelector.BuildPromptSet`, seeded with `ChatProfile.LastShownProductIds` — which was itself set to the *previous* turn's shortlist. From turn two onward those carried-over ids consumed the entire budget before the current query's matches were considered, so the model answered from stale products while the carousel, which re-ranked from scratch, showed the correct ones. `LastShownProductIds` is now kept **only** so a follow-up like "add the second one" can resolve an id; it is never fed back into prompt selection.

**Price authority (extends §6):** in this module the AI cannot state a price it did not receive from a tool this conversation — it names product ids, and the server prices them from `SalePrice ?? Price`. Any change here must preserve that.

**Transport — two response shapes on the same endpoint.** `POST /chatbot/{apiKey}/message` returns NDJSON when the caller sends `Accept: application/x-ndjson`, and the original single JSON object otherwise:

```
{"type":"thinking","text":"Searching for gold earrings under INR 5,000…"}
{"type":"final","payload":{ …the exact legacy response object… }}
```

The legacy shape is **not** optional politeness: `chatbot-widget.js` is loaded directly by third-party sites with no bundler hash, so older copies stay cached in the wild indefinitely and must keep working after this deploys. The non-streaming payload also carries a `thinking` string array, which the admin test panel renders after the fact.

Thinking one-liners are generated **server-side from the tool call itself** (`ChatbotAgentTools.Describe`) — not asked of the model. They therefore cost no tokens, add no latency, and cannot be skipped when the model is under instruction pressure.

**`IAgentAiProvider`** (`Application/Common/Interfaces/IAgentAiProvider.cs`) is the tool-calling contract, deliberately separate from `IAiProvider.HandleConversationAsync` (the single-shot JSON-envelope contract the tenant RAG pipeline still uses). `OpenAiProvider` and `MockAiProvider` each implement both and are registered against both interfaces. `MockAiProvider.RunAgentStepAsync` deterministically calls `search_catalog` once then answers, so the tool plumbing, thinking events and carousel are exercised end-to-end without an API key.

**Phasing — what is NOT yet on the agent.** Phase 1 covered the web widget and the admin test panel only. `ChatbotClientWebhookHelper` (WhatsApp / Messenger / Instagram) still uses `ChatbotPromptBuilder` + `ChatbotCatalogSelector.BuildPromptSet` + `ChatbotCardPolicy` and therefore **still has the stale-shortlist behaviour described above** — those three classes are live and must not be deleted. Phase 2 moves the channels onto `ChatbotAgent` with `CanPlaceOrders: false`; phase 3 migrates the tenant storefront chatbot (§4.7).

**The widget can mutate the cart directly** via `POST /chatbot/{apiKey}/cart`, bypassing the AI entirely — a button press is unambiguous, so spending a token round-trip to interpret it would be slower and less reliable. Same resolver, same pricing rules.

**Known gap:** the WhatsApp / Messenger / Instagram path replies only — there is no order-placement step. `ChatbotPromptInput.CanPlaceOrders` is therefore `false` for those channels, so the prompt hands off to the team rather than telling the buyer their order is confirmed. Adding real order creation there is open follow-up work.

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

A dependency-free vanilla-JS widget that external site owners embed via `<script>` + `window.RCChatbotConfig = { apiKey, apiBase, ... }`. Talks directly to `GET/POST /api/v1/chatbot/{apiKey}/...` (config, message, cart, products, order verify-payment), identified purely by API key — no relation to the dashboard's JWT auth. Supports product carousels, a cart, Razorpay checkout, and COD — essentially a framework-free clone of the in-app public storefront's chat/checkout experience for use on third-party (non-Silarai-hosted) sites.

**Everything renders inside a Shadow DOM.** The widget mounts one host `<div>` on `document.body` and attaches an open shadow root; all markup and CSS live inside it. The host page's styles cannot reach in and the widget's cannot leak out, which removes the `!important` arms race with arbitrary embedder CSS. Consequences to remember when editing:

- Use `root.getElementById` / `root.querySelector` — `document.getElementById` finds nothing inside the shadow tree.
- The host is a full-viewport `position:fixed` overlay with `pointer-events:none`; only the launcher, teaser and panel re-enable pointer events. Do not give the host a `transform`, or `position:fixed` descendants will start resolving against it.
- Brand colours are CSS custom properties set on the host from config (`--rc-primary` plus precomputed `--rc-primary-a08/15/40/55`). Alpha variants are computed in JS rather than with `color-mix()`, which older Android WebViews do not support. There is **no external font request** — an embedded widget should not add a render-blocking third-party fetch to someone else's page.

**Layout.** Single-row header (avatar, name, cart button with count, close). The **cart is a bottom sheet** over the message area, so it no longer competes with the composer. The **product detail is a full in-panel overlay** (`.detail`, `inset:0` inside the panel, sticky Back bar) — a hero image plus a variant grid needs the whole panel, and this matches the long-standing behaviour. Optional focused-product strip sits below the header. Composer is an auto-growing `<textarea>` (Enter sends, Shift+Enter newlines). Consecutive same-sender messages are grouped under one avatar.

**Two layout traps this file has already fallen into — do not re-introduce:**

1. `.msgs` is a column flex container, so every child needs `flex:0 0 auto` (there is a `.msgs > *` rule). Scroll containers are the dangerous case: their automatic minimum size is `0`, not `min-content`, so the product rail collapses to nothing but its scrollbar without it.
2. The carousel's drag-to-scroll must **not** call `setPointerCapture` on `pointerdown`. While a pointer is captured the browser retargets the following `click` to the capturing element, which silently kills every button inside a card. Capture is taken only after the drag threshold is crossed.

**Testing.** `frontend/test/chatbot-widget.test.mjs` renders the widget in jsdom against a mocked API and asserts shadow-root isolation, NDJSON streaming, the thinking line, card values, cart flow and Escape handling — plus the non-streaming fallback. Run with `npm install --no-save jsdom && node test/chatbot-widget.test.mjs`. This file is the only automated coverage the widget has: it is plain vanilla JS in `public/`, so it is outside the Vite build and never type-checked.

The cart is a **read-only mirror of the server cart** (§4.8): every mutation round-trips to `POST /chatbot/{apiKey}/cart` and the widget re-renders whatever comes back, so it can never disagree with what the AI sees or what gets ordered. `sessionId` lives in `localStorage["rc_s_" + apiKey]` and is re-synced from the server response if the server assigned one.

**A product with variants (size/color/etc.) can never be added or ordered in one tap.** All three direct-write entry points — the carousel card's Add button, the detail sheet's Add to cart button, and the detail sheet's Order now button — require a variant to be chosen first when `product.variants` is non-empty; the card's Add button opens the detail sheet (`showDetail`) instead of adding, and both detail-sheet buttons stay `disabled` (plus a `.vrow.shake` cue if clicked anyway) until one is picked.

**Order now writes the cart directly — it does NOT ask the model to.** It used to send a plain chat message ("I want to order X") and rely on the AI to read that and call `update_cart` itself. Gating the button on a chosen variant closed the ambiguous-input case, but not the underlying reliability problem: nothing forced the model to actually call the tool, and it would sometimes just narrate success instead — "I've added X to your cart, proceed to checkout?" — while the real server cart stayed empty. A prompt rule against this ("never claim a cart change that isn't reflected below") reduced it but did not reliably stop it; an instruction is not an enforcement mechanism. The actual fix: `orderBtn.onclick` now calls `addToCart(p, chosen)` — the exact same call the Add button makes — and only once that resolves does it hand off to chat, with a generic `'I\'d like to checkout'` (matching the cart bar's own Checkout button) instead of a product-named message. By the time the AI turn starts, CURRENT CART in the prompt already reflects the real line; there is nothing left for the model to get wrong, because it is no longer the thing performing the write. This is the same principle the codebase already applies elsewhere (§4.8: "a button press is unambiguous, so spending a token round-trip to interpret it would be slower and less reliable") — Order now had just never been migrated onto it.

**`update_cart` also enforces the variant rule server-side, for the paths that DO still go through the model.** `ChatbotAgentTools.ExecuteCartUpdate` holds back any `add`/`set` op for a catalogue item with a non-empty `Variants` when the op's `variant` is blank — never passed to `ChatbotCartResolver.Apply` — and returns a message telling the model which product(s) still need a choice, using the same "AI proposes, server disposes" pattern as price authority (§6). This matters for free-typed chat ("add the gold one") where there is no button to make the write deterministic; it does not matter for Order now/Add to cart anymore, since those no longer ask the model to write the cart at all. `ChatbotAgentPromptBuilder` still carries the matching prompt rules (ask before calling update_cart/place_order on a variant product; never narrate an unreflected cart change) as a second layer for that same free-typed path — treat both as mitigating, not eliminating, model non-compliance; the lesson from this bug is that a deterministic write beats an instruction whenever the trigger is unambiguous. `ChatbotCartResolver` itself is unchanged and still shared with the WhatsApp/Messenger/Instagram single-shot path, so a future Phase 2 migration (§4.8 Phasing) inherits the resolver-level guard for free once it's on the agent — but that path has no buttons, so it stays dependent on the model actually calling the tool; worth a harder look before Phase 2 ships.

**Deploying a change to this file requires cache-busting the embed URL on third-party sites** — they load it directly and there is no bundler hash. Keep the API backward-compatible (an older widget must tolerate the `cart` key being present or absent).

### 5.8 Cloudflare Worker (`cloudflare-worker/storefront-proxy.js`)

Sits in front of both the canonical domain and merchant custom domains. Three responsibilities: (1) serves per-tenant `sitemap.xml`/`robots.txt`/`manifest.json`/`favicon.svg` directly from the backend, bypassing the SPA; (2) detects social/search crawlers and returns a minimal server-rendered HTML page with Open Graph/Twitter Card tags (since the React SPA can't be crawled for link previews); (3) passes everything else through to the Azure Static Web App origin with edge caching explicitly disabled, so custom-domain visitors never get a stale JS bundle.

## 6. Business logic highlights worth knowing before changing things

- **Multi-tenancy is enforced by three cooperating mechanisms** (DB query filter + request middleware + plan filter) — changing tenant-scoping logic requires touching all three consistently; see §4.2.
- **Order pricing must always be recomputed server-side from the live catalog**, never trusted from AI-provided or client-provided prices — this was fixed as a bug (see git history: "server is the price authority") and any change to order/checkout flows must preserve it. In the Chatbot-as-a-Service module this is stronger still: the AI cannot state a price at all, only product ids (§4.8).
- **Two independent chatbot pipelines exist.** The tenant chatbot (§4.7: `RagContextBuilder` → `ConversationSession` → `IConversationMemoryService`, in-process) and the Chatbot-as-a-Service module (§4.8: `ChatbotPromptBuilder` → `IChatSessionStore`, Redis-backed). They share only `IAiProvider`. Changing one does not change the other, and merging them is not a small refactor.
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
