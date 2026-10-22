---
id: catalog-coupons
status: current
prefix: CAT
related: [orders-checkout, storefront-builder-commerce]
---
# Catalog — Coupons

## Purpose
Discount codes the merchant can share or show on the storefront: percentage, flat amount or buy-X-get-Y.

## Scope
- **In:** `Coupon` CRUD, validity window, minimum order, usage limit, *show on storefront*, public coupon validation and the public coupon list.
- **Out:** the cart / checkout UI that applies a code (`orders-checkout`), the coupon-strip section (`storefront-builder-commerce`).

## Functional behaviour
- **Coupons** page (`/catalog/coupons`): list with type badge and usage, create / edit modal (code, type, value, min order amount, max uses, valid from / to, active, show on storefront, buy / get quantities), delete.
- Codes are stored upper-case and unique per tenant.
- **Checkout:** the cart calls *validate-coupon* with the cart total and shows the returned discount; BuyXGetY returns discount 0 (meant to be handled client-side).
- **Coupon strip:** builder sections with `source: store` list coupons marked *Show on storefront*.

## Rules
- **CAT-R2** — Coupon types: Percentage, Flat, BuyXGetY.
- **CAT-R6** — Coupons are private by default; only coupons marked *Show on storefront* that are active, within their dates and not used up are listed publicly (storefront coupon strip, max 12).
- **CAT-R10** — Validation order: exists + active → `ValidFrom` → `ValidTo` → `MaxUses` vs `UsedCount` → `MinOrderAmount`; Percentage = total × value / 100 (2 dp), Flat = min(value, total).

## Backend
- **Data:** `Catalog/Coupon` (`Code`, `Type` [Percentage | Flat | BuyXGetY], `Value`, `MinOrderAmount`, `MaxUses`, `UsedCount`, `ValidFrom`, `ValidTo`, `IsActive`, `ShowOnStorefront` [migration `20261016120000_AddCouponShowOnStorefront`], `BuyQuantity`, `GetQuantity`).
- **API — `CouponsController` `/api/v1/coupons` 🔒:** `GET`, `POST` (400 on duplicate code), `PUT {id}`, `DELETE {id}` (soft).
- **Public (`PublicStorefrontController`):** `POST /public/{slug}/validate-coupon {code, orderTotal}` → `{code, type, value, discount, buyQuantity, getQuantity, message}` or 400 with the reason; `GET /public/{slug}/coupons` (CAT-R6).

## Frontend
- **Routes & screens:** `pages/catalog/CouponsPage.tsx`.
- **Code:** `api/coupons.api.ts`; validation call in `components/storefront/CartDrawer.tsx`; builder `coupon-strip` section reads `GET coupons`.

## Known issues
Open items in [known-issues](known-issues.md): KI-011, KI-018.

## Suggestions
- Re-validate the code server-side at order creation, store `DiscountAmount`, subtract it from the total and increment `UsedCount` in the same save.

## Changes to be done
