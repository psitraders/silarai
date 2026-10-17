# Silarai Frontend — Design Rulebook

The single reference for building UI in `frontend/`. Read it before creating or changing any screen.
**MUST** = required. **SHOULD** = strong default; break it only with a reason in the PR.
Scope: the React app in `frontend/` only. The marketing site `landing_website/` has its own rules.

---

## 0. Two surfaces, two token systems

| Surface | Who uses it | Branding | Colour tokens | Where |
|---|---|---|---|---|
| **Dashboard** | Merchant, team, SuperAdmin | Silarai brand (teal) + the user's chosen dashboard theme | `--rc-*` (`store/theme.store.ts`, `index.css`) | `pages/*` except `pages/storefront`, `components/layout`, `components/ui` |
| **Storefront** | Shoppers | **The merchant's brand** (template + style kit + palette + fonts) | `--sf-*` (storefront builder theme) | `pages/storefront`, `storefront-builder/*`, `components/storefront` |

- MUST NOT use `--sf-*` tokens in the dashboard or `--rc-*` tokens in the storefront.
- The dashboard theme switcher (Teal/Purple/Blue/Rose/Orange) only changes the admin panel. It never changes a merchant's store.

---

## 1. Principles

1. **Mobile-first.** Most merchants run their business from a phone. Every dashboard screen and every storefront section MUST work at 375 px wide.
2. **One clear action per screen.** Exactly one primary button per view; everything else is secondary, outline or ghost.
3. **Tokens, not hex.** Components use tokens and Tailwind scale values. Raw hex codes are allowed only inside token or palette definition files.
4. **Reuse before you build.** Use `components/ui/*` first. A new shared pattern goes into `components/ui`, not a page file.
5. **Accessible by default.** Contrast, keyboard use, focus states and labels are part of "done", not polish.
6. **Fast on Indian mobile networks.** Lazy-load below the fold, optimise images and avoid layout shift.

---

## 2. Colour

### 2.1 Dashboard

| Role | Use | Token / class |
|---|---|---|
| Brand / primary action | Primary buttons, active nav, links | `var(--rc-primary)`, `.theme-btn`, `.theme-nav-active`, `.theme-text` |
| Brand tint | Selected rows, badges, soft panels | `var(--rc-primary-bg)`, `.theme-badge`, `.theme-bg` |
| Page background | App canvas | `bg-slate-50` (`#f8fafc`) |
| Surface | Cards, modals, panels | `bg-white` |
| Text — primary | Headings, body | `text-slate-900` |
| Text — secondary | Descriptions, helper text | `text-slate-600` (minimum on white; `slate-500` only at ≥ 14 px medium) |
| Text — disabled / placeholder | Placeholders only | `text-slate-400`, never for real content |
| Border | Card and input borders | `border-slate-100` (cards), `border-slate-200` (inputs) |
| Success | Paid, delivered, saved | `green-600` text / `green-50` bg |
| Warning | Pending, low stock | `amber-600` text / `amber-50` bg |
| Danger | Delete, failed, errors | `red-600` text / `red-50` bg, `bg-red-600` buttons |
| Info | Neutral notices | `blue-600` text / `blue-50` bg |

- New brand-coloured UI MUST use the `--rc-*` variables (or `.theme-*` classes) so it follows the user's dashboard theme. Do not add new hard-coded `teal-700`.
- Status colour MUST always come with a text label or an icon. Colour alone is never the meaning.

### 2.2 Storefront tokens — three layers

The storefront follows the design-system skill's three layers: **primitive → semantic → component**. Layouts only ever read the semantic and component layers.

1. **Primitive (palette):** `primary`, `secondary`, `accent`, `background`, `text` — chosen by the merchant (12 presets or custom).
2. **Semantic (colour scheme):** every palette generates **5 schemes** — `light`, `soft`, `contrast`, `brand`, `accent`. Each section or block picks one. The scheme's values are applied as CSS variables on that section's wrapper:

| Token | Use |
|---|---|
| `--sf-bg` / `--sf-surface` | Section background / cards, drawers, modals |
| `--sf-text` / `--sf-muted` | Main / secondary text |
| `--sf-border` | Dividers, card borders |
| `--sf-button` / `--sf-on-button` | Primary buttons / text on them |
| `--sf-link` | Links, active states, price highlight |
| `--sf-badge` / `--sf-on-badge` | Sale and new badges |
| `--sf-success`, `--sf-danger` | Stock and status messages (fixed, not editable) |

