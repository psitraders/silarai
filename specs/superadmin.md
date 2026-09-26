---
id: superadmin
status: current
context: "§4.3 Admin/Config, §4.4 SuperAdmin"
---
# SuperAdmin Backoffice

## Purpose
Platform-level administration: tenants, platform settings, in-app landing content and marketing leads.

## Scope
- **In:** tenant management (`TenantNote`, `SystemAnnouncement`), `PlatformSetting`, `LandingPageConfig`, `PlatformLead` (with UTM), the dashboard's in-app landing/about/blog/contact pages, legal pages.
- **Out:** chatbot client admin (`chatbot-service`), the separate marketing site `landing_website/` (not covered by specs).

## Rules
- **ADM-R1** — Management endpoints are SuperAdmin-only; the public exceptions are reading landing content and submitting platform leads.
- **ADM-R2** — Admin/config entities are platform-level (not tenant-scoped); cross-tenant reads use `.IgnoreQueryFilters()` (INV-1).
- **ADM-R3** — `LandingPageConfig` drives the in-app landing page (`pages/landing/`), not `silarai.com`.

## UI
- `pages/admin/` — AdminTenants, AdminTenantDetail, AdminPlatformSettings, AdminLanding, PlatformLeads.
- `pages/landing/`, `pages/legal/`, `components/landing/LeadChatWidget.tsx`.

## Suggestions

## Changes to be done
