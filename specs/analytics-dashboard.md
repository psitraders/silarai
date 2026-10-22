---
id: analytics-dashboard
status: current
prefix: ANA
related: [app-shell, crm-leads, orders-management, business-profile, storefront]
---
# Dashboard, Analytics & Search

## Purpose
Give merchants an overview of their business — KPIs, pipeline, activity, readiness — plus analytics (incl. Google Analytics 4 for the storefront), the notification feed and global search.

## Scope
- **In:** dashboard home, KPI query, analytics page, GA4 report, activity feed (notifications), follow-up reminders, global top-bar search.
- **Out:** the top bar / notification UI itself (`app-shell`), onboarding wizard (`business-profile`), chatbot token usage (`chatbot-service`).

## Functional behaviour
- **Dashboard** (`/dashboard`): onboarding wizard / reminder banner (`business-profile`); KPI cards for the last 7 days vs the previous 7 — *New inquiries*, *Pending follow-ups* (follow-up due within 3 days), *Orders this week*, *Conversion rate* (leads → OrderConfirmed) — with change %; *Recent inquiries*; *Live activity*; *Order pipeline* (New / Confirmed / PaymentPending / Paid / Delivered); *Quick actions*; *Top products* (by order count); *Customer loyalty* (repeat-customer rate, total / repeat customers); low-stock list; *Store readiness* checklist; sales chart.
- **Analytics** (`/analytics`): the same KPI set for 30 days with sales trend, pipeline and top products, and a banner to the GA4 report.
- **GA4 report (API):** for the store's GA4 property — sessions, active users, page views, bounce rate, average session duration; top pages, devices, traffic channels and a daily sessions trend for a date range (`7daysAgo`…`today` by default). Merchants grant the platform's Google account (`GoogleAnalytics:PlatformEmail`) Viewer access; the API reports `configured: false` with instructions when the property id or platform credentials are missing.
- **Notifications:** the activity feed (orders, leads, new customers of the last 30 days, newest first, default 15–20 items) polled by the bell every 60 s.
- **Follow-up reminders:** up to 10 open leads (NewInquiry / PriceShared / Interested / FollowUpPending) untouched for ≥ 2 days, oldest first (Marketing hub).
- **Search:** top-bar search across products, customers, orders and leads (5 each).
- **Revenue** counts orders with status *Paid* or *Delivered*.

## Rules
- **ANA-R1** — Activity and search stay available on the `basic` plan (TEN-R5).
- **ANA-R2** — All data is tenant-scoped (INV-1).
- **ANA-R3** — KPI results are cached per tenant and period for 5 minutes (`dashboard_kpis_{tenantId}_{days}`).

## Backend
- **API:** `AnalyticsController` `/api/v1/analytics` 🔒 — `GET kpis?periodDays=7`, `GET ga4?startDate&endDate` (uses `StorefrontSettings.GA4PropertyId`); `ActivityController` `/api/v1/activity` 🔒 — `GET feed?count`, `GET reminders`; `SearchController` `GET /api/v1/search?q=` 🔒.
- **Logic:** `Application/Analytics/Queries/GetDashboardKpisQuery` (`DashboardKpiDto`: counts + changes, revenue, top products, recent leads, pipeline, sales chart, low stock, repeat-customer stats), `GetActivityFeedQuery`, `GetFollowUpRemindersQuery`; `Api/Services/GA4AnalyticsService` (GA4 Data API `runReport` with a platform OAuth refresh token — `GoogleAnalytics:PlatformRefreshToken`, `ClientId`, `ClientSecret`, `PlatformEmail`).

## Frontend
- **Routes & screens:** `pages/dashboard/DashboardPage.tsx`, `pages/analytics/AnalyticsPage.tsx`; search and bell in `components/layout/Topbar.tsx`.
- **Code:** `api/analytics.api.ts` (`getKpis`), `api/notifications.api.ts` (`getFeed`), `api/search.api.ts`, `api/marketing.api.ts` (`getReminders`); charts with Recharts.

## Known issues
Open items in [known-issues](known-issues.md): KI-031, KI-032.

## Suggestions
- Add the GA4 report page and the GA4 id fields to *Storefront settings*.

## Changes to be done
