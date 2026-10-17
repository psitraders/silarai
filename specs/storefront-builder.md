---
id: storefront-builder
status: current
context: "§4.3 Storefront, §5.1 (to be added when phase 1 ships)"
---
# Storefront Builder

## Purpose
Lets merchants build their whole storefront — unlimited pages, shared header/footer, product page/popup, collection and cart designs — from modular sections and layouts. They start from a template pack (picked in the template wizard) and style it with style kits, multi-scheme colour palettes and font pairs, without code.

## Scope
- **In:**
  - Builder module (`frontend/src/storefront-builder/`): core engine, `ui/` primitives, packs (sections, headers, footers, product page/popup layouts, product blocks, cards, collection, cart, style kits, palettes, fonts), template packs (Starter, Noor, Mandi, Bloom, Crumb, Volt) with their signature widgets, the template wizard and the editor.
  - Store shell: header/footer slots, product view, cart host.
  - Navigation menus.
  - Backend builder slice: `StorefrontTheme`, `StorefrontPage` layouts, publish, smart values, sanitiser, public site APIs.
- **Out:**
  - Checkout and payments (`orders-payments`)
  - Product and category data (`catalog`)
  - Customer auth and wishlist (`storefront`)
  - Custom domains and Cloudflare worker routing (`storefront`)
  - B2B pricing logic (`b2b-wholesale`)

## Rules
- **SB-R1** — Layouts store product/category *rules or IDs* (`$products`, `$categories`), never prices, stock or product images; data is resolved live (INV-2, CAT-R5).
- **SB-R2** — Public endpoints return only published theme/pages; drafts are visible only to the authenticated tenant. Publish is all-or-nothing.
- **SB-R3** — Every pack has a manifest with `version` + `upgrade()`; the renderer shows a placeholder for unknown/broken packs instead of crashing.
- **SB-R4** — The backend is schema-agnostic: it validates only the JSON envelope and smart values (`$richtext` sanitised, `$link` allow-listed, `$image` from our uploads, `$products`/`$categories` resolved). New packs never require backend changes.
- **SB-R5** — A store with no saved theme renders the built-in **Starter** default. (There are no live stores; the old fixed storefront is replaced, not kept in parallel.)
- **SB-R6** — Packs import only `core/` and `ui/`, never another pack; the rest of the app imports only `storefront-builder/index.ts`. Packs are auto-discovered.
- **SB-R7** — Layouts use only `--sf-*` tokens and container queries and must work in all 5 colour schemes, light/dark palettes and every style kit (`frontend/design.md` §2.2, §13).
- **SB-R8** — Every palette generates all 5 schemes; the editor warns when a text/background pair is below WCAG AA.
- **SB-R9** — Every drag action in the editor has a button/keyboard alternative.
- **SB-R10** — Header and footer are always present and shared by all pages; no other section is required on any page.
- **SB-R11** — The store shell (cart, product view, auth, chatbot) is present on every storefront page, including custom pages; SF-R2 still holds.
- **SB-R12** — Product view mode (popup / page / both) is a store setting; `/{slug}/products/{id}` always resolves (as a page or a popup over the store).
- **SB-R13** — No plan restrictions for now: every pack manifest has a `tier` (all `free`) and the builder checks `canUse()` in one place, so paid tiers can be added later without layout changes.
- **SB-R14** — Signature widgets are unlockable in any template (listed first under their own template).
- **SB-R15** — Merchant links (`$link`) are stored store-relative (`/products`, `/p/about`, `#section-<id>`) and resolved per store, so the same design works on `/{slug}` and on a custom domain.
- **SB-R16** — The editor autosaves drafts only; shoppers see changes after **Publish**. Publishing also copies the palette's primary / secondary / accent to the store's brand colours (used outside the builder: PWA, chatbot widget, emails); the colour pickers live only in the editor.
- **SB-R17** — Applying a template writes drafts only, in one save (nothing goes live until Publish). *Keep my pages* replaces only the site document (look, header, footer, behaviour) and keeps menus and pages; *Use the template's pages* also replaces the drafts of Home, the catalogue and product designs and of custom pages with the same address, and adds the template's other pages.
- **SB-R18** — Templates never ship invented reviews or policy claims: review sections show real approved reviews, and delivery / returns / FAQ copy is written as guidance for the merchant to replace.

## UI
- `storefront-builder/` — `index.ts` (only public entry), `core/`, `ui/`, `shell/`, `packs/`, `templates/starter/`, `editor/`, `dev/Gallery.tsx` (DEV route `/__storefront/gallery`).
- Editor: dashboard route `/storefront/editor` (sidebar *Customise store*; `/pages` redirects there). Panes: Sections · Style · Pages · Menus | live preview (desktop / tablet / phone) | settings. Click-to-select in the preview, layout try-on on hover, section gallery with presets, autosave + Publish.
- Storefront Settings keeps logo, banner, SEO, announcement (Starter only) etc.; colours moved to the editor.
- Product page: a system page in the editor (*Product page*) holding the `product-main` section (gallery + product blocks, 15 layouts) plus any sections; its blocks also fill the product popup. *Style → Store behaviour* sets the product view (popup / page / popup + page), popup layout (15, with a live popup preview), card style (10) and cart style (5) + cart options.
- Template wizard (`editor/wizard/`): opens on first run (nothing saved or published) and from *Style → Template → Change*. "What do you sell?" → templates (made-for matches first) with a live, read-only preview of the store's own logo and products (Home / Catalogue / Product page, desktop / tablet / phone) → colours (suggested palettes, brand colours, all palettes) and fonts → *Keep my pages* or *Use the template's pages* (change only) → apply.
- Section gallery: signature widgets are grouped as "*Template* exclusives", the store's own template first.
- Collections (*All products*): price filter (min / max) in the Top filters, Sidebar filters and Bento layouts.
- *Style → Store behaviour → Compare*: product compare — a "Compare" toggle under every product card and a compare tray (up to 4, compared in a table with live prices and specs). *Style → Product cards → Veg / eggless marks* reads product tags `veg`, `non-veg`, `eggless`.
- *Newsletter* section: email signup; subscribers are Leads tagged `newsletter` (CRM-R3).
- Options catalogue: [`docs/storefront-builder-catalogue.md`](../docs/storefront-builder-catalogue.md).

## Suggestions
- Free-form canvas section (Fluid-Engine style) — out of v1, planned as Phase 6 (plan §11).
- Saved/reusable sections across pages; per-product alternate templates; AI page generation from a prompt.

## Changes to be done
Full plan: [`docs/plan-storefront-builder.md`](../docs/plan-storefront-builder.md). Decisions D1–D11 agreed 2026-10-11 (plan §9); D12 to be confirmed per phase.
- [ ] Phase 3 follow-up (🔌 confirm per D12): product 360° and per-product shop-the-look hotspots on the product page; order note in the cart (Razorpay verify has no notes field).
- [ ] Phase 4 follow-ups: Mandi "Reorder favourites" (needs order history, D12); a sticky category chip rail (a section can't stick on its own — needs a shell slot); Bloom "Size guide & fit finder" as a section (the product page already has a size-guide block); verify the hand-written `AddCouponShowOnStorefront` migration and the seeded demo designs on a fresh database.
- [ ] Phase 5 — Pro: undo/redo, version history, saved sections, alternate product templates, AI page generation, preview link, template data manager, paid tiers when decided.
- [ ] Phase 6 — Free-form canvas section.
