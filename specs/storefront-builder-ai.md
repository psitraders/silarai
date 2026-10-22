---
id: storefront-builder-ai
status: current
prefix: SB
related: [storefront-builder, storefront-builder-editor, marketing-ai-content, tenancy-plans]
---
# Storefront Builder — AI Page Generation

## Purpose
Merchants describe a page ("an About page for my bakery with our story and FAQ") or sections, and the AI drafts it with the editor's own section packs and the store's real categories, ready to review before it is added to the draft.

## Scope
- **In:** `POST /storefront-builder/ai/generate`, the editor's AI panel, the section catalogue sent to the model, normalisation of the result, usage logging.
- **Out:** generic AI marketing tools (`marketing-ai-content`), editing after apply (`storefront-builder-editor`), Phase 6c *Ask AI* styling (planned, `storefront-builder`).

## Functional behaviour
- Entry points: *Sections → Add sections with AI* (mode *sections*, for the open page) and *Pages → New page with AI* (mode *page*).
- The AI panel replaces the left pane (inspector hidden, undo / publish paused): prompt + examples → *Generate* → read-only preview of the result → *Create page* (creates a custom page and opens it) / *Add N sections* (one undo step) / *Try again*.
- The result uses only available section packs (no `custom-html`, only the store's own template widgets, *Product page* sections only on product designs), the store's real categories and product titles; images are left empty and unknown facts are written as `[placeholders]`.
- Nothing is saved until the merchant applies it — and then only to the draft.

## Rules
- **SB-R23** — AI page generation writes a new custom page or sections for the open page using only the editor's section packs and the store's real categories (never images, raw HTML, prices, reviews or policy claims — placeholders in [brackets] instead, SB-R18). The result is previewed and only saved when the merchant applies it (to the draft). Every generation is logged in `AiUsageLogs` (`StorefrontPage`) against the monthly AI count; the plan limit is not enforced yet.

## Backend
- **API — `StorefrontBuilderAiController` `POST /api/v1/storefront-builder/ai/generate` 🔒** `{prompt ≤ 1000, mode: page|sections, catalogue ≤ 60 KB, pageTitle?, existingSections?}`:
  - system prompt = output contract + value formats per field type + no invented prices / reviews / promises + the editor's catalogue; user prompt = store name / type / description / language, up to 40 active categories (id — name, parent) and 25 product titles;
  - `IAiProvider.GenerateJsonAsync` (OpenAI JSON mode, 3,500 max tokens; `MockAiProvider` returns a fixed 3-section page);
  - result → fresh ids, `$image` values stripped, ≤ 10 sections (page) / ≤ 4 (sections), validated with `PreparePageLayout` (rejected sections dropped and the rest re-checked once; nothing usable → 422; AI failure → 502);
  - every call adds an `AiUsageLog` (`RequestType` `StorefrontPage`, tokens, success flag) and returns `usedThisMonth`. Nothing is saved by this endpoint.

## Frontend
- **Code:** `editor/ai/AiPanel.tsx` (`store.aiPanel`, `openAi`, `sidePanelOpen()` shared with history; result previewed through `store.templatePreview`; *Create page* → `createPage`; *Add sections* → `addSection` × N as one undo step), `ai/catalogue.ts` (`buildCatalogue`: settings by field type, image / icon / html fields left out, blocks with min–max), `ai/normalise.ts` (unknown packs dropped, layouts / block types checked, block defaults merged, pack `v` stamped).

## Known issues
Open items in [known-issues](known-issues.md): KI-021, KI-063.

## Suggestions
- AI suggestions that reuse the merchant's own product photos for image fields.

## Changes to be done
See `storefront-builder` (*Changes to be done* — enforce the monthly AI limit; Phase 6c AI styling).
