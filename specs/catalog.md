---
id: catalog
status: current
context: "§4.3 Catalog, §4.4"
---
# Catalog

## Purpose
Merchants manage what they sell: products, categories, reviews and coupons.

## Scope
- **In:** `Product` (variants, images, tags, B2B min/max order qty), `Category`, `ProductReview`, `Coupon`, bulk import (preview → confirm), AI product descriptions panel.
- **Out:** wholesale tier pricing (`b2b-wholesale`), Chatbot-as-a-Service products (`chatbot-service` — separate `ChatbotProduct`).

## Rules
- **CAT-R1** — Categories support only one level of subcategories (`ParentCategoryId`).
- **CAT-R2** — Coupon types: Percentage, Flat, BuyXGetY.
- **CAT-R3** — Insufficient stock returns 422 (`InsufficientStockException`).
- **CAT-R4** — Publishing a product can trigger an AI `AutoCampaign` (`marketing-ai-tools`).
- **CAT-R5** — The catalog is the price source for every order (INV-2).

## UI
- `pages/catalog/` — Products, ProductForm, Categories, Coupons, Reviews, ImportProducts.
- `components/ai/AiDescriptionPanel.tsx`.

## Suggestions

## Changes to be done
