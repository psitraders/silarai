---
id: marketing-auto-campaigns
status: current
prefix: MKT
related: [catalog-products, business-integrations, marketing-ai-content, ai-tenant-chatbot]
---
# Marketing — AI Auto-Campaigns on Product Launch

## Purpose
When a merchant publishes a product, the AI writes a launch post and Silarai posts it to the connected Instagram and Facebook page and broadcasts it on WhatsApp — automatically, if the merchant turned it on.

## Scope
- **In:** `AutoCampaign`, `AutoLaunchCampaignCommand`, the *Auto-Campaigns* history page, the toggle on *AI Autopilot*.
- **Out:** product publishing (`catalog-products`), channel credentials (`business-integrations`).

## Functional behaviour
- **Trigger:** a product is created as *Active* or moves to *Active* from another status, and `Business.AutoCampaignEnabled` is on (toggle on `/ai/autopilot`). Runs fire-and-forget after the product save.
- **Steps:** create the record (*Pending* → *Processing*) → AI generates caption, hashtags, CTA and a WhatsApp message (`GenerateAutoCampaignContentAsync`) → **Instagram** photo post (only with a product image) → **Facebook** page post → **WhatsApp** text broadcast to up to 500 customers with a phone → status *Completed* (all succeeded), *Partial* (some channels), or *Failed*; errors stored.
- **Auto-Campaigns** (`/ai/auto-campaigns`): paged history with product, generated text, per-channel results (posted / post ids / recipients), status and errors.

## Rules
- **MKT-R1** — `AutoCampaign` is AI-generated when a product is published, with per-channel results and status.
- **MKT-R7** — Auto-campaigns run only when the tenant enabled them, and a channel is used only when it is configured for the tenant; a failure never blocks the product save.

## Backend
- **Data:** `Campaigns/AutoCampaign` (`ProductId`, `ProductName`, `GeneratedCaption`, `GeneratedHashtags`, `GeneratedCta`, `GeneratedImageUrl`, `PostedToInstagram`, `InstagramPostId`, `PostedToFacebook`, `FacebookPostId`, `SentViaWhatsAppBroadcast`, `WhatsAppRecipientsCount`, `Status` Pending 0 | Processing 1 | Completed 2 | Failed 3 | Partial 4, `ErrorLog`, `CompletedAt`).
- **API:** `GET /api/v1/business/auto-campaigns?page&pageSize` 🔒.
- **Logic:** `Application/Catalog/Commands/AutoLaunchCampaignCommand` (`IAiProvider`, `IInstagramService.CreatePhotoPostAsync`, `IFacebookService.CreatePagePostAsync`, `IWhatsAppService.BroadcastTextMessageAsync`), `Queries/GetAutoCampaignsQuery`.

## Frontend
- **Routes & screens:** `pages/ai/AiCampaignsPage.tsx`; toggle on `pages/ai/AiAutopilotPage.tsx`.
- **Code:** `api/business.api.ts` (`getAutoCampaigns`).

## Known issues
Open items in [known-issues](known-issues.md): KI-056, KI-057.

## Suggestions
- Use an approved marketing template for the WhatsApp step and run the job in a background worker.

## Changes to be done
