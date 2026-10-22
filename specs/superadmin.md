---
id: superadmin
status: current
prefix: ADM
related: [superadmin-landing, tenancy-plans, chatbot-service, auth-identity]
---
# SuperAdmin Backoffice — Tenants & Platform Settings

## Purpose
Platform-level administration for the Silarai team: see and manage every tenant, activate plan requests, suspend or delete stores, and edit platform key-value settings.

## Scope
- **In:** tenant list / detail, plan changes and upgrade approvals, suspend / reactivate, permanent tenant delete, `PlatformSetting` editor, SuperAdmin accounts, the *Admin* sidebar group.
- **Out:** in-app landing content and platform leads (`superadmin-landing`), chatbot clients and token usage for all tenants (`chatbot-service`), plan model and gating (`tenancy-plans`).

## Functional behaviour
- **Tenants** (`/admin/tenants`): paged list with search — name, slug, contact, active flag, current plan / status / days remaining, product / lead / order counts; pending-upgrade badge; suspend / reactivate.
- **Tenant detail** (`/admin/tenants/:id`): users (name, email, active, last login), subscription history, *Change plan* (plan, status, end date — cancels the current subscriptions and creates the new one), approve / reject a pending plan request, suspend / reactivate, **Delete tenant** (irreversible: removes all of the tenant's rows with raw SQL in FK-safe order).
- **Platform settings** (`/admin/platform-settings`): key-value list, edit / add by key (e.g. `TwoFactor:ApiKey`).
- A suspended tenant (`Tenant.IsActive = false`) can't log in and its public store slug no longer resolves.
- **SuperAdmin accounts:** 6 accounts on the `Silarai System` tenant (`admin@silarai.app`, `admin_one..admin_five@silarai.com`), created only by `DataSeeder.SeedAdminAsync` / `SeedExtraSuperAdminsAsync` on fresh DBs or `backend/scripts/add_superadmins.sql` — no UI / API. SuperAdmins are never plan-gated.

## Rules
- **ADM-R1** — Management endpoints are SuperAdmin-only; the public exceptions are reading landing content and submitting platform leads (and `POST /chatbot/onboard`, `superadmin-landing`).
- **ADM-R2** — Admin/config entities are platform-level (not tenant-scoped); cross-tenant reads use `.IgnoreQueryFilters()` (INV-1).
- **ADM-R4** — Tenant delete is a permanent hard delete of the tenant and its rows (INV-9 exception); there is no undo.

## Backend
- **Data:** `Admin/TenantNote`, `Admin/SystemAnnouncement` (no API / UI; only cleaned up on tenant delete), `Config/PlatformSetting` (`Key`, `Value`).
- **API — `AdminTenantsController` `/api/v1/admin/tenants` (`[Authorize(Roles = "SuperAdmin")]`):** `GET ?page&pageSize&search`, `GET {id}`, `PUT {id}/subscription {planId, status, endDate?, isAnnual, note?}`, `GET pending-upgrades`, `DELETE {id}`, `PUT {id}/toggle-status`. **`AdminPlatformSettingsController` `/api/v1/admin/platform-settings` (SuperAdmin):** `GET`, `PUT {key} {value}`. Upgrade approval / rejection: `POST /subscription/admin/approve|reject/{subscriptionId}` (`tenancy-plans`).
- **Logic:** controllers query `AppDbContext` directly with `.IgnoreQueryFilters()`; `Application/Admin/Queries/GetTenantsQuery` (unused by the controller).

## Frontend
- **Routes & screens:** `pages/admin/AdminTenantsPage.tsx`, `AdminTenantDetailPage.tsx`, `AdminPlatformSettingsPage.tsx`; sidebar *Admin* group for `SuperAdmin` (`app-shell`).

## Known issues
Open items in [known-issues](known-issues.md): KI-006, KI-008, KI-019, KI-024, KI-025.

## Suggestions

## Changes to be done
