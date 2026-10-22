---
id: storefront-builder
status: current
prefix: SB
related: [storefront-builder-editor, storefront-builder-templates, storefront-builder-commerce, storefront-builder-ai, storefront]
---
# Storefront Builder — Core (Engine, Packs, Data & APIs)

## Purpose
Lets merchants build their whole storefront — unlimited pages, shared header/footer, product page/popup, collection and cart designs — from modular sections and layouts. They start from a template pack (picked in the template wizard) and style it with style kits, multi-scheme colour palettes and font pairs, without code. This spec is the family overview: module structure, renderer, theming, documents, backend storage and public APIs. Plan: [`docs/plan-storefront-builder.md`](../docs/plan-storefront-builder.md); options catalogue: [`docs/storefront-builder-catalogue.md`](../docs/storefront-builder-catalogue.md); UI rules: `frontend/design.md` §2.2, §13.

## Scope
- **In:**
  - Builder module `frontend/src/storefront-builder/`: `core/` engine, `ui/` primitives, `packs/` (sections, headers, footers, product page / popup layouts, product blocks, cards, collection, cart, style kits, palettes, fonts), `templates/` (Starter, Noor, Mandi, Bloom, Crumb, Volt), `shell/`, `editor/`, `dev/Gallery.tsx`.
  - Backend builder slice: `StorefrontTheme`, `StorefrontPage` layouts, `StorefrontVersion`, `StorefrontSavedSection`, publish, smart values, sanitiser, public site APIs.
  - Family specs: editor (`storefront-builder-editor`), templates + wizard (`storefront-builder-templates`), product / collection / cart designs (`storefront-builder-commerce`), AI generation (`storefront-builder-ai`).
- **Out:** checkout and payments (`orders-checkout`), product and category data (`catalog-*`), customer auth and wishlist (`storefront-accounts`), custom domains and the Cloudflare worker (`storefront-custom-domains`), B2B pricing logic (`b2b-wholesale`), store settings outside design (`storefront`).

## Functional behaviour
- A store's design is a **site document** (template, style kit, palette, fonts, behaviour, header, footer, menus) plus one **page layout** per page (Home, catalogue, Product page, extra product designs, custom pages). Both have a **draft** (autosaved by the editor) and a **published** copy (what shoppers see).
- A page layout is an ordered list of **sections**; each section = pack `type` + `layout` + `settings` + optional `blocks`, colour scheme and visibility (desktop / phone / hidden). Packs are versioned and upgrade old settings on read.
- Settings may hold **smart values**: `$richtext` (sanitised HTML), `$link` (store-relative link), `$image` (uploaded image), `$products` / `$categories` (rules or ids resolved live on read).
- **Inventory (2026-10-21):** 33 section packs (incl. `product-main`, `all-products`, `newsletter`, `reviews-summary`), 13 header layouts, 10 footer layouts, 10 card styles, 15 product-page layouts, 15 popup layouts, 5 cart placements, 12 palettes, 10 font pairs, 10 style kits (~40 fine-tune options), 6 templates with 24 signature widgets. Full list: options catalogue.
- With no published design the store renders the **Starter** template.

## Rules
- **SB-R1** — Layouts store product/category *rules or IDs* (`$products`, `$categories`), never prices, stock or product images; data is resolved live (INV-2, CAT-R5).
- **SB-R2** — Public endpoints return only published theme/pages; drafts are visible only to the authenticated tenant (and the preview link, SB-R22). Publish is all-or-nothing.
- **SB-R3** — Every pack has a manifest with `version` + `upgrade()`; the renderer shows a placeholder for unknown/broken packs instead of crashing.
- **SB-R4** — The backend is schema-agnostic: it validates only the JSON envelope and smart values (`$richtext` sanitised, `$link` allow-listed, `$image` from our uploads, `$products`/`$categories` resolved). New packs never require backend changes.
- **SB-R5** — A store with no saved theme renders the built-in **Starter** default. (There are no live stores; the old fixed storefront is replaced, not kept in parallel.)
- **SB-R6** — Packs import only `core/` and `ui/`, never another pack; the rest of the app imports only `storefront-builder/index.ts`. Packs are auto-discovered.
- **SB-R7** — Layouts use only `--sf-*` tokens and container queries and must work in all 5 colour schemes, light/dark palettes and every style kit (`frontend/design.md` §2.2, §13).
- **SB-R8** — Every palette generates all 5 schemes; the editor warns when a text/background pair is below WCAG AA.
- **SB-R10** — Header and footer are always present and shared by all pages; no other section is required on any page.
- **SB-R11** — The store shell (cart, product view, auth, chatbot) is present on every storefront page, including custom pages; SF-R2 still holds.
- **SB-R13** — No plan restrictions for now: every pack manifest has a `tier` (all `free`) and the builder checks `canUse()` in one place, so paid tiers can be added later without layout changes.
- **SB-R15** — Merchant links (`$link`) are stored store-relative (`/products`, `/p/about`, `#section-<id>`) and resolved per store, so the same design works on `/{slug}` and on a custom domain.
- Editor rules SB-R9, R16, R19, R20, R22 → `storefront-builder-editor`; template rules SB-R14, R17, R18 → `storefront-builder-templates`; commerce rules SB-R12, R21 → `storefront-builder-commerce`; AI rule SB-R23 → `storefront-builder-ai`.

