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
- **SB-R19** — Every publish keeps a snapshot of what went live (site document + every page's published layout); only the newest 10 are kept. Restoring a version writes the **drafts** only (nothing goes live until Publish): the site document and the version's pages (matched by id, then page type / address; custom pages deleted since are re-created); pages added since are left as they are. Undo can't reverse a restore.
- **SB-R21** — A store can have extra product designs besides the Product page. Each is assigned to categories and/or products; a product uses its own pick, else its category's (a category's pick also covers its sub-categories unless they have their own), else the Product page. A category or product belongs to at most one design — assigning it moves it. Assignments apply immediately; a design only reaches shoppers once published. The product popup uses the same design as the page.
- **SB-R22** — One shareable preview link per store (`/{slug}?preview={token}`) shows the saved drafts, read-only, to anyone with it, until the merchant turns it off or makes a new one (the old link then shows the live store with a notice). Draft responses are never cached and the preview is marked `noindex`; buying still works normally.
- **SB-R23** — AI page generation writes a new custom page or sections for the open page using only the editor's section packs and the store's real categories (never images, raw HTML, prices, reviews or policy claims — placeholders in [brackets] instead, SB-R18). The result is previewed and only saved when the merchant applies it (to the draft). Every generation is logged in `AiUsageLogs` (`StorefrontPage`) against the monthly AI count; the plan limit is not enforced yet.
- **SB-R20** — Undo / redo covers edits made in this editor visit (site and every page, typing merged into one step) and is not saved; it starts again after a template is applied or a version is restored. Saved sections are independent copies — editing or deleting a saved section never changes pages that use it; at most 50 per store.

## UI
- `storefront-builder/` — `index.ts` (only public entry), `core/`, `ui/`, `shell/`, `packs/`, `templates/starter/`, `editor/`, `dev/Gallery.tsx` (DEV route `/__storefront/gallery`).
- Editor: dashboard route `/storefront/editor` (sidebar *Customise store*; `/pages` redirects there). Panes: Sections · Style · Pages · Menus | live preview (desktop / tablet / phone) | settings. Click-to-select in the preview, layout try-on on hover, section gallery with presets, autosave + Publish.
- Storefront Settings keeps logo, banner, SEO, announcement (Starter only) etc.; colours moved to the editor.
- Product page: a system page in the editor (*Product page*) holding the `product-main` section (gallery + product blocks, 15 layouts) plus any sections; its blocks also fill the product popup. *Style → Store behaviour* sets the product view (popup / page / popup + page), popup layout (15, with a live popup preview), card style (10) and cart style (5) + cart options.
- Template wizard (`editor/wizard/`): opens on first run (nothing saved or published) and from *Style → Template → Change*. "What do you sell?" → templates (made-for matches first) with a live, read-only preview of the store's own logo and products (Home / Catalogue / Product page, desktop / tablet / phone) → colours (suggested palettes, brand colours, all palettes) and fonts → *Keep my pages* or *Use the template's pages* (change only) → apply.
- Section gallery: the store's **Saved** sections first (rename / delete on the card), then signature widgets grouped as "*Template* exclusives" (the store's own template first), then the generic groups.
- Undo / redo: top-bar buttons and Ctrl/⌘+Z, Ctrl/⌘+Shift+Z or Ctrl+Y (ignored while typing in a field); undoing a page edit switches to that page.
- Version history (top-bar clock): replaces the left pane with the last 10 publishes (date, who, page count, *Live* on the newest); picking one previews it read-only (page picker for Home / catalogue / product / custom pages) and *Restore* copies it into the draft after a confirm.
- *Save for reuse*: in the section toolbar (preview) and the section inspector; asks for a name.
- *Pages → Other product designs*: create (starts as a copy of the Product page), edit like the Product page (sample product), choose categories / products, duplicate, delete.
- *Share preview* (top bar): create / copy / make a new link / turn off.
- *Generate with AI*: *Sections → Add sections with AI* and *Pages → New page with AI* open the AI panel in the left pane (prompt + examples → read-only preview → *Create page* / *Add sections* / *Try again*).
- Collections (*All products*): price filter (min / max) in the Top filters, Sidebar filters and Bento layouts.
- *Style → Store behaviour → Compare*: product compare — a "Compare" toggle under every product card and a compare tray (up to 4, compared in a table with live prices and specs). *Style → Product cards → Veg / eggless marks* reads product tags `veg`, `non-veg`, `eggless`.
- *Newsletter* section: email signup; subscribers are Leads tagged `newsletter` (CRM-R3).
- Options catalogue: [`docs/storefront-builder-catalogue.md`](../docs/storefront-builder-catalogue.md).

