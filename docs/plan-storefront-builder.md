# Plan — Storefront Builder (templates, sections, multi-colour themes)

Status: **v3 — decisions agreed (2026-10-11). Phase 1 shipped 2026-10-11; Phase 2 (builder core) shipped 2026-10-13; Phase 3 (commerce layouts) shipped 2026-10-13; Phase 3 quick wins + Phase 4a (wizard, apply-template, Noor, Mandi) shipped 2026-10-16; Phase 4b (Bloom, Crumb, Volt, newsletter, compare, food marks) shipped 2026-10-17; Phase 5a (undo/redo, version history, saved sections) shipped 2026-10-17; Phase 5b (alternate product templates, preview link, AI page generation) shipped 2026-10-18. Development paused 2026-10-18; next: Phase 6 (pending list in `specs/storefront-builder.md` → Changes to be done)** (details in `context.md` §4.9 / §5.10).

**Phase 4a notes:** templates are code packs with a tiny eager manifest and a lazily loaded `build.ts`; the server only stores what the editor sends (`POST apply-template`, drafts only). D12 for Phase 3 follow-ups: price filter, reviews summary and live coupons built; newsletter will store subscribers as CRM Leads tagged `newsletter` when it is built. See the catalogue §10 note for differences from the plan.

**Phase 1 notes (deviations from the plan, by necessity):**
- The EF migration is **not generated yet**: NuGet is blocked in the build environment, so run `dotnet ef migrations add AddStorefrontBuilder` locally (INV-7).
- `StorefrontPage.Content` and the `StorefrontSettings` colour columns are **kept until Phase 2**, because the old Pages screen and Storefront Settings still write them. Starter uses the store's colours.
- The demo stores need no seed change in Phase 1: with nothing published they render the Starter design automatically. The cleanup script also clears the new tables.
- Backend adds the `HtmlSanitizer` (Ganss.Xss) NuGet package: the server-side counterpart of `dompurify`.

