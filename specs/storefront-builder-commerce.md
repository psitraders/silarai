---
id: storefront-builder-commerce
status: current
prefix: SB
related: [storefront-builder, storefront-builder-editor, orders-checkout, catalog-products, b2b-wholesale, catalog-reviews]
---
# Storefront Builder — Product, Collection & Cart Designs

## Purpose
How shoppers browse and buy inside a builder storefront: product cards, the catalogue / category page, the product page and product popup (15 layouts each, shared blocks), extra product designs assigned to categories or products, the cart placement, product compare and food marks.

## Scope
- **In:** `product-main` section + product blocks, `quickview` popup pack, `cards/card`, `all-products` collection layouts, `cart/cart` placements, *Style → Store behaviour* (product view, popup layout, card style, cart style + options, compare, floating buttons), extra product designs (`AltProductTemplate`) + assignment, `core/commerce/` controllers, compare tray, recently viewed, related products.
- **Out:** checkout endpoints and payment (`orders-checkout`), wholesale tier rules (`b2b-wholesale`), review moderation (`catalog-reviews`), generic sections (`storefront-builder`).

## Functional behaviour
- **Product view mode** (store setting): *popup* (cards open a popup over the page; the URL changes to `/products/:id`; a direct deep link opens the popup over Home), *page* (cards navigate to `/products/:id`, rendered with the Product page design), *popup + page* (popup with *View full details*).
- **Product page** = system page *Product page* holding `product-main` (gallery + product blocks in 15 layouts: classic, thumb rail, stacked + sticky, grid + sticky, hero slider, mirrored, centred minimal, split screen, bento gallery, editorial story, tabbed, accordion, spec sheet, menu item, shop the look; breadcrumbs, sticky add-to-cart bar) plus any sections (e.g. `related-products` same category, `recently-viewed`). Its blocks also fill the **popup** (15 popup layouts: classic split, wide gallery, thumbnail rail, stacked carousel, side drawer, bottom sheet, compact quick-add, immersive, editorial, grid gallery, tabbed, video first, menu item, spec card, story).
- **Product blocks (22 types):** `title`, `price` (compare-at, tax note), `rating`, `badges`, `description` (short / full), `variants` (buttons / chips / dropdown / colour swatches, first value pre-selected), `quantity`, `buy-buttons` (add to cart / buy now / WhatsApp, inline checkout), `inquiry`, `quote` (B2B), `wholesale` (tier table), `stock`, `delivery`, `trust`, `accordion` (collapsible rows), `size-guide` (popup), `share`, `reviews` (+ form), `text`, `image`, `countdown`, `specs` (parsed from "Label: value" description lines); shown plain, in tabs or as an accordion (long-form blocks move into tabs / rows). Gallery: slider, thumbs-left, stacked, grid, bento, carousel, single, fill, round, 2×2; swipe, arrows, full-screen viewer; video URLs play.
- **Extra product designs:** *Pages → Other product designs* — create (copy of the Product page), edit like the Product page, assign categories (incl. sub-categories) and / or products (≤ 200 each), duplicate, delete. A product uses its own design, else its category's (inherited by sub-categories without their own), else the Product page; the popup uses the same design.
- **Cards (10 styles):** standard, minimal, overlay, bordered, elevated, list-row (+/− stepper), editorial, compact, rounded-centre, tech; per-section override; products with variants show *Choose options* and open the product; optional *Compare* toggle and veg / non-veg / eggless marks (product tags).
- **Collection** (`all-products`, 8 layouts: top filters, sidebar filters [drawer on phones], list, masonry, editorial 2-col, category rows, banner + grid, bento): URL category, `?q=` search, sort / default sort, in-stock filter, price filter (min / max, bounds from the API; top filters, sidebar, bento), pages / load more / infinite, columns desktop / phone.
- **Cart (5 placements of `CartDrawer`):** drawer right / left, page, popup, bottom sheet; options: free-delivery progress bar, upsell row, coupon field; auto-open or an *Added* toast.
- **Compare:** up to 4 products (kept per store in `sessionStorage compare_{slug}`), tray above the mobile bar, dialog table with live price, availability, category and spec rows.
- **Buy now:** single-product checkout from the product view (Razorpay or COD + OTP, B2B price, GA4 `purchase`, redirect to confirmation — `orders-checkout`). Inquiry sends the cart as an abandoned cart.

## Rules
- **SB-R12** — Product view mode (popup / page / both) is a store setting; `/{slug}/products/{id}` always resolves (as a page or a popup over the store).
- **SB-R21** — A store can have extra product designs besides the Product page. Each is assigned to categories and/or products; a product uses its own pick, else its category's (a category's pick also covers its sub-categories unless they have their own), else the Product page. A category or product belongs to at most one design — assigning it moves it. Assignments apply immediately; a design only reaches shoppers once published. The product popup uses the same design as the page.
- **SB-R25** — Product prices on cards, pages and carts are always the live catalogue price (`DiscountedPrice ?? BasePrice` + variant adjustment; B2B `unitFor(qty)` = tier price + adjustment, never above retail); layouts never store prices (SB-R1).

## Backend
- **API:** `PUT /storefront-builder/pages/{id}/assignment {categoryIds, productIds}` (extra designs only; ≤ 200 / ≤ 200; ids filtered to the tenant and removed from every other design); `CreatePage` / `DeletePage` / `DuplicatePage` (stays a design, without assignments) / restore / uniqueness treat `AltProductTemplate` like `Custom` (`IsMultiPage`; slug `__product-<name>`, never routed). Public: `GET /public/{slug}/site` → `productTemplates`; `GET site/templates/product?id=`; `GET /public/{slug}/products` (filters, price bounds, tags), `GET products/{id}`, wholesale tiers, reviews.

## Frontend
- **Code:** `core/commerce/` — `useProductController` (one typed controller per open product: detail with variants, images normalised by `normalise.ts`, variant selection, price, wholesale tiers, quantity, `addToCart` with `variantInfo`; `ProductControllerContext` / `useProductCtl`, `ProductSurfaceContext` [popup / page, close, openFullPage]), `useBuyNow`, `useInquiry`, `useProductReviews` / `useSubmitReview`, `currentProduct.ts`, `recentlyViewed.ts` (per-store ids in localStorage), `api.ts`, `razorpay.ts`; `ui/product/` (`blockTypes.ts` [22 block types, defaults, `DEFAULT_PRODUCT_BLOCKS`], `ProductScope`, `Gallery`, `ProductInfo`, `InfoBlocks`, `BuyBlocks`, `ContentBlocks`, `StickyBuyBar`), `ui/ProductCard`, `ui/cardStyles.ts`, `ui/CompareTable`, `ui/FoodMark`; packs `sections/product-main`, `quickview/quickview`, `cards/card`, `sections/all-products` (`parts/useCatalog`, `parts/Parts`), `cart/cart`; `shell/StoreShell` (product view per `behaviour.productView`, popup = `quickview` layout `behaviour.quickviewLayout` filled from the product template via `shell/productTemplate.ts`), `shell/compare/` (`useCompare`, `CompareTray`, `CompareDialog`); editor `panels/BehaviourPanel.tsx`, `PagesPanel` *Other product designs* + `ProductDesignModal` / `ManualPicker`.
- Cart lines are keyed by product + variant (`CartContext.removeItem` / `updateQty` take `variantInfo`).

## Known issues
Open items in [known-issues](known-issues.md): KI-064, KI-065.

## Suggestions

## Changes to be done
See `storefront-builder` (*Changes to be done* — Phase 3 follow-ups).
