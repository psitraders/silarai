---
id: b2b-wholesale
status: current
prefix: B2B
related: [storefront-accounts, crm-customers, orders-checkout, catalog-products]
---
# B2B / Wholesale

## Purpose
Let tenants sell wholesale alongside retail: approved business buyers get quantity-break prices, and any buyer can ask for a bulk quote that the merchant answers from a quote inbox.

## Scope
- **In:** `ProductWholesaleTier`, `QuoteRequest`, wholesale tiers editor, public tiers, tier pricing at checkout, quote submit / inbox / reply, the per-store B2B toggle.
- **Out:** B2B sign-up and account (`storefront-accounts`), B2B approval (`crm-customers`), checkout flow (`orders-checkout`), retail catalogue (`catalog-products`).

## Functional behaviour
- **Toggle:** *Storefront settings → Visibility → B2B* (`StorefrontSettings.B2BEnabled`, default on). When off the storefront is B2C-only: no quote tab / button, no quote submissions.
- **Wholesale tiers** (product form, edit mode): rows of min qty, max qty (empty = "and above"), price per unit, label (e.g. "10–49 units"); saving replaces all tiers of the product.
- **Who gets tier prices:** only signed-in storefront customers with `IsB2BCustomer` **and** `IsB2BApproved`. The storefront shows a wholesale table on the product and tier prices in the cart; at checkout the server picks the tier with the highest `MinQuantity` matching the line quantity and charges `min(retail, tier price + variant adjustment)`.
- **Quote request** (`QuoteRequestModal`, from the cart or product view): contact name, email, phone, company, GST, notes and the items (pre-filled from the cart). Signed-in buyers' quotes are linked to their account. The owner gets an email.
- **Quote inbox** (`/b2b/quotes`): list of requests with items and status; *Reply* with a message and status (*Replied* / *Closed*) → the buyer gets the reply by email; buyers see replies under *My account → Quotes*.

## Rules
- **B2B-R1** — B2B features are gated per tenant by `StorefrontSettings.B2BEnabled`.
- **B2B-R2** — Wholesale prices come from quantity-break tiers on the server (INV-2).
- **B2B-R3** — A tier price never exceeds the retail price of the same line (variant adjustment included).
- **B2B-R4** — Saving tiers replaces the product's tiers with a hard delete (INV-9 exception).

## Backend
- **Data:** `Storefront/ProductWholesaleTier` (`ProductId`, `MinQuantity`, `MaxQuantity`, `PricePerUnit`, `Label`), `QuoteRequest` (`StorefrontCustomerId?`, `ContactName`, `ContactEmail`, `ContactPhone`, `CompanyName`, `GstNumber`, `ItemsJson` `[{productId, title, qty, unitPrice}]`, `Notes`, `Status` Pending | Replied | Closed, `MerchantReply`, `RepliedAt`); B2B fields on `StorefrontCustomer`.
- **API — `B2BController` `/api/v1/b2b` 🔒:** `PUT|GET products/{productId}/wholesale-tiers`, `GET quotes?page&pageSize`, `PUT quotes/{quoteId}/reply {reply, status?}` (emails the buyer, INV-12).
- **API — public:** `GET /api/v1/public/{slug}/products/{productId}/wholesale-tiers` (`PublicWholesaleTiersController`), `POST /api/v1/public/{slug}/quotes` (`StorefrontQuoteController`; 400 when B2B is off; links the quote when a storefront token is sent; owner email), `GET /public/{slug}/customer/quotes` (`storefront-accounts`).
- **Logic:** `Application/Storefront/Commands/WholesaleCommands` (`UpsertWholesaleTiersCommand`, `GetWholesaleTiersQuery`), `QuoteCommands` (`SubmitQuoteCommand`, `ListQuotesQuery`, `GetMyQuotesQuery`, `ReplyToQuoteCommand`); checkout pricing `PublicStorefrontController.ResolveUnitPriceWithTiers` + `GetB2BTiersAsync`.

## Frontend
- **Routes & screens:** `pages/b2b/B2BDashboardPage.tsx` (`/b2b/quotes`, sidebar *B2B Quote Inbox*).
- **Code:** `api/b2b.api.ts`, `components/catalog/WholesaleTiersEditor.tsx`, `components/storefront/QuoteRequestModal.tsx`, `CartDrawer.tsx` (wholesale prices for approved buyers, quote button), builder `ui/product/BuyBlocks` (`quote`, `wholesale` blocks) and `useProductController.unitFor(qty)`.

## Known issues
Open items in [known-issues](known-issues.md): KI-009, KI-016.

## Suggestions

## Changes to be done
