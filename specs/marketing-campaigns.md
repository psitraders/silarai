---
id: marketing-campaigns
status: current
prefix: MKT
related: [marketing-wa-templates, marketing-ai-content, marketing-abandoned-carts, crm-customers, analytics-dashboard]
---
# Marketing — Hub & Campaigns

## Purpose
One place for merchants to reach customers: the Marketing hub with shortcuts and stats, message campaigns to a chosen customer list (sent click-by-click through WhatsApp), and a festival calendar for planning.

## Scope
- **In:** *Marketing* hub, `Campaign` / `CampaignRecipient`, campaign list / form / detail, AI message suggestion in the form, festival calendar.
- **Out:** WhatsApp template broadcasts via Meta (`marketing-wa-templates`), abandoned carts (`marketing-abandoned-carts`), AI generators (`marketing-ai-content`), auto-campaigns on product publish (`marketing-auto-campaigns`).

## Functional behaviour
- **Marketing hub** (`/marketing`): stats (campaigns sent, people reached, drafts waiting, follow-ups pending), tiles to WhatsApp campaign, AI replies, social posts, product descriptions, reel scripts, festival calendar, email campaign, reminders, abandoned carts, QR code; recent campaigns and follow-up reminders.
- **New campaign** (`/marketing/campaigns/new?type=whatsapp|email`): title, type (WhatsApp / Email), subject (email), message (goal presets such as "check in after a purchase", "re-engage customers who have not shopped in a while" → *Generate with AI*), recipients (pick from customers with segment filters, or add manually: name + phone / email). Saved as **Draft**.
- **Campaign detail** (`/marketing/campaigns/:id`): recipients and message; **Send** marks the campaign *Sent* (sent count = recipients) and returns one `wa.me` link per recipient with a phone — the merchant opens them one by one (*Open next*) to send from their own WhatsApp.
- **Festival calendar** (`/marketing/festival-calendar`): static list of upcoming Indian / global festivals sorted by date, with campaign ideas.

## Rules
- **MKT-R4** — Campaign *Send* does not message anyone from the server: it produces click-to-chat links; server-side WhatsApp broadcasts use approved templates only (`marketing-wa-templates`).

## Backend
- **Data:** `Marketing/Campaign` (`Title`, `Type` WhatsApp 1 | Email 2 | Instagram 3, `Message`, `Subject`, `Status` Draft 1 | Scheduled 2 | Sending 3 | Sent 4 | Failed 5, `ScheduledAt`, `SentAt`, `RecipientCount`, `SentCount`, `OpenedCount`), `CampaignRecipient` (`Name`, `Phone`, `Email`, `IsSent`, `SentAt`).
- **API — `MarketingController` `/api/v1/marketing` 🔒:** `GET campaigns`, `GET campaigns/{id}`, `POST campaigns`, `POST campaigns/{id}/send` → `{campaignId, recipientCount, whatsAppTargets[{name, phone, whatsAppUrl}]}`, `POST generate-message {goal, tone, extraContext?}` (+ AI tools in `marketing-ai-content`).
- **Logic:** `Application/Marketing/Commands/CreateCampaignCommand`, `SendCampaignCommand`, `GenerateMarketingMessageCommand`; `Queries/GetCampaignsQuery`, `GetCampaignByIdQuery`. Reminders come from `GET /activity/reminders` (`analytics-dashboard`).

## Frontend
- **Routes & screens:** `pages/marketing/MarketingHubPage.tsx`, `CampaignListPage.tsx`, `CampaignFormPage.tsx`, `CampaignDetailPage.tsx`, `FestivalCalendarPage.tsx` (static `FESTIVALS`).
- **Code:** `api/marketing.api.ts` (`getCampaigns`, `getCampaign`, `createCampaign`, `sendCampaign`, `generateMarketingMessage`, `getReminders`).

## Known issues
Open items in [known-issues](known-issues.md): KI-054, KI-055.

## Suggestions
- Send email campaigns through `IEmailService` (Resend) or hide the Email type.

## Changes to be done
