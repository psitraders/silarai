---
id: catalog-import
status: current
prefix: CAT
related: [catalog-products, catalog-categories, business-integrations]
---
# Catalog — Product Import

## Purpose
Bring an existing catalogue into Silarai in bulk from Shopify, WooCommerce or any website, with a preview before anything is saved.

## Scope
- **In:** import preview / confirm from Shopify Admin API, WooCommerce REST API and the web scraper; category creation during import; the WhatsApp Commerce catalogue import API.
- **Out:** single product editing (`catalog-products`), Chatbot-as-a-Service CSV / Shopify imports (`chatbot-service`), CRM customer CSV import (`crm-customers`).

## Functional behaviour
- **Import Products** (`/catalog/import`): pick a source → enter credentials → *Preview* lists found products (title, price, sale price, image, category, SKU, stock) with checkboxes and found categories / errors → *Import selected*.
  - **Shopify:** shop domain + Admin API access token; reads `admin/api/2024-01/products.json?limit=250&status=active` (first variant's price).
  - **WooCommerce:** site URL + consumer key / secret; pages through `wp-json/wc/v3/products?per_page=100&status=publish`.
  - **Web scraper:** site URL; reads JSON-LD `Product` data from the page and up to 5 category pages (max 100 products).
- **Confirm:** creates missing categories by name (when *create categories* is on), then products as **Active** with the main image + up to 4 extra images. Returns imported / failed counts and errors.
- **WhatsApp catalogue import (API only):** preview the products of the connected WhatsApp Commerce catalogue (`WhatsAppCatalogId`) and import selected retailer ids, skipping SKUs that already exist.

## Rules
- **CAT-R13** — Preview never writes; only *confirm* saves, and only the selected rows.
- **CAT-R14** — Imported products are created **Active** (stock as imported); existing products are not updated or de-duplicated by the web import.

## Backend
- **API — `ImportController` `/api/v1/import` 🔒:** `POST preview {source: shopify|woocommerce|scraper, shopUrl?, accessToken?, siteUrl?, consumerKey?, consumerSecret?}` → `{products, totalFound, categories, errors}`; `POST confirm {products[], createCategories}` → `{imported, failed, errors}` (400 when nothing selected).
- **API — `BusinessController`:** `GET /business/catalog/import-preview`, `POST /business/catalog/import {retailerIds[]}` (WhatsApp catalogue; 400 when no catalogue id / token).
- **Logic:** `Infrastructure/Import/ProductImportService` (`IProductImportService`; DTOs in `Application/Import/ImportDtos.cs`), `Application/Business/Commands/ImportFromCatalogCommand` (+ `PreviewCatalogImportQuery`) via `IWhatsAppCatalogService`.

## Frontend
- **Routes & screens:** `pages/catalog/ImportProductsPage.tsx` (source tabs Shopify / WooCommerce / Web Scraper, preview table, import).
- **Code:** `api/import.api.ts`. `businessApi.previewCatalogImport` / `confirmCatalogImport` exist but no screen uses them.

## Known issues
Open items in [known-issues](known-issues.md): KI-041, KI-042.

## Suggestions
- Apply the plan limit on confirm; import variants from Shopify / WooCommerce.

## Changes to be done
