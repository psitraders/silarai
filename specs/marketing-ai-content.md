---
id: marketing-ai-content
status: current
prefix: MKT
related: [catalog-products, marketing-campaigns, storefront-builder-ai, tenancy-plans]
---
# Marketing — AI Content Tools

## Purpose
AI writing helpers for merchants: social post captions and poster images, product descriptions, reel scripts, campaign messages and suggested replies to customer questions, plus saved reply templates.

## Scope
- **In:** AI social post + poster, product description (page and in-form panel), reel script, marketing message, reply suggestions, reply templates (`ReplyTemplate`), AI usage logging (`AiUsageLog`), `AiSuggestion` log.
- **Out:** AI sales chat (`ai-tenant-chatbot*`, `chatbot-service*`), auto-campaigns (`marketing-auto-campaigns`), AI page generation (`storefront-builder-ai`).

## Functional behaviour
- **Social posts** (`/ai/social-post`): product name + description, platform (Instagram / Facebook / WhatsApp / Twitter), tone (Fun / Professional / Festive / Urgent), language → caption, hashtags, call to action; *Generate poster* creates an image (OpenAI image model, default `dall-e-3`).
- **Product descriptions** (`/ai/product-description` and the panel on the product form): name, category, features, tone, language → WhatsApp text, Instagram text and tags; the panel can insert the text into the description.
- **Reel scripts** (`/ai/reel-script`): product, description, duration 15 / 30 / 60 s, tone → script.
- **Campaign message:** goal + tone (+ context) → message text (campaign form).
- **AI replies** (`/ai/replies`): paste a customer question, pick a tone (Friendly / Premium / Short / Persuasive; the API also takes lead, product and channel) → suggested reply; each suggestion is stored.
- **Reply templates** (`/ai/templates`): saved canned replies with category and tone; create / edit / activate / delete.
- With the Mock provider every tool returns canned text.

## Rules
- **MKT-R3** — AI token usage is logged per user (`AiUsageLog`).
- **MKT-R8** — AI tools never write to the catalogue or send anything by themselves; the merchant copies or applies the result.

## Backend
- **Data:** `Ai/AiUsageLog` (`UserId`, `RequestType` [SocialPost, PosterImage, ProductDescription, ReelScript, ReplySuggestion, StorefrontPage], `TokensUsed`, `Provider`, `WasSuccessful`), `AiSuggestion` (`LeadId`, `Prompt`, `SuggestedReply`, `ToneMode`, `Provider`, `Channel`, `WasUsed`, `WasEdited`), `ReplyTemplate` (`Name`, `Content`, `Category`, `ToneMode`, `IsActive`).
- **API — `MarketingController` `/api/v1/marketing` 🔒:** `POST social-post`, `POST product-description`, `POST reel-script`, `POST generate-poster` → `{imageUrl, error?}`, `POST generate-message`. **`AiSuggestionsController` `/api/v1/ai` 🔒:** `POST suggest`, `GET|POST templates`, `PUT|DELETE templates/{id}`.
- **Logic:** `Application/Ai/Commands` (`GetSocialPostCommand`, `GetAiSuggestionCommand`, `Create/Update/DeleteAiTemplateCommand`, `Queries/GetAiTemplatesQuery`), `Application/Marketing/Commands` (`GeneratePosterCommand`, `GenerateProductDescriptionCommand`, `GenerateReelScriptCommand`, `GenerateMarketingMessageCommand`); `IAiProvider` methods on `OpenAiProvider` (`AI:OpenAI:Model` default `gpt-4o-mini`, `AI:OpenAI:ImageModel` default `dall-e-3`) / `MockAiProvider`.

## Frontend
- **Routes & screens:** `pages/ai/AiSocialPostPage.tsx`, `AiProductDescriptionPage.tsx`, `AiReelScriptPage.tsx`, `AiRepliesPage.tsx`, `AiTemplatesPage.tsx`; `components/ai/AiDescriptionPanel.tsx`.
- **Code:** `api/marketing.api.ts` (`generateSocialPost`, `generatePoster`, `generateProductDescription`, `generateReelScript`, `generateMarketingMessage`), `api/ai.api.ts` (`getSuggestion`, `getTemplates`, `createTemplate`, `updateTemplate`, `deleteTemplate`).

## Known issues
Open items in [known-issues](known-issues.md): KI-021, KI-049.

## Suggestions
- One shared "AI quota" check before every AI call (builder first, per `storefront-builder`).

## Changes to be done
