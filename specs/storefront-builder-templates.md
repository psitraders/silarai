---
id: storefront-builder-templates
status: current
prefix: SB
related: [storefront-builder, storefront-builder-editor, storefront-builder-commerce]
---
# Storefront Builder — Templates & Template Wizard

## Purpose
Ready-made store designs for common shop types (jewellery, grocery, fashion, bakery, electronics, general) that a merchant picks in a wizard, previews with their own products, colours and fonts, and applies as drafts — each with signature widgets.

## Scope
- **In:** template packs (`templates/<id>/template.ts` + `build.ts` + `widgets/`), the template wizard, `POST apply-template`, signature widgets, demo store designs.
- **Out:** generic section packs and engine (`storefront-builder`), editing after apply (`storefront-builder-editor`).

## Functional behaviour
- **Wizard** (opens on first run, or *Style → Template → Change*, after saving pending edits): "What do you sell?" → template list (made-for matches first) with a live, read-only preview of the store's own logo and products (Home / Catalogue / Product page, desktop / tablet / phone) → colours (suggested palettes, brand colours on the template palette, all palettes) and fonts → on a change: *Keep my pages* or *Use the template's pages* → apply.
- **Templates (2026-10-21):**
  - **Starter** — built-in default (no widgets); shown when nothing is published.
  - **Noor** (luxe · luxe-gold / ivory-gold · luxury-serif; page product view, editorial cards) — widgets `collection-spotlight`, `shop-the-look` (hotspot blocks x/y % + manual product), `craftsmanship-story`, `certification-strip`, `concierge` (WhatsApp video-call link), `gift-finder` (occasion → category, budget → min / max price).
  - **Mandi** (minimal dense · emerald-market / fresh-amber · ecom-clean; compact quick-add popup, bottom-sheet cart, mobile bottom bar) — `quick-add-rows`, `category-chip-rail` (not sticky), `deal-of-the-day` (fixed end or daily midnight countdown), `combo-packs` (sum of live prices, *Add all*, blocked for products needing options / sold out), `free-delivery-bar` (display only).
  - **Bloom** (editorial · rose-gold / blossom · classic-elegant; story popup, overlay cards, masonry) — `lookbook-stories` (full-screen story viewer, arrow keys, no auto-advance), `shop-by-occasion`, `instagram-grid` (merchant-uploaded posts + product, follow link from the Instagram handle), `before-after` (range slider).
  - **Crumb** (soft + food marks · caramel / terracotta · bakery-sc; menu-item popup / page, rounded-centre cards, category rows, bottom-sheet cart) — `menu-board` (dotted price lines), `todays-bake` (daily HH:MM cut-off countdown), `pre-order-banner`, `custom-cake-request` (occasion / date / size / flavour sent as an inquiry; hidden when public inquiries are off), `delivery-slots`.
  - **Volt** (bento / glass · midnight / launch-blue · geometric; spec-sheet product page, tech cards, bento collection, compare on) — `feature-bento`, `spec-compare`, `video-spotlight` (first video URL of the product, `preload=none`, no autoplay), `warranty-strip`.
  - Noor / Mandi / Bloom / Crumb / Volt add *Our story / About*, *FAQ* and *Contact* pages; policy copy is guidance for the merchant to replace.
- **Apply:** drafts only, one save; nothing goes live until Publish (SB-R17).

## Rules
- **SB-R14** — Signature widgets are unlockable in any template (listed first under their own template).
- **SB-R17** — Applying a template writes drafts only, in one save (nothing goes live until Publish). *Keep my pages* replaces only the site document (look, header, footer, behaviour) and keeps menus and pages; *Use the template's pages* also replaces the drafts of Home, the catalogue and product designs and of custom pages with the same address, and adds the template's other pages.
- **SB-R18** — Templates never ship invented reviews or policy claims: review sections show real approved reviews, and delivery / returns / FAQ copy is written as guidance for the merchant to replace.
- **SB-R24** — Sections in templates are stamped with their pack `version`; `$image` values in templates are only Cloudinary / this API's uploads (same check as the server).

## Backend
- **API — `POST /api/v1/storefront-builder/apply-template {mode: keep|replace, site, pages[]}`:** body built by the editor from a template pack; validates everything first, then in one SaveChanges replaces the theme draft and, in `replace` mode, the drafts of the given system pages and of custom pages with the same slug, creating the rest (`IsPublished`, nav / footer flags); rejects `AltProductTemplate` pages. Returns system page ids.
- **Demo designs:** `Persistence/DemoStorefrontDesigns.cs` (Noor → `aradhya-jewels`, Bloom → `priya-boutique`, Crumb → `sugar-crumbs`; generated from `build.ts`; seeded brand colours match each palette; eggless bakery products tagged `veg` + `eggless`).

## Frontend
- **Code:** `templates/<id>/template.ts` (small eager manifest: `shopTypes`, suggested `palettes`, `fontPair`, `styleKit`, `mood`), `templates/<id>/build.ts` (own chunk, `load()` → `TemplateDocs` = site, home, collection, product, extra `pages`; only Starter has a synchronous `build` — `core/templates.ts`: `buildStarter`, `loadTemplateBuild`, `uploadedImage`), `templates/<id>/widgets/*` (manifest + layouts + `editor.ts`); `editor/wizard/TemplateWizard.tsx` (full screen while `store.wizard` is set; `orderTemplates`, `paletteChoice`), `templateDocs.ts`, `useApplyTemplate.ts` (`POST apply-template` → `applyTemplateDocs`: docs become the saved state, system ids from the response, cached custom layouts dropped in replace mode, page queries invalidated; undo history reset). The wizard preview renders `store.templatePreview` read-only in `PreviewApp`.

## Known issues
Open items in [known-issues](known-issues.md): KI-065.

## Suggestions
- Template data manager (SuperAdmin) — deferred; templates stay code packs (D2).

## Changes to be done
See `storefront-builder` (*Changes to be done* — open Phase 4 follow-ups).
