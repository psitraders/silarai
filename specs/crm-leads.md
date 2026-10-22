---
id: crm-leads
status: current
prefix: CRM
related: [crm-customers, channels-inbox, ai-tenant-chatbot, ai-tenant-chatbot-storefront, orders-management]
---
# CRM — Leads

## Purpose
Track every sales inquiry — from WhatsApp / Instagram / Facebook, the storefront, the AI chat or entered by staff — through a pipeline until it becomes an order or is lost.

## Scope
- **In:** `Lead` + `LeadNote` / `LeadActivity`, pipeline statuses, follow-up dates, lead list / detail / form, lead → order conversion API, newsletter and enquiry-form leads, follow-up reminders feed.
- **Out:** customers (`crm-customers`), message routing (`channels-inbox`), orders (`orders-management`).

## Functional behaviour
- **Leads** list (`/leads`): search (name / phone), status filter chips, channel badge, interested product, status badge.
- **New lead** (`/leads/new`): customer name, phone, email, source channel, interested product, inquiry note, follow-up date.
- **Lead detail** (`/leads/:id`): contact + WhatsApp link, status change (with optional follow-up date), notes, activity timeline (`Created`, `StatusChange`, `NoteAdded`, `OrderCreated`, inbound / outbound message entries).
- **Sources that create leads automatically:**
  - inbound WhatsApp / Instagram / Facebook messages — one lead per sender, re-used for later messages, each message logged as an activity (`channels-inbox`);
  - storefront inquiry / enquiry-form / custom-cake request (`POST /public/{slug}/inquiry`; also creates a CRM customer and, with cart items + phone, an abandoned cart; owner gets an email);
  - storefront AI chat once it has a phone (`ai-tenant-chatbot-storefront`);
  - storefront newsletter signup (CRM-R3).
- **Follow-up reminders:** leads not touched for 2+ days in open statuses feed the dashboard / marketing hub reminders (`analytics-dashboard`).
- **Convert to order** (API): creates an order from the lead with the given items, decrements stock, sets the lead to *OrderConfirmed* and logs `OrderCreated`.

## Rules
- **CRM-R1** — Lead pipeline: NewInquiry → PriceShared → Interested → FollowUpPending → OrderConfirmed / Lost / RepeatOpportunity.
- **CRM-R2** — Leads can be created by staff or by the AI conversation flow (`ai-tenant-chatbot`).
- **CRM-R3** — Storefront newsletter signups are Leads tagged `newsletter` (source Direct), one per email; storefront enquiry forms (incl. the custom cake request) create ordinary Leads.
- **CRM-R7** — Every status change, note and conversion writes a `LeadActivity` and updates `LastActivityDate`.
- See INV-4 (CRM `Customer` ≠ `StorefrontCustomer`).

## Backend
- **Data:** `Leads/Lead` (`CustomerName`, `CustomerPhone` [for Facebook / Instagram this holds the page- / IG-scoped id], `CustomerEmail`, `SourceChannel`, `InterestedProductId`, `InquiryNote`, `Status` [1–7], `AssignedUserId`, `FollowUpDate`, `Tags`, `Priority`, `CustomerId`, `LastActivityDate`), `LeadNote` (`Content`, `AuthorId`), `LeadActivity` (`ActivityType`, `Description`, `PerformedBy`).
- **API — `LeadsController` `/api/v1/leads` 🔒:** `GET ?page&pageSize&status&channel&search&assignedUserId`, `GET {id}`, `POST`, `PATCH {id}/status {status, followUpDate?}`, `POST {id}/notes {content}`, `POST {id}/convert {items[{productId, productTitle, quantity, unitPrice}], notes}` → `{id}`.
- **Logic:** `Application/Leads/Commands` (`CreateLeadCommand`, `UpdateLeadStatusCommand`, `AddLeadNoteCommand`, `ConvertLeadToOrderCommand`), `Queries` (`GetLeadsQuery`, `GetLeadByIdQuery`). Public creation in `PublicStorefrontController` (`inquiry`, `newsletter`, `chat`) and channel commands (`channels-inbox`).

## Frontend
- **Routes & screens:** `pages/leads/LeadsPage.tsx`, `LeadFormPage.tsx`, `LeadDetailPage.tsx`.
- **Code:** `api/leads.api.ts` (`getLeads`, `getLead`, `createLead`, `updateStatus`, `addNote`, `convertToOrder` — the last has no UI).

## Known issues
Open items in [known-issues](known-issues.md): KI-012, KI-029, KI-045.

## Suggestions
- Add a *Convert to order* action on the lead detail, priced from the catalogue.

## Changes to be done