## Suggestions
- Template data manager (SuperAdmin) — deferred; templates stay code packs (D2).
- Enforce the monthly AI limit for every AI feature, not only the builder (see *Changes to be done*).
- AI suggestions that reuse the merchant's own product photos for image fields (today AI leaves images empty).

## Changes to be done
Full plan: [`docs/plan-storefront-builder.md`](../docs/plan-storefront-builder.md). Decisions D1–D11 agreed 2026-10-11 (plan §9); D12 to be confirmed per phase.

**Status — paused 2026-10-18 after Phase 5b.** Shipped: Phases 1–4, 5a (undo/redo, version history, saved sections) and 5b (extra product designs, preview link, AI page generation). The merchant is using the builder as it is; work resumes with the items below.

**1. Before relying on it (setup / verification)**
- [ ] Apply the hand-written migrations in order and check the tables / columns exist: `20261016120000_AddCouponShowOnStorefront`, `20261017120000_AddStorefrontVersionsAndSavedSections`, `20261018120000_AddStorefrontPhase5b` (model snapshot was edited by hand — run `dotnet ef migrations add Check` once and confirm it comes out empty, then delete it).
- [ ] `dotnet build` clean (Phase 5a / 5b backend was written without a .NET SDK; the only compile error found so far — the raw-string prompt in `StorefrontBuilderAiController` — is fixed).
- [ ] Re-seed the demo stores (`cleanup-demo-data.sql`, then the seeder) and check `aradhya-jewels`, `priya-boutique`, `sugar-crumbs`; regenerate `DemoStorefrontDesigns.cs` whenever those templates change.
- [ ] Smoke test: publish → version appears in history → restore → publish; save / insert / rename / delete a saved section; undo / redo across pages; extra product design assigned to a category → its products open with it (page and popup); preview link create / copy / new link / turn off (old link shows the live store); AI *New page* and *Add sections* with and without an OpenAI key (mock).

**2. Known limits of what shipped**
- [ ] Monthly AI limit is **not enforced** (decided 2026-10-18: log only). `MaxAiSuggestionsPerMonth` exists on plans but nothing checks it — Basic is 0. Enforce it (builder first, then all AI features) before AI is offered widely.
- [ ] AI never fills image fields and may leave [placeholders]; consider a “still has placeholders” warning on Publish.
- [ ] Stores published before Phase 5a have no versions until their next publish.
- [ ] The preview link shows only *saved* drafts (the editor saves before showing / copying the link); one link per store, no expiry date or password.
- [ ] Assigning many products to a product design loads each one by id in the editor (capped at 200).

**3. Open follow-ups from earlier phases**
- [ ] Phase 3 (🔌 confirm per D12): product 360° and per-product shop-the-look hotspots on the product page; order note in the cart (Razorpay verify has no notes field).
- [ ] Phase 4: Mandi "Reorder favourites" (needs order history, D12); a sticky category chip rail (needs a shell slot — a section can't stick on its own); Bloom "Size guide & fit finder" as a section (the product page already has a size-guide block).
- [ ] Paid tiers when decided (`canUse()` is the single gate, SB-R13).

**4. Next phases**
- [ ] Phase 6 — Styles & polish (added 2026-10-18; the merchant sees minor layout and element misplacement issues):
  - 6a **Audit & fix**: collect the merchant's screenshots of the issues first; review every pack layout at phone / tablet / desktop across style kits, schemes and long / missing content; fix spacing, alignment, overflow and misplaced elements; one shared spacing rhythm between sections; screenshot checks of the dev gallery (Playwright) so fixes stay fixed.
  - 6b **Merchant style controls**: a *Design* group on every section — space above / below, content width, text alignment, background (colour, image + overlay), corner radius, element gap, heading size, hide per device — stored as one common `style` object on the section and applied by `SectionFrame` through tokens (no raw CSS; backend unchanged, SB-R4).
  - 6c **AI styling**: *Ask AI* on a section or the page ("more spacious", "centre the heading", "fix the phone layout") returns a change to the same `style` object and settings, previewed and applied as one undoable step; logged like AI page generation (and under the AI limit once enforced).
- [ ] Phase 7 — Free-form canvas section (plan §11).
