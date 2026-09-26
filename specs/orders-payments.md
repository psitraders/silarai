---
id: orders-payments
status: current
context: "§4.3 CRM/Sales, §4.4, §5.4, §6"
---
# Orders & Payments

## Purpose
Create and fulfil orders, and collect payment through COD or online gateways.

## Scope
- **In:** `Order`, `OrderItem`, `Payment`, `OrderStatusHistory`, invoices, public payment endpoints (Razorpay, Stripe, PayPal), COD.
- **Out:** storefront cart UI (`storefront`), chatbot-service orders (`chatbot-service` — separate `ChatbotOrder`).

## Rules
- **ORD-R1** — Status flow: New → Confirmed → PaymentPending → Paid → Packed → Delivered / Cancelled; every change is recorded in history.
- **ORD-R2** — Prices are always recomputed server-side (INV-2); any checkout change must keep this.
- **ORD-R3** — Gateway credentials are per tenant (BIZ-R1). Razorpay is primary (India).
- **ORD-R4** — Storefront COD requires email-OTP verification.

## UI
- `pages/orders/` — Orders, OrderDetail, OrderForm.
- `components/storefront/CartDrawer.tsx` (checkout), `pages/storefront/OrderConfirmationPage.tsx`.

## Suggestions

## Changes to be done