**Phase 3 notes (what shipped and where it differs from the plan):**
- **Shipped counts:** product view popup / page / both, 22 product blocks, 15 product-page layouts (`product-main` section in the Product page template) and 15 popup layouts (`quickview` pack, content = the product template's blocks), 10 card styles, 8 collection layouts (`all-products`), 5 cart styles + cart options (free-delivery bar, upsell row, coupon toggle, auto-open), sections `related-products`, `recently-viewed`, `timeline`, `team`, `coupon-strip`, `enquiry-form`. No backend changes (product / quick-view templates already existed as page types).
- **Packs with many styles are one pack with many layouts** (`card/card`, `quickview/quickview`, `cart/cart`), like the header and footer; `behaviour.cardStyle / quickviewLayout / cartStyle` hold layout ids. `behaviour.productPageLayout` and `collectionLayout` were removed: those layouts belong to the Product and Catalogue templates.
- **Done without new backend data (D12):** specs come from "Label: value" lines in product descriptions (spec sheet, spec card, tech card); "Shop the look" uses a shoppable look card of same-category products instead of per-product hotspots; "Video first" plays merchant video URLs from the product images and otherwise shows photos; colour swatches work when variant values are colour names; the coupon strip shows merchant-typed codes; recently viewed is kept in the shopper's browser. The EMI hint on the tech card was left out (it would claim an offer the merchant may not have). The newsletter and store-wide reviews summary wait for D12 (spec *Changes to be done*).
- **Fixes on the way:** cards and quick-adds open the product for products with variants ("Choose options"); cart lines are keyed by product + variant and orders now carry `variantInfo`; deep-linked / hand-picked products get their images (detail response normalised).
- **Bundle:** editor-only metadata moved to `editor.ts` per pack; product-view parts and the chatbot load on demand — storefront chunk ~39 kB gzip (49 kB after Phase 2).

**Phase 2 notes (what shipped and where it differs from the plan):**
- **Editor** at `/storefront/editor` (*Customise store*), replacing the old Pages screen (`PagesPage.tsx`, `PagesController`, `api/pages.api.ts` and the legacy public `pages` endpoints are deleted). The preview is a same-origin iframe with its own React root, rendered at the real device width and scaled to fit.
- **Shipped counts:** 13 headers, 10 footers, 24 sections with 69 layouts, ~40 fine-tune options (the catalogue's "~60" counted some options that need Phase 3 parts — card styles, cart, product view — so those stay with Phase 3), 12 palettes + custom with a WCAG contrast report, 10 font pairs, navigation editor (main 3 levels, footer 2 levels), page templates (About, FAQ, Contact, Policy, Sale landing).
- **Colour columns kept, not dropped:** `StorefrontSettings.ThemeColor / SecondaryColor / AccentColor` are used outside the builder (PWA manifest, chatbot widget, emails, order confirmation, onboarding). Instead of dropping them, the colour pickers moved into the editor and **Publish copies the palette's colours into these columns**, so everything stays consistent.
- **`StorefrontPage.Content` dropped** in code. The EF migration is still open (see the spec's *Changes to be done*): it must drop the raw-SQL constraint `UQ_StorefrontPages_TenantSlug` before altering `Slug`.
- **Links are store-relative** (SB-R15) so designs work on custom domains.
- **Not in Phase 2:** undo/redo and version history (Phase 5), product view mode / card / cart / collection layouts (Phase 3), "Template exclusives" (Phase 4).
- **Bundle:** the storefront chunk grew to ~49 kB gzip because the registry loads every manifest (with editor metadata) eagerly; Phase 3 splits editor-only metadata out.

Related documents:
- Full list of options: [`storefront-builder-catalogue.md`](storefront-builder-catalogue.md)
- Spec: [`specs/storefront-builder.md`](../specs/storefront-builder.md)
- UI rulebook: [`frontend/design.md`](../frontend/design.md)

**What changed in v2 (your feedback):**
1. Many more theme style options: 10 style kits plus about 60 fine-tune options.
2. Header and footer are shared by all pages and each has many layouts (13 and 10).
3. Unlimited pages; any section on any page, in any order (no required hero). Products can open as a **popup or a standalone page**, with 15 layouts each.
4. 5 named templates — **Noor, Bloom, Crumb, Mandi, Volt** — each with its own signature widgets.
5. A dedicated section (§5) on keeping the builder **modular in code** and isolated from other modules.

**What changed in v3 (decisions):**
- **No plan restrictions for now.** Every template, palette, option and section is free. A single "tier" hook stays in place so templates can later move to paid plans without code changes (§6.4).
- **Signature widgets can be unlocked in any template.**
- **No live stores yet.** We do a clean cut-over: the old fixed storefront and the old page editor are *replaced*, not kept side by side, and the demo seed data is re-applied using templates (§7, §8).
- **No free-form canvas in v1, but it is planned.** The architecture keeps room for it as a later "Freeform section" pack (§11).
- **`@dnd-kit` and `dompurify` approved,** on the condition that nothing breaks or feels clunky (rules in §7).

---

## 1. Goal

Give merchants a **super-premium "build my own website" experience**:
- Pick a beautiful template.
- Make it theirs with colours, fonts and styles.
- Create as many pages as they like from a rich library of sections, each with several layouts.
- Choose how products are shown.

All of this happens with no code and works on a phone.

---

## 2. Where we are today (short)

| Area | Today |
|---|---|
| Home storefront | One fixed 4,000-line page (`PublicStorefrontPage.tsx`) with a fixed order of parts |
| Colours | 3 colours (`ThemeColor`, `SecondaryColor`, `AccentColor`) |
| Custom pages | One HTML blob each, no products, no cart, HTML not sanitised |
| Product view | Always a popup (the deep link `/{slug}/products/{id}` opens the popup over the store) |
| Fonts | Inter, but not actually loaded |

---

## 3. The building blocks (simple words)

```
STORE
 ├── TEMPLATE PACK  (Noor · Bloom · Crumb · Mandi · Volt)  ← starting look + its own signature widgets
 ├── THEME
 │    ├── Style kit + fine-tune options   (buttons, cards, corners, motion, dividers…)
 │    ├── Palette → 5 colour schemes      (light · soft · contrast · brand · accent)
 │    └── Font pair
 ├── HEADER  (shared, one of 13 layouts, + its own blocks)
 ├── FOOTER  (shared, one of 10 layouts, + its own blocks)
 ├── PAGES  (unlimited)
 │    ├── Home, About, Diwali Sale, Wholesale, Our Story …  ← any sections, any order
 │    │      └── SECTION  (layout + colour scheme + settings)
 │    │             └── BLOCKS  (heading, text, button, image, product, icon … add / reorder inside)
 └── SYSTEM PAGES  (one design each, applied to every item)
      ├── Product page      (15 layouts, built from product blocks)
      ├── Product popup     (15 layouts, same product blocks)
      ├── Collection page   (8 layouts)
      ├── Cart              (5 styles)
      └── Search · 404
```

| Word | Meaning |
|---|---|
| **Template pack** | A complete starting store: theme, header/footer, pages, product and collection designs, plus **signature widgets** found only in it |
| **Style kit** | A one-click preset of all style options (Minimal, Luxe, Bold, Glass…) |
| **Colour scheme** | One of 5 colour combinations inside a palette. Each section picks one, so a page can mix light, tinted, dark and brand bands and still match |
| **Section** | A full-width band of the page (Hero, Product collection, FAQ…), with several **layouts** |
| **Block** | A small piece inside a section (a heading, a button, a product) that the merchant can add, remove and reorder |
| **System page** | A design used for *every* product, category or cart, rather than one page |

Everything selectable — layouts, kits, palettes, fonts and templates — is listed in the **catalogue**.

---

## 4. What the merchant experiences

### 4.1 First run — template wizard (about 1 minute)
1. "What do you sell?" (Jewellery · Fashion · Beauty · Bakery & food · Grocery · Electronics · Other).
2. A **template gallery** with live previews built from *their own* logo and products, plus a "Preview full store" button.
3. Pick a palette (2 suggested by the template, 12 presets, or custom) and a font pair.
4. They land in the editor with Home, About, FAQ and Contact already designed. Nothing is public until **Publish**.

### 4.2 The editor — "premium feel" features

| Feature | What it does |
|---|---|
| **Click-to-edit preview** | Hover shows an outline; clicking selects. A floating toolbar offers move ↑↓, duplicate, hide, colour scheme and delete |
| **Layout switcher with live try-on** | Hovering a layout thumbnail previews it instantly on the page; a click applies it. Content is kept |
| **Section gallery** | Searchable, grouped (Hero · Products · Content · Media · Trust · Conversion · Contact), each with 2–4 **pre-filled presets** and a "*Template* exclusives" group |
| **Blocks inside sections** | Add, reorder or remove headings, buttons, images and products within a section |
| **Style panel** | Pick a style kit, then fine-tune about 60 options with instant preview |
| **Device preview** | Desktop, tablet and mobile, plus per-section "show on desktop / mobile / both" |
| **Autosave + Publish** | Draft saves automatically, "Saved ✓" shows, and Publish is the only primary button |
| **Undo/redo + version history** | Phase 5: restore any of the last 10 published versions |
| **Pages & navigation** | Create unlimited pages (blank, duplicate or from a page template), set SEO per page, and build header/footer menus by dragging pages, categories and links (3 levels for mega menus) |
| **Accessible by design** | Every drag has ↑/↓ buttons and keyboard support; the contrast checker warns on unreadable colours |
| **Mobile editing** | On phones the 3 panels become 3 tabs: *Sections · Preview · Settings* |

### 4.3 Product view choice (popup or page)
In **Style → Store behaviour** the merchant chooses whether a product opens as a **popup**, a **standalone page**, or a **popup with a "View full details" link**.
- Each mode has **15 layouts**.
- Both are made of the same **product blocks** (gallery, price, variant picker, buy buttons, delivery info, size guide, reviews…), so content set once works in both.
- The default comes from the chosen template (for example Noor and Volt use a page, Bloom, Crumb and Mandi use a popup).

---

## 5. Keeping it modular (code level) — **key requirement**

### 5.1 One isolated feature module

```
frontend/src/storefront-builder/            ← everything for this feature lives here
  index.ts                                  ← the ONLY entry point the rest of the app may import
  core/                                     ← stable engine, rarely changes
    types.ts                                  shared contracts (Section, Block, Layout, Pack, Theme …)
    registry.ts                               auto-discovers packs (no manual list)
    renderer/                                 PageRenderer, SectionRenderer, BlockRenderer
    theme/                                    tokens engine: palette → schemes → CSS variables; style kits
    schema-form/                              builds editor forms from a section's schema
    data/                                     hooks that give sections products/categories (no direct API calls in packs)
  ui/                                       ← storefront UI primitives used by all layouts
    Button, Price, ProductImage, Badge, VariantPicker, QuantityStepper, ProductCard (renders the chosen card style)
  packs/                                    ← every pack is a self-contained folder
    sections/<section-id>/                    shared section library (hero, faq, product-collection …)
      manifest.ts                               id, name, group, settings schema, blocks allowed, presets, version, upgrade()
      layouts/<layout-id>.tsx                   one file per layout
      thumbnails/<layout-id>.svg
    headers/<layout-id>/   footers/<layout-id>/
    product-page/<layout-id>/   quickview/<layout-id>/   product-blocks/<block-id>/
    cards/<style-id>/   collection/<layout-id>/   cart/<style-id>/
    style-kits/<kit-id>.ts   palettes/<id>.ts   fonts/<id>.ts
  templates/                                ← one folder per template pack
    noor/
      manifest.ts                             name, style kit, palettes, fonts, default layouts, default pages (JSON)
      widgets/<widget-id>/                    Noor's signature widgets (same shape as a section pack)
      preview.webp
    bloom/  crumb/  mandi/  volt/
  shell/                                    ← StoreShell: header/footer slots, cart, product view, auth, chatbot
  editor/                                   ← the builder UI (dashboard side)
```

### 5.2 The rules that keep modules from disturbing each other

| Rule | Why it matters |
|---|---|
| **Auto-registration.** Packs are discovered with Vite `import.meta.glob('**/manifest.ts')`; adding a folder registers it, with no shared list to edit | Two developers adding two layouts never touch the same file |
| **One contract per kind.** Every layout gets the same props (`settings`, `blocks`, `scheme`, `context`) and returns UI | Swap or add layouts without touching the renderer or editor |
| **No pack imports another pack.** Packs import only `core/` and `ui/`; enforced by an ESLint `no-restricted-imports` rule | Deleting or rewriting one pack can't break another |
| **App ↔ builder boundary.** The rest of the app imports only `storefront-builder/index.ts`; the builder imports only shared basics (`api/client`, `utils/*`, `context/CartContext`) | The builder never reaches into dashboard pages and vice versa |
| **No data fetching in layouts.** Layouts get data through `core/data` hooks | Layouts stay pure, testable and fast; API changes happen in one place |
| **Tokens only.** Layouts use `--sf-*` variables and `ui/` primitives, never hard-coded colours | Every layout automatically follows every style kit, palette and scheme |
| **Lazy loading per pack.** Each layout and template is a separate code chunk | The live store downloads only the layouts it actually uses |
| **Versioned settings.** Each manifest has `version` + `upgrade()`; unknown or broken sections render a placeholder instead of crashing | Old saved stores keep working after a layout changes |
| **Backend is schema-agnostic.** The server stores layout JSON and checks only its envelope; it never knows individual sections | New layouts, sections or templates need **zero backend changes** |
| **Dev gallery.** A dev-only route renders every layout × style kit × palette | Visual QA for 150+ layouts in one place |

### 5.3 How-to recipes (what a developer touches)

| Task | Files touched |
|---|---|
| Add a layout to an existing section | 1 new `layouts/x.tsx` + 1 thumbnail |
| Add a new section | 1 new folder under `packs/sections/` |
| Add a header/footer/product-page/popup layout | 1 new folder in that pack |
| Add a palette, font pair or style kit | 1 data file |
| Add a new template | 1 new folder under `templates/` (manifest + widgets + preview) |
| Change a product block (e.g. variant picker) | Only `packs/product-blocks/variant-picker/` — both popup and page pick it up |
| Change how products are fetched | Only `core/data` |

---

## 6. Backend plan (ASP.NET Core) — a separate feature slice

New files only, plus small additions. **Existing controllers stay untouched**:
- `Api/Controllers/v1/StorefrontBuilderController.cs` (merchant, authenticated)
- `Api/Controllers/v1/PublicStorefrontLayoutController.cs` (public)
- `Application/StorefrontBuilder/*` (layout service, binding resolver, sanitiser, validator)
- `Domain/Storefront/StorefrontTheme.cs` (+ `StorefrontPageVersion.cs` in phase 5)

### 6.1 Data

| What | Where |
|---|---|
| Theme: template id, style kit + overrides, palette (incl. custom), font pair, store-behaviour options | New `StorefrontTheme` (1 per store, `DraftJson` + `PublishedJson`) |
| Header + footer + navigation menus | Same `StorefrontTheme` record (draft/published together) |
| Pages (unlimited) | Existing `StorefrontPage` + new columns: `PageType` (Home, Custom, ProductTemplate, QuickViewTemplate, CollectionTemplate, Cart, Search, NotFound), `DraftLayoutJson`, `PublishedLayoutJson`, `PublishedAt`, `SeoTitle`, `SeoDescription`, `OgImageUrl` |
| Old HTML `Content` column, old colour columns on `StorefrontSettings` | Removed in the same migration (no live stores to keep). SEO, GA4, favicon, loader, B2B and inquiry settings stay on `StorefrontSettings` |
| Version history *(phase 5)* | `StorefrontPageVersion` (last 10 publishes) |

The layout JSON stays simple and readable:

```json
{ "schemaVersion": 1,
  "sections": [
    { "id": "s1", "type": "hero", "layout": "split-right", "scheme": "contrast", "visibility": "all",
      "settings": { "heading": "Fresh cakes daily", "image": { "$image": "https://res.cloudinary.com/…" } },
      "blocks": [ { "id": "b1", "type": "button", "settings": { "label": "Shop now", "link": { "$link": "/p/cakes" } } } ] },
    { "id": "s2", "type": "product-collection", "layout": "carousel", "scheme": "light",
      "settings": { "title": "Birthday cakes", "products": { "$products": { "source": "category", "categoryId": "3f2a…", "limit": 8 } } } }
  ] }
```

### 6.2 "Smart values": how the server stays schema-agnostic

The server never needs to know what a "hero" is. It only understands **4 kinds of special values**, wherever they appear:

| Value | Server does |
|---|---|
| `{"$products": {...}}` / `{"$categories": {...}}` | Looks up live products or categories (featured / category / hand-picked / newest / on-sale) and fills them in on public requests — prices are never stored (INV-2) |
| `{"$richtext": "<p>…</p>"}` | Sanitises the HTML on save (allow-list) |
| `{"$link": "…"}` | Allows only `https`, `mailto`, `tel`, `wa.me` or internal paths |
| `{"$image": "…"}` | Allows only our Cloudinary uploads |

### 6.3 APIs

| Endpoint | Purpose |
|---|---|
| `GET/PUT /api/v1/storefront-builder/theme` | Read / autosave theme + header + footer + menus (draft) |
| `GET/POST /api/v1/storefront-builder/pages`, `GET/PUT/DELETE …/pages/{id}`, `POST …/pages/{id}/duplicate` | Unlimited pages (draft layout, SEO, nav flags) |
| `POST /api/v1/storefront-builder/publish` | Publishes theme + chosen pages together (all-or-nothing) |
| `POST /api/v1/storefront-builder/apply-template` | Apply a template pack (keep content / replace) |
| `GET /api/v1/storefront-builder/preview-data` | Products and categories for the editor preview |
| `GET /api/v1/public/{slug}/site` | Published theme + header + footer + menus (cached) |
| `GET /api/v1/public/{slug}/site/pages/{pageSlug or "home"}` | Published page with smart values filled in (one call) |
| `GET /api/v1/public/{slug}/site/templates/{product or quickview or collection}` | Published system-page design |
| `POST /api/v1/business/upload?type=section` *(existing endpoint, new type)* | Image uploads for sections |

Existing public endpoints (`/public/{slug}`, `/products`, `/categories`, `/pages`, checkout) **stay as they are**.

### 6.4 Safety, performance, SEO

**Safety**
- Validate the JSON envelope: known shape, ids, max 60 sections per page, max 300 KB per page.
- Sanitise `$richtext`. This also fixes today's unsanitised custom pages.
- Tenant isolation (INV-1): new entities are `TenantEntity`; consider moving `StorefrontPage` to `TenantEntity` as well.
- **Plan limits:** none for now (D3). Every template manifest has a `tier` field (all `free` today). The builder asks one function, `canUse(item)`, which today always says yes. Moving a template to a paid plan later means changing its `tier` and wiring `canUse` to `SubscriptionPlan` (INV-8) — no layout code changes.

**Performance**
- Public responses cached (`max-age=300`); publish bumps a version so changes show at once.
- Product smart values are capped at 24 items per section.

**SEO**
- The sitemap includes all published pages.
- The Cloudflare worker serves OG tags per page and per product page.
- Standalone product pages get proper meta tags; this is a real SEO gain over popups.

**Migration**
- One EF migration (INV-7: added with `dotnet ef migrations add`, applied manually).

---

## 7. Frontend plan

1. **Shell first.** Pull cart, product view, auth modals and chatbot out of `PublicStorefrontPage.tsx` into `shell/`. They become available on every page, including custom pages.
2. **UI primitives.** Build `ui/` (Button, Price, ProductCard, VariantPicker…) on `--sf-*` tokens. The style options (button shape, card style, badges…) are applied here, once.
3. **Theme engine.** Implement palette → 5 schemes → CSS variables, plus style kit → component tokens (3-layer tokens: primitive → semantic → component, per the design-system skill).
4. **Clean cut-over (D10).** There are no live stores, so the old storefront page is **replaced**, not kept in parallel. Phase 1 ships a small **Starter** default built from the first core packs (classic header, columns footer, hero, product collection, category grid, all products, rich text, classic-split popup, standard card, cart drawer). It is used by any store without a saved theme. `PublicStorefrontPage.tsx` and `StorefrontCustomPage.tsx` are deleted in Phase 1 once their parts are moved into packs and the shell. The old `PagesPage.tsx` editor (blocks / HTML / AI) is deleted in Phase 2, when the new editor replaces it.
5. **Renderer + routes.** `/{slug}`, `/{slug}/p/{page}`, `/{slug}/products/{id}` (page or popup per setting), `/{slug}/category/{c}`, and the custom-domain routes all go through `PageRenderer` inside `StoreShell`.
6. **Editor.** Built in `editor/`, opened from a new dashboard route (*Online Store → Customize*). It replaces the current *Pages* screen.
7. **New libraries (D6 — approved, with guard-rails so nothing breaks or feels clunky):**

| Library | Loaded where | Guard-rail |
|---|---|---|
| `@dnd-kit/core` + `@dnd-kit/sortable` | **Editor only** (its own lazy chunk; never downloaded by shoppers) | Keyboard and ↑/↓ alternatives always present. 6 px drag threshold so taps don't start drags. Smooth drop animation; respects reduced motion |
| `dompurify` | Storefront, only when a page actually has rich text (lazy) | One shared `sanitize()` helper in `core/`; the server sanitises too, so this is a second safety net |
| TipTap (rich text) | Not added now | Start with a small built-in formatter (bold, italic, link, list); revisit if merchants need more |

The bundle size of the storefront chunk is checked before and after (`vite build` report) as part of Phase 1 done.

8. **Seed data (D10).**
   - In Phase 1 the demo stores are re-seeded on the Starter default.
   - From Phase 4 each demo store gets a matching template, with layouts generated from that template's default pages:

| Store | Template |
|---|---|
| `priya-boutique` | **Bloom** |
| `sugar-crumbs` | **Crumb** |
| `aradhya-jewels` | **Noor** |

`cleanup-demo-data.sql` is extended to clear the new tables, so the local database can be wiped and re-seeded cleanly.

---

## 8. Phases

| Phase | What ships | Merchant sees |
|---|---|---|
| **0 — Agree** | This plan, catalogue, spec, `design.md`, decisions §9 | – |
| **1 — Foundation** | Backend slice (theme/pages/publish/public APIs, smart values, sanitiser) + migration · module skeleton, auto-registry, ESLint boundaries, theme engine, `ui/` primitives, shell extraction, renderer + routes, **Starter** default, dev gallery · old storefront pages removed · demo stores re-seeded | New storefront engine live on the Starter look (not editable yet) |
| **2 — Builder core** | Editor replaces the old Pages screen (pages, sections, blocks, layout try-on, presets, autosave, draft/publish) · style kits + all fine-tune options · palettes + schemes + custom + contrast check · fonts · 13 headers, 10 footers, navigation editor · ~20 core sections | Builds any page their way |
| **3 — Commerce layouts** | Product view mode · 15 popup + 15 page layouts · product blocks · 10 card styles · 8 collection layouts · 5 cart styles · remaining core sections | Chooses how products look and open |
| **4 — Templates** | Wizard + gallery · **4a: Noor + Mandi** · **4b: Bloom + Crumb + Volt** · signature widgets (unlockable in any template) · apply-template (keep/replace content) · demo stores re-seeded on Bloom / Crumb / Noor | Picks a premium look in a minute |
| **5 — Pro** | Undo/redo, version history, saved sections, per-product alternate templates, AI "generate a page from a prompt" (sections JSON), shareable preview link, SuperAdmin template data manager, paid-plan tiers when you decide them | Power features |
| **6 — Styles & polish** | Audit + fix of every layout (phone / tablet / desktop), shared spacing rhythm, screenshot checks · per-section *Design* controls (spacing, width, alignment, background, radius, per-device) · AI styling of a section or page (added 2026-10-18) | Fixes and fine-tunes how each section looks |
| **7 — Freeform (later)** | Free-form canvas section (§11) | Places blocks freely inside a section |

Each phase ends with:
- `context.md`, spec and `changes.md` updated
- The dev gallery checked
- Real-phone testing
- The demo stores re-seeded and checked end to end

---

## 9. Decisions

| # | Question | Status / recommendation |
|---|---|---|
| D1 | Required parts on Home? | ✅ Header + footer only; everything else is free |
| D2 | Where do templates live? | ✅ Code packs (they contain signature widgets); their *data* can move to DB later (Phase 5) |
| D3 | Plan gating | ✅ **No restrictions for now** — all templates, options and unlimited pages for everyone. A `tier` field + `canUse()` hook is kept so you can pick paid templates later |
| D4 | Custom HTML section + `CustomCss` | ✅ Available to all (follows D3), always sanitised, no scripts |
| D5 | Dark palettes | ✅ Included (Midnight, Launch Blue) |
| D6 | New libraries | ✅ `@dnd-kit` (editor-only chunk) + `dompurify` (lazy). TipTap not added. Guard-rails in §7 |
| D7 | Old block/HTML/AI page editor | ✅ Removed in Phase 2 (replaced by the new editor; follows D10) |
| D8 | Shareable preview link | Phase 5 |
| D9 | Signature widgets in other templates | ✅ **Unlockable in any template**; listed first under their own template |
| D10 | Existing stores | ✅ **None yet** — clean cut-over, old storefront code removed, demo seed data re-applied |
| D11 | Free-form canvas | ✅ Not in v1; **planned as Phase 7** (§11; was Phase 6 until Styles & polish was added 2026-10-18) |
| D12 | Features needing new backend data (🔌 in catalogue: recently viewed, reorder favourites, newsletter list, reviews summary) | ❓ Recommend Phases 3–5, one at a time — confirm when we reach them |

---

## 10. Risks & handling

| Risk | Handling |
|---|---|
| Scope is large (about 150 layouts) | Phased rollout; all layouts share `ui/` primitives, so each new layout is mostly arrangement, not new logic |
| Removing the old storefront breaks something it did (B2B quotes, COD OTP, chatbot, GA4, PWA manifest, custom domains) | Before deleting, list every feature of `PublicStorefrontPage.tsx` and tick each one off in the shell or a pack; end-to-end check on the 3 demo stores |
| Too many choices overwhelm merchants | Templates and style kits give a great default; fine-tune options sit behind "Customise"; layout try-on shows results instantly |
| Slow stores | Lazy-loaded packs, one public call per page, capped product lists, optimised images |
| Unreadable colour choices | Schemes generated with contrast rules + checker |
| XSS via merchant content | Smart values sanitised on the server and in the browser |
| Old saved layouts after changes | `version` + `upgrade()` per manifest |
| Modules leaking into each other | Folder-per-pack, auto-registry, ESLint import boundaries |

---

## 11. Later: free-form canvas (Phase 7)

You want more freedom here later, so the v1 design keeps the door open:
- It will be **one more section pack** (`freeform`): a grid canvas *inside a section* where blocks can be placed and resized freely, with a separate mobile arrangement (like Squarespace Fluid Engine). Nothing else in the builder changes.
- The same blocks (heading, text, button, image, product) are reused; the layout JSON just stores each block's grid position per device.
- Guard-rails when we build it: snap-to-grid, auto-generated mobile stacking as a starting point, an overlap warning, and the same accessibility rules (keyboard move/resize, reading order follows the visual order).

