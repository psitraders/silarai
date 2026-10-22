---
id: catalog-products
status: current
prefix: CAT
related: [catalog-categories, b2b-wholesale, marketing-auto-campaigns, marketing-ai-content, tenancy-plans]
---
# Catalog — Products

## Purpose
Merchants manage what they sell: products with prices, sale prices, variants, images, tags, stock and status. Every channel (storefront, AI chatbots, orders) reads prices and stock from here.

## Scope
- **In:** `Product`, `ProductVariant`, `ProductImage`, `ProductTag`; create / edit / clone / delete; image upload, primary image, delete image; stock tracking and auto out-of-stock; inventory summary; AI description panel on the form.
- **Out:** categories (`catalog-categories`), wholesale tiers (`b2b-wholesale`), reviews (`catalog-reviews`), bulk import (`catalog-import`), auto-campaign on publish (`marketing-auto-campaigns`), Chatbot-as-a-Service products (`chatbot-service` — separate `ChatbotProduct`).

## Functional behaviour
- **Products** list (`/catalog/products`): search (title / SKU), status tabs *All · Active · Draft · Out of Stock* (filtered client-side over up to 500 products), inventory overview (total units, stock value, low-stock ≤ 5, out of stock, untracked), per-row clone / delete, *Sync to WhatsApp* button.
- **Product form** (`/catalog/products/new`, `/catalog/products/:id`): title, description (with the AI description panel), category, base price, sale price (`DiscountedPrice`), stock quantity (empty = not tracked), status (Draft / Active / Archived / OutOfStock), featured, tags, variants (option groups such as Size / Colour with value, price adjustment, stock, available), images (upload, set primary, delete; edit mode only), wholesale tiers editor (edit mode only, `b2b-wholesale`).
- Variants manage stock per value; the product stock field is disabled while variants exist.
- **Stock:** saving a product as *Active* with stock 0 stores it as *OutOfStock*; orders decrement stock and flip *Active* → *OutOfStock* at 0 (`orders-*`).
- **Publishing** (Draft → Active, or created Active) triggers the AI auto-campaign when the tenant enabled it (CAT-R4).
- **Clone** copies the product (counts against the plan limit).
- Delete is a soft delete.
- Storefront and chatbots show only *Active* and *OutOfStock* products.

## Rules
- **CAT-R3** — Insufficient stock returns 422 (`InsufficientStockException`).
- **CAT-R4** — Publishing a product can trigger an AI `AutoCampaign` (`marketing-auto-campaigns`).
- **CAT-R5** — The catalog is the price source for every order (INV-2): effective price = `DiscountedPrice ?? BasePrice` + variant `PriceAdjustment`.
- **CAT-R7** — Product count is limited by the plan (`MaxProducts`, 402 on create / clone; TEN-R3).
- **CAT-R8** — A product slug is unique per tenant and regenerated when the title changes; public product URLs accept slug or id.
- (CAT-R1 → `catalog-categories`; CAT-R2, CAT-R6 → `catalog-coupons`.)

## Backend
- **Data:** `Catalog/Product` (`Title`, `Slug`, `Description`, `Sku`, `CategoryId`, `BasePrice`, `DiscountedPrice`, `Status` = Draft 1 | Active 2 | Archived 3 | OutOfStock 4, `IsFeatured`, `StockQuantity` [null = untracked], `SortOrder`, `Attributes`, `MinOrderQuantity`, `MaxOrderQuantity`, `IsB2BOnly`), `ProductVariant` (`Name`, `Value`, `PriceAdjustment`, `StockQuantity`, `IsAvailable`), `ProductImage` (`Url`, `AltText`, `SortOrder`, `IsPrimary`), `ProductTag` (`Tag`; storefront food marks use `veg`, `non-veg`, `eggless`).
- **API — `ProductsController` `/api/v1/products` 🔒:** `GET ?page&pageSize&categoryId&search&status`, `GET inventory-summary`, `GET {id}`, `POST` (create, `{title, description, sku, categoryId, basePrice, discountedPrice, isFeatured, stockQuantity, tags, variants, status}` → 201 `{id}`), `PUT {id}`, `DELETE {id}` (soft), `POST {id}/clone`, `POST {id}/images` (multipart `file`; jpg/png/webp/gif; stored through `IStorageProvider` under `products/{id}`; first image becomes primary), `PUT {id}/images/{imageId}/primary`, `DELETE {id}/images/{imageId}` (also deletes from storage, promotes the next image).
- **Logic:** `Application/Catalog/Commands/CreateProductCommand` (plan limit, auto out-of-stock, unique slug via `SlugHelper`, tags, variants, `AutoLaunchCampaignCommand` fire-and-forget when Active), `UpdateProductCommand` (same + campaign only on a Draft/other → Active transition), `CloneProductCommand`, `DeleteProductCommand`; queries `GetProductsQuery` (paged, featured/sort order), `GetProductByIdQuery`. Storage provider = `Storage:Provider` (`Cloudinary` or `Local`).
- **Public reads** (`storefront`): `GET /public/{slug}/products`, `GET /public/{slug}/products/{slugOrId}`.

## Frontend
- **Routes & screens:** `pages/catalog/ProductsPage.tsx`, `pages/catalog/ProductFormPage.tsx` (`VariantEditor`, image grid, `components/ai/AiDescriptionPanel.tsx`, `components/catalog/WholesaleTiersEditor.tsx`).
- **Code:** `api/catalog.api.ts` (`getProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`, `cloneProduct`, `uploadImage`), image primary / delete and inventory summary called via `apiClient`; types in `types/catalog.types.ts`.

## Known issues
Open items in [known-issues](known-issues.md): KI-016, KI-036, KI-037.

## Suggestions
- Add SKU and B2B min/max quantity fields to the product form.

## Changes to be done