3. **Component (style options):** `--sf-btn-radius`, `--sf-btn-shadow`, `--sf-card-radius`, `--sf-card-shadow`, `--sf-card-border`, `--sf-input-radius`, `--sf-img-radius`, `--sf-section-space`, `--sf-gap`, `--sf-page-width`, `--sf-heading-case`, `--sf-heading-tracking`, `--sf-motion-*` and so on. These are set from the style kit and fine-tune options (catalogue §1).

Rules:
- MUST NOT hard-code colours, radii, shadows or fonts inside a layout. If a role is missing, add it to the token engine for every palette and style kit.
- Text on a coloured fill MUST use the matching `on-*` token, never assumed white.
- Every layout MUST look right in all 5 schemes and on a **dark** palette (Midnight, Launch Blue).
- Components in `storefront-builder/ui/` are the only place component tokens are applied. Layouts use those components rather than re-styling buttons or cards.

### 2.3 Contrast

- Body text: **4.5:1** or more. Large text (≥ 24 px, or ≥ 18.66 px bold) and icons or UI borders: **3:1** or more.
- The palette editor runs this check. Code reviewers check fixed colours by hand.

---

## 3. Typography

### 3.1 Dashboard

- Font: **Inter**, with fallback `system-ui, -apple-system, sans-serif`. (Inter is not loaded yet; see §16.)
- Scale (Tailwind):

| Role | Class | Weight |
|---|---|---|
| Page title | `text-2xl` (24 px) | `font-bold` |
| Section / card title | `text-lg` (18 px) | `font-semibold` |
| Body | `text-sm` (14 px) in dense admin UI, `text-base` (16 px) in reading content | `font-normal` |
| Label | `text-sm` | `font-medium` |
| Caption / meta | `text-xs` (12 px) | `font-medium` |
| Overline | `text-xs uppercase tracking-wide` | `font-semibold` |

- Text MUST NOT be smaller than 12 px.
- Form inputs MUST be **≥ 16 px on mobile** to avoid iOS zoom (`text-base sm:text-sm`).
- Body line-height 1.5 or more. Long text width at most about 70 characters (`max-w-prose`).
- Prices, counts and table numbers SHOULD use `tabular-nums`.
- Weights: 700 for headings, 600 for titles, 500 for labels, 400 for body. Don't use 300 for body text.

### 3.2 Storefront

- Fonts come from the chosen **font pair**: `--sf-font-heading` and `--sf-font-body`. Sections MUST use these, never a font name.
- Load only the chosen pair, with `display=swap`.
- Every font stack MUST end with `'Noto Sans', system-ui, sans-serif` so Hindi, Tamil and Bengali product names render.
- Headings SHOULD use `text-wrap: balance` and a bounded width.

---

## 4. Spacing & layout

- **Spacing:** use the 4 px Tailwind scale only (`1`, `2`, `3`, `4`, `6`, `8`, `12`, `16`). No arbitrary values like `mt-[13px]`.
- **Gaps:** in dense dashboard UI, 8 px between controls, 16 px inside cards, 24 px between cards. On the storefront, 48–64 px vertical padding per section (`py-12 md:py-16`).
- **Containers:** content width is `max-w-6xl mx-auto px-4 sm:px-6` on both surfaces. Reading content uses `max-w-3xl`.
- **Breakpoints:** Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Design and test at **375 / 768 / 1024 / 1440**.
- **Mobile-first:** write base classes for mobile and add `md:` / `lg:` for larger screens.
- **No horizontal page scroll.** Horizontal strips (carousels, chips) MUST scroll inside their own container and show that more content exists (for example a fade at the edge).
- **Full-height screens:** use `min-h-dvh`, not `h-screen`.
- **Storefront sections MUST use container queries** (`@container` on the section wrapper, `@md:` / `@lg:` inside), not viewport breakpoints. This lets the builder preview Desktop, Tablet and Mobile correctly inside the editor.

---

## 5. Shape, borders & elevation

| Element | Radius | Border | Shadow |
|---|---|---|---|
| Buttons, inputs, selects, small chips | `rounded-xl` | inputs `border-slate-200` | none |
| Cards, panels | `rounded-2xl` | `border-slate-100` | `shadow-sm` |
| Modals, drawers, bottom sheets | `rounded-2xl` (sheets: top corners only) | none | `shadow-xl` |
| Pills, avatars, dots | `rounded-full` | – | – |
| Dropdowns, popovers | `rounded-xl` | `border-slate-100` | `shadow-lg` |