## Backend
- **Data:** `Storefront/StorefrontTheme` (1 per tenant: `DraftJson`, `PublishedJson`, `PublishedAt`, `Version`, `PreviewToken` nvarchar(64)); `StorefrontPage` (`Title`, `Slug`, `PageType` = Custom 0 | Home 1 | ProductTemplate 2 | QuickViewTemplate 3 | CollectionTemplate 4 | Cart 5 | Search 6 | NotFound 7 | AltProductTemplate 8 — every type except Custom and AltProductTemplate is unique per tenant; `DraftLayoutJson`, `PublishedLayoutJson`, `PublishedAt`, `IsPublished`, `ShowInNav`, `ShowInFooter`, `SortOrder`, `AssignmentJson` [`{categoryIds, productIds}`, product designs only, not drafted], `SeoTitle`, `SeoDescription`, `OgImageUrl`); `StorefrontVersion` (`Version`, `PublishedAt`, `SiteJson`, `PagesJson` = `[{pageId, pageType, title, slug, isPublished, showInNav, showInFooter, sortOrder, layout}]`, `PageCount`; index `TenantId, PublishedAt`; hard-deleted beyond the newest 10); `StorefrontSavedSection` (`Name` ≤ 100, `SectionType` ≤ 60, `SectionJson`; soft delete). Config `Persistence/Configurations/StorefrontBuilderConfiguration.cs`. Migrations `20261014041037_AddStorefrontBuilder`, `20261017120000_AddStorefrontVersionsAndSavedSections`, `20261018120000_AddStorefrontPhase5b` (last two hand-written, idempotent; apply manually, INV-7).
- **Validation** (`Application/StorefrontBuilder/StorefrontLayoutProcessor`, SB-R4): ids, lowercase `type` / `layout`, scheme / visibility enums, ≤ 60 sections, ≤ 50 blocks, 300 KB page / 150 KB site; `$richtext` sanitised by `IHtmlSanitizerService` (`Infrastructure/Services/HtmlSanitizerService`, Ganss.Xss allow-list, no styles / scripts), `$link` (https / http / mailto / tel / internal / `#`), `$image` (Cloudinary or this API's `/uploads/`), `$products` / `$categories` (shape-checked). Errors: `400 { errors: [...] }` with JSON paths.
- **Smart-value resolution** (`StorefrontSmartValueResolver`, scoped): fills `items` next to `$products` / `$categories` on public reads with live data (Active + OutOfStock products, same projection as `/public/{slug}/products`, incl. `tags`) and absolutises `$image` paths.
- **Merchant API — `StorefrontBuilderController` `/api/v1/storefront-builder` 🔒:** `GET|PUT theme` (draft autosave), `GET|POST pages`, `GET|PUT|DELETE pages/{id}` (soft delete; Home / system pages can't be deleted; reserved custom slugs `home, products, product, category, categories, p, order-confirmation, cart, search, account, checkout`), `POST pages/{id}/duplicate`, `PUT pages/{id}/assignment`, `POST publish`, `POST apply-template`, `GET|POST|DELETE preview-link`, `GET versions`, `GET versions/{id}`, `POST versions/{id}/restore`, `GET|POST saved-sections`, `PUT|DELETE saved-sections/{id}` (details in the editor / templates / commerce specs). `POST /business/upload?type=section` stores builder images (`section-{guid}`).
- **Public API — `PublicStorefrontSiteController` `/api/v1/public/{slug}/site` (anonymous):** `GET` (published site doc or `null`, nav pages, `hasHome`, `productTemplates [{id, categoryIds, productIds}]` — a category's design expanded to sub-categories without their own; `Cache-Control: public, no-cache` so a publish shows at once), `GET pages/{slug|home}` (published layout only), `GET templates/{product|quickview|collection|cart|search|not-found}` (`product?id=` serves that design; unknown / unpublished → default). Pages / templates are `max-age=60, swr=300`; the frontend adds `?v={version}`. Every read takes `?preview={token}` → drafts (SB-R22).
- **Public data for sections** (`PublicStorefrontController`): products with `minPrice` / `maxPrice` / `withPriceBounds`, `coupons`, `reviews/summary`, `newsletter` (`storefront`, `catalog-*`).
- **Demo designs:** `Persistence/DemoStorefrontDesigns.cs` seeds `aradhya-jewels` on Noor, `priya-boutique` on Bloom and `sugar-crumbs` on Crumb (draft = published) from JSON generated by each template's `build.ts`; regenerate when those templates change.

## Frontend
- **Public entry:** `index.ts` exports `StorefrontRoute` (+ `loadEditor`, `loadDevGallery`) — enforced by the ESLint rule `storefront-builder/boundaries` (`eslint.config.js`; `core/` + `ui/` never import packs / templates / shell; a pack imports only its folder, `core/`, `ui/` and app basics `api`, `utils`, `context`, `hooks`, `lib`, `components/storefront`).
- **`core/`:** `types.ts` (documents, smart values, manifests, data packs), `registry.ts` (`import.meta.glob` discovery of `packs/*/*/manifest.ts`, `templates/*/widgets/*/manifest.ts`, palettes / fonts / style kits, `templates/*/template.ts`), `renderer/` (`PageRenderer`, `SectionFrame` = pack + layout resolution, lazy layout cache, settings merge + `upgrade()`, scheme, visibility, error boundary), `theme/` (palette → 5 schemes → `--sf-*` vars, style kit + overrides → tokens in `styleTokens.ts` / `rootAttributes.ts`, font loading, `storefront.css` `sf-*` classes in `@layer components`), `data/` (public API + hooks; `useResolvedProducts` / `useResolvedCategories` use server `items` or resolve client-side for Starter / drafts), `storefront-context.tsx` (`useStorefront()`), `shell-context.ts` (`useShell()`), `canUse.ts`, `sanitize.ts` (lazy DOMPurify), `blocks.ts`, `theme/useStyleOptions.ts`, `commerce/` (`storefront-builder-commerce`). In editor / gallery previews data is read but orders, inquiries and reviews are not sent. Sections get DOM id `section-<id>`; `hidden` sections are skipped live and dimmed in the editor.
- **`ui/`:** token-driven primitives — `ProductCard`, `ProductRow`, `Overlay` (popup / drawer / sheet / full, focus trap, Esc, scroll lock), `product/` blocks, `Price`, `ProductImage`, `SmartImage`, `CtaLink`, `SectionHeading`, `RichText`, `SmartLinkAnchor`, `Scroller`, `EditorHint`, `StoreIcon`, `useCountdown`, `FoodMark`, `CompareTable`.
- **`shell/`:** `StorefrontRoute`, `ShellFrame` (theme CSS, `.sf-root`, header slot with sticky / hide-on-scroll / overlay / sidebar placement, `--sf-header-h`, footer slot, overlay root — shared by the live store and the editor preview), `StoreShell` (page by route kind, product view, cart, toasts, recently viewed, auth / account, return policy, back-to-top, mobile bar, compare tray, lazy chatbot), `seo.ts`, `PreviewBanner`.
- **Packs:** each = runtime `manifest.ts` (+ `layouts/`, lazy chunks) and editor-only `editor.ts` (fields with `group` / `showIf`, blocks, presets, keywords, per-layout description + thumb).
- **Dev gallery:** `/__storefront/gallery` (DEV only) renders every card / header / section / footer layout with fixtures under any palette × kit × font × scheme × width.
- **Bundles:** `chunk-storefront` = `core/` + `ui/` + `shell/` (~125 kB / 39 kB gzip); each layout its own chunk; editor chunk ~231 kB / 65 kB gzip incl. `@dnd-kit` (`../context.md` §5.6).

## Known issues
Open items in [known-issues](known-issues.md): KI-035.

## Suggestions
- Template data manager (SuperAdmin) — deferred; templates stay code packs (D2).
- Enforce the monthly AI limit for every AI feature, not only the builder (see *Changes to be done*).

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
