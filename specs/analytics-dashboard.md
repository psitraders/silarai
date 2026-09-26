---
id: analytics-dashboard
status: current
context: "§4.4, §5.4"
---
# Dashboard, Analytics & Search

## Purpose
Give merchants an overview of their business and quick navigation across it.

## Scope
- **In:** dashboard, analytics (incl. GA4 service-account integration), activity feed, global topbar search, notifications.
- **Out:** chatbot usage metrics (`chatbot-service`).

## Rules
- **ANA-R1** — Activity and search stay available on the `basic` plan (TEN-R5).
- **ANA-R2** — All data is tenant-scoped (INV-1).

## UI
- `pages/dashboard/DashboardPage.tsx`, `pages/analytics/AnalyticsPage.tsx`.
- `components/layout/Topbar.tsx` — search, notifications.

## Suggestions

## Changes to be done