- Use only these shadow steps: `shadow-sm` (resting), `shadow-lg` (floating), `shadow-xl` (modal). Don't invent new shadows.
- On the storefront, radius, shadow and borders come from the theme's **style options**. Layouts use the component tokens (`--sf-btn-radius`, `--sf-card-radius`, `--sf-img-radius`, `--sf-card-shadow`…) through `storefront-builder/ui/` components, never fixed `rounded-*` or `shadow-*` for cards, buttons or images.

---

## 6. Layers (z-index)

| Layer | z |
|---|---|
| In-flow overlays (image badges, sticky table header) | `z-10` |
| Floating buttons (scroll-to-top, chat launcher) | `z-20` |
| Sticky site header / app topbar | `z-30` |
| Drawers, side sheets, dropdown menus over header | `z-40` |
| Modals and their backdrop | `z-50` |
| Toasts | `z-[60]` |

- MUST NOT use any other z-index value.
- Sticky headers MUST NOT hide the keyboard-focused element. Use `scroll-padding-top` equal to the header height.

---

## 7. Icons & imagery

- **Icons:** `lucide-react` only. Sizes: `w-4 h-4` inline with text, `w-5 h-5` in nav and buttons, `w-6 h-6` for feature icons. Default stroke width.
- **No emoji as UI icons.** Emoji may appear only in content the merchant writes.
- An icon next to visible text gets `aria-hidden="true"`. An icon-only button MUST have an `aria-label`.
- **Images:**
  - Always go through `optimizeImage(url, width)` from `utils/imageUrl.ts` (Cloudinary).
  - Always reserve space with `aspect-*` or `width`/`height`.
  - Below-the-fold images use `loading="lazy"`.
  - Every meaningful image has `alt`; decorative images use `alt=""`.
- Product images: square (`aspect-square`) in grids, `object-cover`, with a neutral `bg-slate-100` placeholder while loading.

---

## 8. Components

Use these before writing anything new:

