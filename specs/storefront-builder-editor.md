---
id: storefront-builder-editor
status: current
prefix: SB
related: [storefront-builder, storefront-builder-templates, storefront-builder-commerce, storefront-builder-ai]
---
# Storefront Builder — Editor

## Purpose
The full-screen *Customise store* editor where merchants arrange sections, style the store, manage pages and menus, preview on any device, and publish — with autosave, undo / redo, version history, saved sections and a shareable preview link.

## Scope
- **In:** `/storefront/editor`, editor state, preview iframe, left panes (Sections · Style · Pages · Menus), inspector, section gallery, autosave, publish, undo / redo, version history + restore, saved sections, preview link, form fields.
- **Out:** template wizard and apply-template (`storefront-builder-templates`), product / collection / cart designs and *Store behaviour* options (`storefront-builder-commerce`), AI panel (`storefront-builder-ai`), engine and APIs (`storefront-builder`).

## Functional behaviour
- **Entry:** sidebar *Customise store* → `/storefront/editor?page=home|collection|<pageId>` (full screen, `AuthGuard`, outside `AppShell`, lazy chunk); `/pages` redirects here. First run (nothing saved or published) opens the template wizard.
- **Layout:** left pane | live preview (desktop 1280 / tablet 820 / phone 390, scaled to fit) | settings. Phones get *Sections · Preview · Settings* tabs.
  - **Sections:** outline (header · sortable sections · footer); *Add section* gallery — the store's **Saved** sections first (rename / delete on the card), then signature widgets grouped as "*Template* exclusives" (own template first), then generic groups; searchable presets; the "Product page" group only on product designs.
  - **Inspector:** layout picker with thumbnails (hover to try a layout on), colour-scheme swatches, show-on (desktop / phone), schema form (fields grouped, `showIf`), blocks editor + block inspector, *Save for reuse*.
  - **Style:** template (*Change* opens the wizard), style kits, palettes (+ custom, WCAG contrast report), font pairs, grouped fine-tune options with reset, *Store behaviour* (`storefront-builder-commerce`).
  - **Pages:** Home, Catalogue & categories, Product page (preview uses a sample store product), *Other product designs*, unlimited custom pages (create from a page template, settings: title, slug, published, show in nav / footer, SEO title / description / OG image; duplicate, delete), *New page with AI*.
  - **Menus:** main menu (3 levels) and footer menu (2 levels), customised from the automatic menu; link picker; indent / outdent; drag or ↑ / ↓.
- **Preview:** click a section to select it; hover outlines; section toolbar (move, duplicate, hide, remove, save for reuse); links and forms are neutralised; no orders / inquiries / reviews are sent.
- **Top bar:** page switcher, device, undo / redo, version history (clock), save status + retry, *Share preview*, *View store*, **Publish** (disabled while history or AI is open).
- **Autosave:** 1.2 s after the last edit (revision-safe; creates system pages on first save; warns before leaving with unsaved edits). Shoppers see nothing until **Publish**.
- **Publish:** saves, then publishes theme + all page drafts in one step, copies the palette's primary / secondary / accent to the store's brand colours and records a version.
- **Undo / redo:** buttons, Ctrl/⌘+Z, Ctrl/⌘+Shift+Z or Ctrl+Y (ignored while typing in a field, dialog, gallery, wizard or history); covers site and every page in this visit; typing within 500 ms merges into one step (max 100 steps); undoing a page edit switches to that page.
- **Version history:** last 10 publishes (date, who, page count, *Live* on the newest); pick one → read-only preview with a page picker; *Restore* (after confirm) copies it into the drafts.
- **Saved sections:** *Save for reuse* asks for a name (hidden flag not saved); inserted as a fresh copy (new section + block ids); max 50 per store.
- **Share preview:** create / copy / make a new link / turn off; the editor saves first; the link is `{origin}/{slug}?preview={token}`.

