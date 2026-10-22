---
id: catalog-reviews
status: current
prefix: CAT
related: [catalog-products, storefront-builder-commerce]
---
# Catalog — Product Reviews

## Purpose
Shoppers rate and review products on the storefront; the merchant moderates them before they appear.

## Scope
- **In:** `ProductReview`, public submit and read, review summary for builder sections, moderation (approve / reject / delete).
- **Out:** how reviews render (`storefront-builder-commerce` — product page reviews block, `reviews-summary` section).

## Functional behaviour
- Shoppers submit name, optional email / phone, rating 1–5 and comment. If a phone is given it must match an earlier order containing the product ("only buyers can review"); without a phone the review is accepted. New reviews start **unapproved**.
- Only approved reviews are public (list per product with average + count; store-wide summary with distribution and latest comments).
- **Reviews** page (`/catalog/reviews`): all reviews with product, rating, status; approve, reject (unapprove), delete.

## Rules
- **CAT-R11** — Reviews are visible publicly only after the merchant approves them; public responses never include reviewer email or phone.
- **CAT-R12** — Templates and sections never invent reviews (SB-R18); they show real approved reviews only.

## Backend
- **Data:** `Catalog/ProductReview` (`ProductId`, `ReviewerName`, `ReviewerEmail`, `Rating`, `Comment`, `IsApproved`).
- **API — `ReviewsController` `/api/v1/reviews` 🔒:** `GET ?productId&approved`, `PUT {id}/approve`, `PUT {id}/reject`, `DELETE {id}` (soft).
- **Public (`PublicStorefrontController`):** `GET /public/{slug}/products/{productId}/reviews` → `{items, averageRating, totalCount}`; `POST /public/{slug}/products/{productId}/reviews {reviewerName, reviewerEmail?, reviewerPhone?, rating, comment}`; `GET /public/{slug}/reviews/summary?limit&minRating` (approved reviews on Active / OutOfStock products: average, total, 5→1 distribution, latest with comments).

## Frontend
- **Routes & screens:** `pages/catalog/ReviewsPage.tsx`.
- **Code:** `api/reviews.api.ts`; storefront: `storefront-builder/core/commerce/api.ts` + `useProductReviews` / `useSubmitReview`, `useReviewsSummary`.

## Known issues
Open items in [known-issues](known-issues.md): KI-040.

## Suggestions

## Changes to be done
