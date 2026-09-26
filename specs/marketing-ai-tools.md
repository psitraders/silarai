---
id: marketing-ai-tools
status: current
context: "§4.3 AI / Marketing, §6"
---
# Marketing & AI Tools

## Purpose
Help merchants reach and win back customers: campaigns, abandoned-cart recovery, WhatsApp templates and AI-generated content.

## Scope
- **In:** `Campaign` / `CampaignRecipient` (WhatsApp, Email, Instagram), `AbandonedCart`, `WaTemplate`, `AutoCampaign`, AI suggestions, reply templates, social posts, reel scripts, product descriptions, festival calendar, AI usage logging.
- **Out:** AI sales conversations (`ai-tenant-chatbot`).

## Rules
- **MKT-R1** — `AutoCampaign` is AI-generated when a product is published, with per-channel results and status.
- **MKT-R2** — WhatsApp templates are mid-migration from AiSensy to Meta Cloud API; both code paths are live.
- **MKT-R3** — AI token usage is logged per user (`AiUsageLog`).

## UI
- `pages/marketing/` — MarketingHub, CampaignList/Form/Detail, AbandonedCarts, WaTemplates, FestivalCalendar.
- `pages/ai/` — AiCampaigns, AiSocialPost, AiReelScript, AiProductDescription, AiReplies, AiTemplates.

## Suggestions
- Finish the AiSensy → Meta template migration and remove the legacy path.

## Changes to be done
