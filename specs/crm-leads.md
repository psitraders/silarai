---
id: crm-leads
status: current
context: "§4.3 CRM/Sales"
---
# CRM & Leads

## Purpose
Track customers and sales inquiries through a pipeline until they become orders.

## Scope
- **In:** `Customer` (CRM contact), `Lead` + `LeadNote` / `LeadActivity`, birthday reminders.
- **Out:** storefront self-service accounts (`storefront`), order lifecycle (`orders-payments`).

## Rules
- **CRM-R1** — Lead pipeline: NewInquiry → PriceShared → Interested → FollowUpPending → OrderConfirmed / Lost / RepeatOpportunity.
- **CRM-R2** — Leads can be created by staff or by the AI conversation flow (`ai-tenant-chatbot`).
- See INV-4 (CRM `Customer` ≠ `StorefrontCustomer`).

## UI
- `pages/leads/` — Leads, LeadDetail, LeadForm.
- `pages/customers/` — Customers, CustomerDetail, BirthdayReminders.

## Suggestions

## Changes to be done