## Rules
- **SB-R9** — Every drag action in the editor has a button/keyboard alternative.
- **SB-R16** — The editor autosaves drafts only; shoppers see changes after **Publish**. Publishing also copies the palette's primary / secondary / accent to the store's brand colours (used outside the builder: PWA, chatbot widget, emails); the colour pickers live only in the editor.
- **SB-R19** — Every publish keeps a snapshot of what went live (site document + every page's published layout); only the newest 10 are kept. Restoring a version writes the **drafts** only (nothing goes live until Publish): the site document and the version's pages (matched by id, then page type / address; custom pages deleted since are re-created); pages added since are left as they are. Undo can't reverse a restore.
- **SB-R20** — Undo / redo covers edits made in this editor visit (site and every page, typing merged into one step) and is not saved; it starts again after a template is applied or a version is restored. Saved sections are independent copies — editing or deleting a saved section never changes pages that use it; at most 50 per store.
- **SB-R22** — One shareable preview link per store (`/{slug}?preview={token}`) shows the saved drafts, read-only, to anyone with it, until the merchant turns it off or makes a new one (the old link then shows the live store with a notice). Draft responses are never cached and the preview is marked `noindex`; buying still works normally.

## Backend
- **API (`StorefrontBuilderController`):** `GET|PUT theme`; `GET|POST pages`, `GET|PUT|DELETE pages/{id}`, `POST pages/{id}/duplicate`; `POST publish {brandColors?: {primary, secondary, accent}}` (theme + page drafts in one SaveChanges, bumps `Version`, copies brand colours to `StorefrontSettings.ThemeColor/SecondaryColor/AccentColor`, adds a `StorefrontVersion` of the live site + every page with a published layout, hard-deletes versions beyond 10); `GET versions` (newest first, `publishedBy` = `CreatedBy` → `Users.Name`), `GET versions/{id}` (site + pages), `POST versions/{id}/restore` (re-validates, then in one SaveChanges writes the site to the theme draft and each page's layout to the draft of the page matched by id → page type [system] / slug [custom], re-creating missing pages; returns `site` + touched `pages`); `GET|POST saved-sections` (POST `{name, section}` validated as a one-section page; > 50 → 409), `PUT saved-sections/{id}` (rename), `DELETE saved-sections/{id}` (soft); `GET|POST|DELETE preview-link` (POST makes or replaces the 32-hex token; 409 before the first save).
- **Public preview:** any `/public/{slug}/site*` read with `?preview={token}` returns drafts (`DraftJson` / `DraftLayoutJson ?? Published…`, draft-only pages included) with `Cache-Control: private, no-store` and `preview: true`; a wrong / revoked token → 410 (constant-time compare).

## Frontend
- **Code (`storefront-builder/editor/`):** `StorefrontEditor.tsx` (boot → 3 panes / phone tabs), `api.ts`, `packs.ts` (editor view of the registry: manifest + `editor.ts`).
  - `state/`: `store.ts` (zustand: site doc, layouts per page, selection, try-on, device, revision counters, `past` / `future` undo stacks [`editSite` / `editLayout` push `{key, before, after}`], `historyOpen`, `aiPanel`, `templatePreview`, `wizard`, `savingSection`, `productDesignIds`, `forgetPage`), `useEditorBoot` (store info, theme draft → published → Starter, pages list), `usePageLayout` (page draft → published → Starter / empty), `systemPages.ts`, `useAutosave` (registers `store.flush`), `usePublish`, `instance.ts` (`writeSetting` upgrades old settings first), `sectionFactory` / `pageTemplates` / `starter.ts`, `savedSections.ts` (react-query `sb-saved-sections`, `sectionFromSaved`), `useUndoShortcuts` (editor document + preview frame), `useVersionHistory.useRestoreVersion` (`flush()` → restore → `applyTemplateDocs`), `ids.ts`, `blockSummary.ts`.
  - `preview/`: `PreviewFrame` (same-origin iframe with its own React root, `MemoryRouter`, mirrored app styles), `PreviewApp`, `frameStyles.ts`, `sampleProduct.ts`.
  - `panels/`: `LeftPanel`, `OutlinePanel`, `SectionGallery`, `Inspector`, `LayoutPicker`, `SchemePicker`, `BlocksEditor`, `ThemePanel`, `styleFields.ts`, `BehaviourPanel`, `PagesPanel`, `PageSwitcher`, `MenusPanel`, `TopBar`, `HistoryPanel`, `SaveSectionDialog`, `PreviewLinkDialog`, `schemeNames.ts`.
  - `fields/`: `SchemaForm` + controls for every field type (text, textarea, rich text [small built-in formatter], html, image upload `type=section`, link picker, products rule, categories rule, list, icon, date, select / segmented, toggle, number); `useStoreData.ts`.
  - `ui/`: `SortableList` (`@dnd-kit`, editor chunk only), `Thumb`, `Toast`, `controls.tsx`.

## Known issues
Open items in [known-issues](known-issues.md): KI-061, KI-062.

## Suggestions

## Changes to be done
See `storefront-builder` (*Changes to be done* — Phase 6 editor style controls).
