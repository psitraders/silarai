---
id: b2b-wholesale
status: current
context: "§4.3 Storefront (B2C/B2B)"
---
# B2B / Wholesale

## Purpose
Let tenants sell wholesale alongside retail: quantity-based pricing and quote requests from business buyers.

## Scope
- **In:** `ProductWholesaleTier`, `QuoteRequest`, B2B fields on `StorefrontCustomer` (company, GST, loyalty points), product min/max order quantity, B2B toggle.
- **Out:** retail catalog (`catalog`), storefront shell (`storefront`).

## Rules
- **B2B-R1** — B2B features are gated per tenant by `StorefrontSettings.B2BEnabled`.
- **B2B-R2** — Wholesale prices come from quantity-break tiers on the server (INV-2).

## UI
- `pages/b2b/B2BDashboardPage.tsx` (quote inbox).
- `components/catalog/WholesaleTiersEditor.tsx`, `components/storefront/QuoteRequestModal.tsx`.

## Suggestions

## Changes to be done
