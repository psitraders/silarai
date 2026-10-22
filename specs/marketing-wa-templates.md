---
id: marketing-wa-templates
status: current
prefix: MKT
related: [business-integrations, marketing-campaigns, crm-customers]
---
# Marketing — WhatsApp Templates & Broadcasts

## Purpose
Create WhatsApp message templates, get them approved by Meta through the merchant's own WhatsApp Business account, and broadcast an approved template to customers.

## Scope
- **In:** `WaTemplate` CRUD, submission to the Meta Cloud API, status sync, template broadcast to all customers or a phone list.
- **Out:** connecting WhatsApp (`business-integrations`), click-to-chat campaigns (`marketing-campaigns`), inbound messages (`channels-inbox`).

## Functional behaviour
- **WA Templates** (`/marketing/wa-templates`): list with category, language, Meta status badge (LOCAL / PENDING / APPROVED / REJECTED / PAUSED / DISABLED / ERROR), active toggle.
- **Create:** name (sanitised to lowercase letters, digits and `_`), display name, category (MARKETING / UTILITY / AUTHENTICATION / TRANSACTIONAL), language, body with `{{1}}`, `{{2}}` variables (+ variable labels), optional header and footer. Saved locally and, when WhatsApp is connected, submitted to Meta (`/{wabaId}/message_templates`); status becomes PENDING (or ERROR). Saving never fails because Meta failed.
- **Sync** pulls template statuses from Meta and updates local rows.
- **Send:** choose a template, variable values, and recipients — all customers with a phone, or a pasted list — → server broadcasts the template through the Cloud API (≈ 60 ms between messages) → `{sent, failed}`.
- Edit / delete affect the local row only.

## Rules
- ~~**MKT-R2** — WhatsApp templates are mid-migration from AiSensy to Meta Cloud API; both code paths are live.~~ Replaced by MKT-R5 (2026-10-21: no AiSensy code path remains; only names / comments mention it).
- **MKT-R5** — Templates are submitted, synced and sent through the Meta WhatsApp Cloud API with the tenant's own WABA credentials (BIZ-R1); template messages are the only server-side WhatsApp broadcast.

## Backend
- **Data:** `Marketing/WaTemplate` (`Name`, `DisplayName`, `Category`, `Language`, `Body`, `HeaderText`, `FooterText`, `VariablesJson`, `IsActive`, `IsDefault`, `MetaTemplateId`, `MetaStatus`).
- **API — `WaTemplatesController` `/api/v1/wa-templates` 🔒:** `GET`, `GET {id}`, `POST` (create + submit), `POST sync` (400 when WhatsApp is not connected), `PUT {id}`, `DELETE {id}`, `POST {id}/send {phoneNumbers?, templateParams?, mediaUrl?}`.
- **Logic:** `Application/Marketing/Commands/WaTemplateCommands.cs` (`Create`, `Update`, `Delete`, `SendWaCampaignCommand`), `Queries/GetWaTemplatesQuery`; `WhatsAppService.BroadcastCampaignAsync` / `SendTemplateMessageAsync` (Graph API, template payload with body params). Meta calls use Graph API v25.0 in the controller.

## Frontend
- **Routes & screens:** `pages/marketing/WaTemplatesPage.tsx`.
- **Code:** `api/business.api.ts` (`getWaTemplates`, `syncWaTemplates`, `getWaTemplate`, `createWaTemplate`, `updateWaTemplate`, `deleteWaTemplate`, `sendWaCampaign`).

## Known issues
Open items in [known-issues](known-issues.md): KI-058.

## Suggestions
- Move broadcasts to a background job and record per-recipient results.

## Changes to be done
