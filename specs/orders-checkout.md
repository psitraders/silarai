---
id: orders-checkout
status: current
prefix: ORD
related: [storefront, storefront-builder-commerce, catalog-coupons, b2b-wholesale, ai-tenant-chatbot-storefront, orders-management]
---
# Orders — Storefront Checkout & Payments

## Purpose
Turn a storefront cart (or a *Buy now* / AI-chat order) into an order: Cash on Delivery verified by an email code, or online payment through the merchant's Razorpay account, followed by a confirmation page, invoice and emails.

## Scope
- **In:** cart checkout (`components/storefront/CartDrawer.tsx`) and the builder's buy-now flow, COD email OTP, `cod-order`, AI-chat COD confirm, Razorpay public config / create-order / verify, order confirmation page, public order + invoice, owner / customer order emails, abandoned-cart capture at checkout.
- **Out:** cart UI layouts and product view (`storefront-builder-commerce`), coupon rules (`catalog-coupons`), wholesale tiers (`b2b-wholesale`), the AI chat itself (`ai-tenant-chatbot-storefront`), dashboard order handling (`orders-management`).

## Functional behaviour
- **COD:** buyer fills name, phone, email, address → *Send code* emails a 6-digit code (valid 10 min, one use) → buyer enters it → `cod-order`. The server validates stock, reprices every line from the catalogue (approved B2B buyers — identified by their storefront bearer token — get tier prices), upserts the CRM customer by normalised phone, creates the order (`SourceChannel` Direct, payment Pending), decrements stock, emails the owner (new order) and the buyer (confirmation / bill), and returns the order id → redirect to the confirmation page.
- **AI-chat COD:** when the storefront AI reaches `order_ready` with COD it returns a *pending COD order*; the chat collects email + code and calls `chat/confirm-cod-order` (same repricing, customer upsert, stock and emails).
- **Online (Razorpay):** shown only when the store has Razorpay keys. The cart first records an abandoned cart (via `inquiry`), loads Razorpay Checkout, asks the API to create a Razorpay order for the amount, and after payment calls `verify` with the Razorpay ids, signature and cart; the server checks the HMAC signature and creates a **Paid** order.
- **Coupons:** the cart validates a code and shows the discount (`catalog-coupons`).
- **Confirmation page** (`/{slug}/order-confirmation/:orderId` or `/order-confirmation/:orderId` on a custom domain): order summary + *Download invoice* (public HTML invoice). The builder flow also sends a GA4 `purchase` event.
- **B2B:** approved B2B buyers can request a quote from the cart instead of paying (`b2b-wholesale`).

## Rules
- **ORD-R2** — Prices are always recomputed server-side (INV-2); any checkout change must keep this.
- **ORD-R3** — Gateway credentials are per tenant (BIZ-R1). Razorpay is primary (India).
- **ORD-R4** — Storefront COD requires email-OTP verification.
- **ORD-R7** — The Razorpay key secret never leaves the server; the storefront gets only the key id (BIZ-R5).
- **ORD-R8** — A storefront order is created only after the stock check passes; stock is decremented in the same save.

## Backend
- **API — `PublicStorefrontController` `/api/v1/public/{slug}` (anonymous):** `POST cod-otp/send {email, customerName}`, `POST cod-order {customerName, customerPhone, customerEmail, emailOtp, deliveryAddress, notes, items[{productId, productTitle, variantInfo, quantity, unitPrice}]}` (optional `Authorization: Bearer` storefront-customer token for B2B prices), `POST chat/confirm-cod-order`, `GET orders/{orderId}` (summary), `GET orders/{orderId}/invoice` (HTML).
- **API — `PaymentController` `/api/v1/public/{slug}/payment` (anonymous):** `GET config` (`{razorpayEnabled, keyId, currency}`), `POST create-order {amount}` (Razorpay `v1/orders`, amount in paise), `POST verify {razorpayOrderId, razorpayPaymentId, razorpaySignature, customerName, customerPhone, customerEmail, deliveryAddress, items[]}`.
- **Logic:** price helpers `ResolveUnitPrice` / `ResolveUnitPriceWithTiers` + `GetB2BTiersAsync` in `PublicStorefrontController`; `Infrastructure/Services/CodOtpStore` (singleton, in-memory, 10 min, one-time); emails `SendCodOtpAsync`, `SendNewOrderNotificationAsync`, `SendOrderConfirmationAsync` (INV-12).

## Frontend
- **Code:** `components/storefront/CartDrawer.tsx` (cart lines keyed by product + variant, coupon field, B2B tier prices, COD OTP form, Razorpay script loader, quote request), placed by the builder's `cart` pack (`storefront-builder-commerce`); `storefront-builder/core/commerce/useBuyNow.ts` (single-product buy now: Razorpay or COD + OTP, B2B bearer, GA4 `purchase`, redirect) + `razorpay.ts` + `api.ts`; `context/CartContext.tsx` (`cart_{slug}`, SF-R2); `pages/storefront/OrderConfirmationPage.tsx`.

## Known issues
Open items in [known-issues](known-issues.md): KI-005, KI-009, KI-010, KI-011, KI-016, KI-017, KI-048.

## Suggestions
- Price the Razorpay order on the server from the cart (create-order takes items, not an amount) and re-check the amount in `verify`; reuse the COD order builder for both paths.

## Changes to be done
