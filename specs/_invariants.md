---
id: invariants
status: current
prefix: INV
related: []
---
# Cross-feature invariants

Rules that span several features. Feature specs reference these by ID instead of repeating them. Architecture background: `../context.md` §4.2 (multi-tenancy), §4.5 (pipeline), §4.5.1 (secrets), §4.6 (migrations), §6.

- **INV-1 — Tenant isolation is three layers, always together:** EF global query filter on every `TenantEntity` (`!IsDeleted && TenantId == current`), `TenantResolutionMiddleware` populating `ITenantContext`, and `BasicPlanAccessFilter` plan gating (TEN-R5). Cross-tenant queries must call `.IgnoreQueryFilters()` explicitly. `User` and `ChatbotClient` are `BaseEntity` (no tenant filter) — scope them by `TenantId` by hand.
- **INV-2 — The server is the price authority:** totals of customer- and AI-originated orders are always recomputed from the live catalog (`DiscountedPrice ?? BasePrice` + variant `PriceAdjustment`, or the B2B tier price), never taken from the client or the AI. *Known violations (2026-10-21): the storefront Razorpay checkout and staff-entered orders — KI-009, KI-012 in [known-issues](known-issues.md).*
- **INV-3 — Two independent chatbot pipelines:** tenant chatbot (`ai-tenant-chatbot`, `ai-tenant-chatbot-storefront`) and Chatbot-as-a-Service (`chatbot-service*`). They share only the AI provider (`IAiProvider` / `IAgentAiProvider`); changing one does not change the other.
- **INV-4 — Two customer identities per tenant:** CRM `Customer` (staff-managed) and `StorefrontCustomer` (self-service login), optionally linked via `LinkedCrmCustomerId`. Never conflate them.
- **INV-5 — Two frontend auth systems:** merchant dashboard (Zustand `auth.store`, JWT + refresh) and storefront customer (`StorefrontAuthContext`, `localStorage` key `sf_customer_{slug}`). They never share state.
- **INV-6 — No secrets in `appsettings.json`:** secrets come from `appsettings.Development.json` (gitignored) or App Service settings.
- **INV-7 — Migrations and seeding are manual:** nothing runs on startup. Add migrations with `dotnet ef migrations add`; hand-written SQL only when the model can't express the change.
- **INV-8 — Plan limits come from the DB:** `SubscriptionPlan` rows and `BasicPlanAccessFilter` are authoritative; `Shared.Constants.PlanLimits` is stale.
- **INV-9 — Soft delete:** `TenantEntity` rows are deleted by setting `IsDeleted` (+ `DeletedAt`); the global filter hides them. Hard deletes are the exception and are called out in the owning spec (wholesale tiers, storefront versions, SuperAdmin tenant delete).
- **INV-10 — One error shape:** handlers throw domain exceptions and `GlobalExceptionMiddleware` maps them — `ValidationException` / `InsufficientStockException` → 422, `NotFoundException` → 404, `ForbiddenException` → 403, `PlanLimitException` → 402, anything else → 500. Validation is hand-written in handlers (no FluentValidation validators).
- **INV-11 — Anonymous endpoints resolve scope themselves:** public storefront routes by slug (`/public/{slug}` → `StorefrontSettings.Slug`), custom domains by hostname, chatbot widget by API key, Meta webhooks by the inbound channel id. Authenticated routes take the tenant only from the JWT `tid` claim.
- **INV-12 — Notifications never fail the request:** owner/customer emails and other side notifications are fire-and-forget (try/catch or `Task.Run`); a mail failure is logged, never returned to the buyer.