| Need | Use | Rule |
|---|---|---|
| Buttons | `ui/Button` | Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`. One `primary` per view. Pass `loading` during async work, which also disables the button. |
| Text inputs | `ui/Input`, `ui/Textarea`, `ui/Select` | Always pass `label`. Use `helperText` for hints and `error` for messages. |
| Containers | `ui/Card` | Use `padding` sizes, not custom padding. |
| Dialogs | `ui/Modal` | Closes on Esc and has a visible close button. Confirm destructive actions here. |
| Empty data | `ui/EmptyState` | Message + one action ("Add your first product"). |
| Loading | Skeletons for content areas; `ui/Spinner` only inside buttons or for tiny areas | Don't put a full-page spinner over content that is already shown. |
| Status | `ui/Badge` | Text + colour, never colour only. |
| Paging | `ui/Pagination` | – |
| Numbers | `formatCurrency`, `formatNumber`, `formatDate` from `utils/` | Never format currency by hand. |

Touch targets: at least **44 × 44 px** on mobile (`min-h-11`), with at least 8 px between adjacent targets. Every clickable element has `cursor-pointer` and visible hover, active and focus states.

---

## 9. Forms & feedback

- Every field has a visible label. A placeholder is an example, never the label. Mark required fields with `*`.
- Validate **on blur**, not on every keystroke. Show the error **under the field**, saying what is wrong and how to fix it ("Enter a 10-digit mobile number", not "Invalid").
- On a failed submit with several errors, move focus to the first invalid field.
- Use the right input types (`email`, `tel`, `number`, `url`) and `autocomplete` attributes.
- Group related fields under a heading. Show advanced options behind a "More options" disclosure (progressive disclosure).
- Async actions follow: button `loading` → success toast or inline success → error with a **Retry**.
- Toasts disappear after 3–5 s, never steal focus and are announced with `aria-live="polite"`.
- Destructive actions are red and kept apart from the primary action. Use a confirm dialog when the action can't be undone, or an **Undo** toast when it can.
- Long editors (builder, product form) MUST autosave or warn before leaving with unsaved changes.

---

## 10. Motion

| Token | Duration | Use |
|---|---|---|
| fast | 150 ms | Hover, press, colour changes |
| base | 200 ms | Dropdowns, toggles, tabs |
| slow | 300 ms | Modals, drawers, sheets |

- Animate only `transform` and `opacity`. Never animate width, height, top or left.
- Use ease-out when something enters and ease-in when it leaves. Exits are about 30 % faster than entries.
- Animate at most one or two things per view. Every animation must explain a change; none are purely decorative.
- MUST respect reduced motion: add `motion-reduce:transition-none` / `motion-reduce:animate-none`. Carousels never auto-rotate under reduced motion, pause on hover and focus, and have visible controls.
- Never block input while something animates.

---

## 11. Navigation

- The current location is always highlighted (`.theme-nav-active` in the dashboard).
- Navigation stays in the same place on every page.
- Every key screen has its own URL (deep link). Back must restore the previous scroll and filter state.
- Modals are for short tasks, never for primary navigation.
- After a route change, move focus to the main heading for screen-reader users.

---

## 12. Accessibility checklist (MUST)

- [ ] Contrast meets §2.3.
- [ ] Every interactive element is reachable and usable by keyboard, and the tab order follows the visual order.
- [ ] Focus ring visible: `focus-visible:ring-2 focus-visible:ring-offset-2`. Never `outline-none` without a replacement.
- [ ] Headings in order (`h1` → `h2` → `h3`), with one `h1` per page.
- [ ] Icon-only buttons have `aria-label`; form errors are linked with `aria-describedby`.
- [ ] Any drag action also has buttons (↑/↓ "Move up/down") and works by keyboard (WCAG 2.2).
- [ ] Pointer targets are at least 24 × 24 px on desktop and 44 × 44 px on touch.
- [ ] Reduced motion is respected.

---

## 13. Storefront builder packs — authoring contract

Applies to every pack in `storefront-builder/packs/*` and `storefront-builder/templates/*/widgets/*`: sections, headers, footers, product-page and quick-view layouts, product blocks, cards, collection and cart styles. The full list of packs is in `docs/storefront-builder-catalogue.md`.

**Structure & isolation**
1. **One folder per pack** with `manifest.ts` (runtime only: id, name, defaults, `version`, `upgrade()`, layouts) and `editor.ts` (editor only: description, group, settings schema, allowed blocks, presets, keywords, one description + thumbnail per layout), plus one file per **layout** in `layouts/`. Shoppers never download `editor.ts`. Packs are **auto-discovered**, so never edit a central list.
2. **Imports:** a pack may import only from `storefront-builder/core` and `storefront-builder/ui`. It must never import from another pack, from `pages/*` or from the dashboard. ESLint enforces this.
3. **Same contract for every layout:** props are `settings`, `blocks`, `scheme`, `context`. A layout renders UI and nothing else.
4. **No data fetching in layouts.** Products and categories come from `core/data` hooks fed by `$products` / `$categories` smart values. A layout stores rules or IDs, never prices, stock or product image URLs (INV-2).
5. **Settings come from the manifest schema.** Never hand-build an editor form for one pack.

**Look**

6. **Tokens only:** `--sf-*` semantic and component tokens (§2.2) and `--sf-font-*` fonts. Use `ui/` primitives (Price, ProductCard, ProductImage, SectionHeading, RichText…) and the token-driven classes in `core/theme/storefront.css` (`sf-container`, `sf-section-pad`, `sf-h1`/`sf-h2`, `sf-btn sf-btn-primary|secondary|ghost`, `sf-card`, `sf-badge`, `sf-chip`, `sf-input`, `sf-muted`, `sf-link`…) instead of re-styling them. No hex values and no font names. The classes sit in `@layer components`, so Tailwind utilities can still override them.
7. **Must work in every combination:** all 5 colour schemes, light and dark palettes, every style kit and every font pair. Check this in the dev gallery.
8. **Container queries only** for responsiveness (§4). Test at 375 px first.
9. **Signature widgets** (template packs) follow the same rules. Their template's style kit is their *default*, not a requirement.

**Behaviour & quality**

10. **Every state is designed:** loading (skeleton with the same height), empty (a friendly message plus an editor-only hint) and error. A pack MUST NOT collapse to nothing in the editor.
11. **Merchant content is unsafe input:** rich text arrives as sanitised `$richtext`, links as `$link`, images as `$image`. Never use `dangerouslySetInnerHTML` on anything else.
12. **Semantics:** each section is a `<section>` with a heading or an `aria-label`. Only the first hero may hold the page `h1`. Popups trap focus and close on Esc; drawers and sheets return focus to their trigger.
13. **Motion** reads `--sf-motion-*` tokens and is off under `prefers-reduced-motion`. Carousels never auto-play under reduced motion and always have visible controls.
14. **Budget:** no third-party scripts in packs (embeds such as YouTube or Maps load only after a click or when visible). Images are lazy except in the first section. Product lists are capped (24) with "View all".
15. **No global side effects:** a pack must not touch `document`, `body`, other sections or global CSS.
16. **Store shell owns commerce:** cart, checkout, login, product view (popup or page) and chatbot are reached through shell hooks (`useCart()`, `useProductView()`…) and never re-implemented in a pack.
17. **Changing saved data shape:** bump `version` and write `upgrade()`. Never break stores that are already saved.
18. **Links:** merchant links are store-relative (`/products`, `/p/about`, `#section-<id>`). Read `$link` values with `useLinkReader()` (or `CtaLink`) and build store URLs with `links.*` — never hard-code `/{slug}`.
19. **Frames & portals:** layouts also render inside the editor's preview frame. Use `element.ownerDocument` / `ownerDocument.defaultView` for scroll, focus and position, and portal drawers / sheets into `useOverlayRoot()` (inside `.sf-root`, so they keep the theme and escape sticky or glass headers).
20. **Editor metadata:** every manifest gives fields readable labels (with `group` / `showIf` where useful), one `thumb` per layout, `keywords`, and at least one pre-filled preset; repeatable content uses `blocks`, not ad-hoc arrays. Empty states use `ui/EditorHint` (visible only in the editor and gallery).

### Storefront editor (dashboard side)

- Lives in `storefront-builder/editor/` and uses **dashboard** tokens (`--rc-*`, `.theme-*`, slate scale) — never `--sf-*`.
- Forms come from manifests via `editor/fields/SchemaForm` (rule 5); new field types are added there once.
- Three panes on ≥ 1024 px; on smaller screens they become the *Sections · Preview · Settings* tabs. Every drag has ↑/↓ buttons (SB-R9). Autosave status is always visible; Publish is the only primary button.

---

## 14. Dashboard screen pattern

- Layout comes from `AppShell` (sidebar + topbar). A page does not render its own.
- Page header: title (`text-2xl font-bold`) + one-line description (`text-slate-600`) on the left, the primary action on the right. On mobile it stacks, with the action full width.
- Lists: a table on `lg+` and cards on mobile. Use filters in a row, with search first.
- Settings pages: grouped `Card`s, with a sticky **Save** bar when the form is dirty.
- New user-facing strings SHOULD go through `react-i18next` keys (`i18n/locales/en.json`). Today most screens are not translated yet (§16).

---

## 15. Writing & copy

- Plain, short, friendly words. Use "you" for the merchant.
- Buttons say what happens: "Publish changes", not "Submit".
- Errors give the cause and the fix. Empty states give the next step.
- Indian conventions: `₹` through `formatCurrency`, Indian number grouping, dates through `formatDate`.

---

## 16. Known gaps in current code (fix when touching that area)

| Gap | Rule it breaks | Fix |
|---|---|---|
| `ui/Button` uses hard-coded `teal-*` | §2.1 tokens | Switch to `--rc-*` variables |
| Inter is referenced but never loaded (dashboard) | §3.1 | Self-host or load Inter (`display=swap`); the storefront now loads its font pair itself |
| ~~`PagesPage.tsx` block list uses emoji as icons~~ | §7 | Removed with the old Pages screen (builder Phase 2) |
| ~~Custom pages render HTML without sanitising~~ | §13.7 | Fixed in storefront builder Phase 1 (server + DOMPurify) |
| No `prefers-reduced-motion` handling anywhere | §10 | Add `motion-reduce:*` to animations |
| i18n used in only 2 screens | §14 | Migrate as screens are touched |
| ~~`PublicStorefrontPage.tsx` is about 4,000 lines with inline styles~~ | §13 | Replaced by `storefront-builder/` in Phase 1. The moved quick-view was rebuilt from product blocks and the chatbot typed in Phase 3. `components/storefront/CartDrawer` (used by the cart packs) still has legacy slate / brand-colour styling, not scheme tokens |

---

## 17. Pre-delivery checklist (every UI PR)

- [ ] Checked at 375, 768, 1024 and 1440 px, with no horizontal scroll.
- [ ] Uses `components/ui` and tokens, with no new raw hex or arbitrary spacing.
- [ ] One primary action; loading, empty and error states present.
- [ ] Accessibility checklist (§12) passes.
- [ ] Images optimised, sized and lazy where below the fold.
- [ ] Storefront: checked in the dev gallery with all 5 colour schemes, a light and a dark palette, 3 style kits and 2 font pairs.
- [ ] No emoji icons, and `cursor-pointer` plus hover/focus on every clickable element.
