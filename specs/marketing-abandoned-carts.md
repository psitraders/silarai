---
id: marketing-abandoned-carts
status: current
prefix: MKT
related: [orders-checkout, crm-leads, marketing-campaigns]
---
# Marketing — Abandoned Carts

## Purpose
Capture carts that shoppers started but didn't complete so the merchant can follow up on WhatsApp and mark them recovered.

## Scope
- **In:** `AbandonedCart`, capture from the storefront, the *Abandoned carts* page, reminder / recovered tracking.
- **Out:** checkout (`orders-checkout`), inquiry leads (`crm-leads`).

## Functional behaviour
- **Capture:** `POST /public/{slug}/inquiry` stores an abandoned cart when it carries cart items **and** a phone — sent by the cart drawer before opening Razorpay, by builder product inquiries (`useInquiry`, cart included) and by enquiry forms. Total and item count come from the submitted lines.
- **Abandoned carts** (`/marketing/abandoned-carts`): paged list (customer, phone, email, items, total, time, last reminder), filter *show recovered*; per cart: WhatsApp reminder link (marks *reminder sent*), *Mark recovered*, delete.

## Rules
- **MKT-R6** — A cart is captured only with a phone number (needed for the reminder); recovery is marked manually.

## Backend
- **Data:** `Marketing/AbandonedCart` (`CustomerName`, `CustomerPhone`, `CustomerEmail`, `CartItemsJson`, `CartTotal`, `ItemCount`, `StoreSlug`, `IsRecovered`, `LastReminderSentAt`).
- **API — `AbandonedCartsController` `/api/v1/abandoned-carts` 🔒:** `GET ?recovered&page&pageSize`, `PUT {id}/mark-recovered`, `PUT {id}/reminder-sent`, `DELETE {id}` (soft).

## Frontend
- **Routes & screens:** `pages/marketing/AbandonedCartsPage.tsx`.
- **Code:** `api/abandonedCarts.api.ts` (`getAll`, `markRecovered`, `markReminderSent`, `delete`).

## Known issues
Open items in [known-issues](known-issues.md): KI-059.

## Suggestions
- Mark the newest open cart for the same phone as recovered when an order is created.

## Changes to be done
