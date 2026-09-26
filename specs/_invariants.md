---
id: invariants
status: current
context: "§4.2, §4.5.1, §4.6, §6"
---
# Cross-feature invariants

Rules that span several features. Feature specs reference these by ID instead of repeating them.

- **INV-1 — Tenant isolation is three layers, always together:** EF global query filter on every `TenantEntity`, `TenantResolutionMiddleware` populating `ITenantContext`, and `BasicPlanAccessFilter` plan gating. Cross-tenant queries must call `.IgnoreQueryFilters()` explicitly.
- **INV-2 — The server is the price authority:** order totals are always recomputed from the live catalog (`SalePrice ?? Price`), never taken from the client or the AI.
- **INV-3 — Two independent chatbot pipelines:** tenant chatbot (`ai-tenant-chatbot`) and Chatbot-as-a-Service (`chatbot-service`). They share only the AI provider; changing one does not change the other.
- **INV-4 — Two customer identities per tenant:** CRM `Customer` (staff-managed) and `StorefrontCustomer` (self-service login), optionally linked via `LinkedCrmCustomerId`. Never conflate them.
- **INV-5 — Two frontend auth systems:** merchant dashboard (Zustand `auth.store`, JWT) and storefront customer (`StorefrontAuthContext`). They never share state.
- **INV-6 — No secrets in `appsettings.json`:** secrets come from `appsettings.Development.json` (gitignored) or App Service settings.
- **INV-7 — Migrations and seeding are manual:** nothing runs on startup. Add migrations with `dotnet ef migrations add`; hand-written SQL only when the model can't express the change.
- **INV-8 — Plan limits come from the DB:** `SubscriptionPlan` rows and `BasicPlanAccessFilter` are authoritative; `Shared.Constants.PlanLimits` is stale.
