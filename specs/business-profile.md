---
id: business-profile
status: current
prefix: BIZ
related: [business-integrations, storefront, catalog-products, analytics-dashboard]
---
# Business Profile & Onboarding

## Purpose
The merchant's store identity (name, category, contact, locale) and the first-run onboarding wizard that gets a new store live, plus the store QR-code tool.

## Scope
- **In:** `Business` profile fields, `SocialLink`, store image uploads (`POST /business/upload`), onboarding wizard + setup score, QR generator.
- **Out:** channel / payment credentials and AI auto-reply toggles (`business-integrations`, `ai-tenant-chatbot`), storefront look and SEO (`storefront`, `storefront-builder`).

## Functional behaviour
- **Business profile** (`/settings`): *Store Info* (name, category, description, currency, country, language, delivery info, welcome text; `BusinessHours` exists in the model but has no field) and *Social & Contact* (WhatsApp number, Instagram handle, Facebook page URL). Currency drives price formatting everywhere; language sets the dashboard language (`app-shell`).
- **Onboarding wizard** (modal on `/dashboard`): shown while `Business.IsOnboardingComplete` is false unless dismissed in this browser (`localStorage onboarding_dismissed_{tenantId}`). Steps *Business* → *Storefront* (slug, colours) → *Product* (first product + image) → *Go Live*; a setup score (% of steps) and per-step "unlocks" are shown. A reminder banner stays on the dashboard after dismissal.
- **Uploads:** logo, banner, favicon and storefront-builder section images (JPEG/PNG/WebP/GIF/ICO/SVG, ≤ 5 MB).
- **QR generator** (`/tools/qr-code`): QR for the store URL (or a custom URL) to download and print.

## Rules
- BIZ-R1 (per-tenant credentials on `Business`) → `business-integrations`.
- **BIZ-R2** — `business` routes stay reachable on the `basic` plan (TEN-R5) because the app shell reads them.
- **BIZ-R3** — One `Business` and one `StorefrontSettings` row per tenant, created at registration (`auth-identity`).

## Backend
- **Data:** `Business/Business` (`TenantEntity`: `Name`, `Category`, `Description`, `LogoUrl`, `BannerUrl`, `WhatsAppNumber`, `InstagramHandle`, `FacebookPageUrl`, `DeliveryInfo`, `Currency` [INR], `Country` [India], `Language` [en], `BusinessHours`, `WelcomeText`, `IsOnboardingComplete`, plus integration and AI fields owned by other specs), `SocialLink` (`Platform`, `Url`, `IsActive`).
- **API — `BusinessController` `/api/v1/business` 🔒:** `GET` / `PUT` (profile), `GET` / `PUT storefront` (`storefront`), `POST upload?type=logo|banner|favicon|section` (multipart `file`; saved to `wwwroot/uploads/store/{tenantId}/` as `{type}.{ext}` or `section-{guid}.{ext}`; returns an absolute URL), `GET` / `PUT ai-settings`, `GET conversations`, `GET auto-campaigns`, `GET catalog/import-preview`, `POST catalog/import` (other specs).
- **Logic:** `Application/Business/Commands/UpdateBusinessCommand`, `Queries/GetBusinessQuery`.

## Frontend
- **Routes & screens:** `pages/settings/BusinessProfilePage.tsx` (`/settings`), `components/onboarding/OnboardingWizard.tsx` (opened from `pages/dashboard/DashboardPage.tsx`), `pages/tools/QrGeneratorPage.tsx` (`/tools/qr-code`).
- **Code:** `api/business.api.ts` (`getBusiness`, `updateBusiness`, `uploadStoreImage`); the wizard also calls `updateStorefrontSettings`, `catalogApi.createProduct` / `uploadImage`, `marketingApi.getCampaigns`, `analyticsApi.getKpis`.

## Known issues
Open items in [known-issues](known-issues.md): KI-035.

## Suggestions
- Route store uploads through `IStorageProvider` like product images.

## Changes to be done
