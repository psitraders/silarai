---
id: crm-customers
status: current
prefix: CRM
related: [crm-leads, orders-management, orders-checkout, storefront-accounts, b2b-wholesale]
---
# CRM — Customers

## Purpose
One customer list per store built from orders, inquiries and storefront sign-ups, with order totals, notes, birthdays and duplicate clean-up.

## Scope
- **In:** CRM `Customer` CRUD, search / tag filter, detail with recent orders and leads, CSV export / import, duplicate detection, manual and smart merge, upcoming birthdays / anniversaries, B2B buyer list + approval.
- **Out:** storefront self-service accounts (`storefront-accounts`), lead pipeline (`crm-leads`), wholesale pricing and quotes (`b2b-wholesale`).

## Functional behaviour
- **Customers** (`/customers`) with tabs **All** (search name / phone / email, tag filter, create / edit / delete), **B2B** (storefront B2B buyers linked to a CRM customer — approve or revoke wholesale access; approval emails the buyer a "you're approved" message with the store link) and **Duplicates** (groups sharing a phone; merge one into another, or *Smart merge* all groups).
- **Customer detail** (`/customers/:id`): contact, address, city, tags, notes, birthday, anniversary, total orders, total spend, last 10 orders, last 5 leads (matched by customer id or phone).
- **Export** downloads `customers-YYYYMMDD.csv` (`Name,Phone,Email,Address,City,Tags,Notes,TotalOrders,TotalSpend,CreatedAt`). **Import** reads a CSV with `Name,Phone,Email,Address,City,Tags,Notes` (header row skipped; rows without name or phone skipped; existing phone → updated) and reports created / updated / skipped.
- **Birthday reminders** (`/customers/birthdays`): birthdays and anniversaries in the next 30 days with days-until, order stats and a WhatsApp wish link.
- **Automatic creation:** staff orders, storefront inquiries, storefront COD / Razorpay orders, AI chat leads and storefront registration create or update a customer (matched by phone, or by email for storefront accounts) and keep `TotalOrders`, `TotalSpend`, `LastOrderDate` up to date.
- **Merge:** the source's orders and leads move to the target, totals add up, notes / tags are appended, the source is soft-deleted. *Smart merge* groups by normalised phone and by email and keeps the record with the most orders, then the highest spend.

## Rules
- **CRM-R4** — A CRM `Customer` is never a login identity (INV-4); storefront accounts link to it through `StorefrontCustomer.LinkedCrmCustomerId`.
- **CRM-R5** — Merging is irreversible: orders and leads are re-pointed and the source customer is soft-deleted.
- **CRM-R6** — `Birthday` / `Anniversary` store month and day only (year ignored).

## Backend
- **Data:** `Customers/Customer` (`Name`, `PhoneNumber`, `Email`, `PreferredChannel` [WhatsApp 1 | Instagram 2 | Facebook 3 | Direct 4 | Other 5], `Address`, `City`, `Notes`, `Tags` [comma-separated, `b2b` for storefront B2B buyers], `Birthday`, `Anniversary`, `LastOrderDate`, `TotalOrders`, `TotalSpend`).
- **API — `CustomersController` `/api/v1/customers` 🔒:** `GET ?page&pageSize&search&tag`, `GET duplicates`, `GET {id}`, `POST`, `PUT {id}`, `GET birthdays?daysAhead=30`, `DELETE {id}` (soft), `POST {targetId}/merge/{sourceId}`, `POST smart-merge` → `{groupsMerged, customersMerged}`, `GET b2b`, `POST {crmCustomerId}/b2b/approve?approve=true|false`, `GET export` (CSV), `POST import` (multipart CSV).
- **Logic:** `Application/Customers/Commands` (`CreateCustomerCommand`, `UpdateCustomerCommand`, `DeleteCustomerCommand`, `MergeCustomersCommand`, `SmartMergeCustomersCommand`, `ApproveB2BCustomerCommand` — sets `StorefrontCustomer.IsB2BApproved`), `Queries` (`GetCustomersQuery`, `GetCustomerDetailQuery`, `GetDuplicateCustomersQuery`, `GetUpcomingBirthdaysQuery`, `GetB2BCustomersQuery`). B2B approval email: `EmailService.SendB2BApprovedAsync` (INV-12).

## Frontend
- **Routes & screens:** `pages/customers/CustomersPage.tsx` (tabs all / b2b / duplicates, create / edit modal, import / export), `CustomerDetailPage.tsx`, `BirthdayRemindersPage.tsx`.
- **Code:** `api/customers.api.ts` (`getAll`, `getById`, `create`, `update`, `delete`, `getDuplicates`, `merge`, `smartMerge`, `getB2BCustomers`, `approveB2BCustomer`, `exportCsv`, `importCsv`, `getUpcomingBirthdays`); `utils/whatsappLink.ts`.

## Known issues
Open items in [known-issues](known-issues.md): KI-043, KI-044.

## Suggestions
- Normalise phone numbers once on write for every entry point.

## Changes to be done
