---
id: orders-management
status: current
prefix: ORD
related: [orders-checkout, crm-customers, crm-leads, catalog-products, business-integrations]
---
# Orders — Dashboard Management

## Purpose
Staff create and fulfil orders from the dashboard: status pipeline, recorded payments, cancellations, payment links and printable invoices. Orders from every channel (storefront, AI chat, staff) land in the same list.

## Scope
- **In:** `Order`, `OrderItem`, `Payment`, `OrderStatusHistory`; order list / detail / create; status changes; manual payments; cancel; gateway payment links (Razorpay / Stripe / PayPal); HTML invoice.
- **Out:** storefront and chat checkout (`orders-checkout`), lead conversion entry point (`crm-leads`), Chatbot-as-a-Service orders (`chatbot-service` — separate `ChatbotOrder`).

## Functional behaviour
- **Orders** list (`/orders`): status filter tabs, search (order number / customer), amount, status and payment badges.
- **New order** (`/orders/new`): customer (existing or name + phone → a CRM customer is found by phone or created, and its totals updated), source channel, delivery address, notes, line items (product picker pre-fills the current price; quantity and **unit price are editable**).
- **Order detail** (`/orders/:id`): items, totals, customer, status history; change status (with optional payment status + note); **record payment** (amount, method e.g. UPI / cash / card, reference, notes — payment status becomes *Partial* or *Paid* when payments ≥ total); **cancel** (reason → history); **payment link** (created with the tenant's default gateway, shown in a modal with copy / WhatsApp share); **invoice** (opens a printable HTML invoice with store logo, WhatsApp, email, currency).
- Order numbers: `ORD-yyyyMMdd-XXXXXX` (staff and storefront orders, 6 hex chars) or `ORD-yyyyMMdd-NNNN` (lead conversion). The detail page also offers a WhatsApp status message to the customer.
- Stock: creating an order validates stock (out-of-stock or not enough → 422) and decrements it; products reaching 0 become *OutOfStock*.

## Rules
- **ORD-R1** — Status flow: New → Confirmed → PaymentPending → Paid → Packed → Delivered / Cancelled; every change is recorded in history.
- ORD-R3 applies (`orders-checkout`): gateway credentials are per tenant. Payment links use `Business.PaymentGateway` (Stripe Checkout session, PayPal invoice link, else Razorpay) and fail with 400 when that gateway isn't configured.
- **ORD-R5** — Payment status is derived from recorded payments: sum ≥ total → Paid, else Partial.

## Backend
- **Data:** `Orders/Order` (`OrderNumber`, `CustomerId`, `SourceLeadId`, `Status` [New 1 … Cancelled 7], `PaymentStatus` [Pending 1 | Partial 2 | Paid 3 | Refunded 4], `SourceChannel`, `TotalAmount`, `DiscountAmount`, `Notes`, `AssignedUserId`, `CustomerName`, `CustomerPhone`, `DeliveryAddress`), `OrderItem` (`ProductId`, `ProductTitle`, `VariantInfo`, `Quantity`, `UnitPrice`, `TotalPrice`), `Payment` (`Amount`, `Method`, `ReferenceNumber`, `PaidAt`, `Notes`), `OrderStatusHistory` (`FromStatus`, `ToStatus`, `Note`, `ChangedBy`).
- **API — `OrdersController` `/api/v1/orders` 🔒:** `GET ?page&pageSize&status&search`, `GET {id}`, `POST` (`{customerId?, sourceLeadId?, sourceChannel, customerName, customerPhone, deliveryAddress, notes, items[{productId, productTitle, variantInfo, quantity, unitPrice}]}`), `PATCH {id}/status {status, paymentStatus?, note?}`, `POST {id}/payments`, `POST {id}/cancel {reason}`, `POST {id}/payment-link` → `{url}`, `GET {id}/invoice` (text/html).
- **Logic:** `Application/Orders/Commands` (`CreateOrderCommand`, `UpdateOrderStatusCommand`, `RecordPaymentCommand`, `CancelOrderCommand`, `CreateRazorpayPaymentLinkCommand` — despite the name, picks Razorpay / Stripe / PayPal), `Queries` (`GetOrdersQuery`, `GetOrderByIdQuery`); `Api/Controllers/v1/InvoiceHelper.BuildHtml` (HTML-encoded, shared with the public invoice).

## Frontend
- **Routes & screens:** `pages/orders/OrdersPage.tsx`, `OrderFormPage.tsx`, `OrderDetailPage.tsx` (status, payment form, cancel, payment-link modal, invoice).
- **Code:** `api/orders.api.ts` (`getOrders`, `getOrder`, `createOrder`, `updateStatus`, `recordPayment`, `cancelOrder`, `createPaymentLink`, `openInvoice`); `utils/whatsappLink.ts`.

## Known issues
Open items in [known-issues](known-issues.md): KI-012, KI-013, KI-014, KI-015.

## Suggestions
- Restock on cancel; add Razorpay / Stripe webhooks to mark link payments.

## Changes to be done
