# Storefront Builder — Layout, Style & Template Catalogue

Companion to [`plan-storefront-builder.md`](plan-storefront-builder.md). It lists **everything a merchant can choose**: theme style options, colour schemes, header/footer layouts, product popup and product page layouts, product cards, collection and cart styles, every section with its layouts, and the 5 templates with their signature widgets.

Each item has a stable **id** (for example `header/centered-logo`). The id is the folder name in code and the value saved in the layout JSON.

**How this list was made:**
- Market research on Shopify Online Store 2.0 (sections, blocks, section groups, theme settings), Shopify premium themes (header, quick-view and product-template options), Squarespace (per-section colour themes, font packs, button styles, Fluid Engine), and Dukaan (98 % mobile traffic in India).
- Style, palette and font data from the `ui-ux-pro-max` and `design` skills.

**Markers:**
- ⭐ = signature widget that belongs to one template.
- 🔌 = needs a small backend addition (called out in the plan).

---

## 1. Theme style options (global "Style" panel)

The merchant first picks a **Style kit** (a preset). Then they can fine-tune any individual option below; the change applies across the whole store.

### 1.1 Style kits (one-click presets)

| Kit | Feel | Based on | Good for |
|---|---|---|---|
| `minimal` | Clean, white space, thin lines | Minimalism & Swiss | Any store, electronics |
| `soft` | Rounded, gentle shadows, friendly | Soft UI (accessible version) | Beauty, kids, bakery |
| `editorial` | Magazine layout, serif headings, big images | Editorial Grid / Magazine | Fashion, jewellery |
| `luxe` | Dark or ivory, gold accents, slow elegant motion | Luxury dark + elegant | Jewellery, premium |
| `bold` | Thick borders, hard offset shadows, punchy colour | Neubrutalism | Streetwear, youth brands |
| `glass` | Frosted header/drawers, depth, vivid backdrops | Glassmorphism | Tech, lifestyle |
| `organic` | Earthy, curved shapes, paper texture | Organic Biophilic | Organic, plants, wellness |
| `playful` | Chunky, bubbly, bouncy | Claymorphism (toned down for accessibility) | Toys, sweets, gifts |
| `bento` | Modular tiles, Apple-like | Bento Box Grid | Electronics, D2C brands |
| `retro` | Warm faded tones, grain, polaroid frames | Vintage Analog | Cafés, vintage fashion |

> *Neumorphism was left out on purpose: the skill rates its accessibility risk as **high** (low-contrast embossed controls).*

### 1.2 Fine-tune options

| Group | Options |
|---|---|
| **Colours** | Palette (§2) · colour scheme per section · gradient backgrounds on/off |
| **Typography** | Font pair (§2.3) · heading size (compact / regular / large / huge) · heading weight (regular / semibold / bold / black) · heading case (normal / Title / UPPERCASE) · letter spacing (tight / normal / wide) · body size (15 / 16 / 17 px) · link style (colour / underline / animated underline) |
| **Buttons** | Shape (square / soft / rounded / pill) · style (filled / outline / soft-tint / gradient / hard-shadow / text-link) · size (compact / regular / large) · hover (darken / lift / fill-sweep / arrow-slide / glow) · text case · shadow (none / soft / hard) |
| **Corners** | Global roundness (sharp 0 / subtle 4 / soft 12 / round 20 / organic mixed) |
| **Cards** | Style (flat / bordered / shadow / elevated / glass / hard-shadow) · padding (tight / normal / roomy) · hover (none / lift / image zoom / border highlight) |
| **Product cards** | Card style (§6) · image ratio (square / portrait 4:5 / landscape 4:3 / natural) · second image on hover · quick-add button · wishlist heart · title lines (1 / 2) · show rating · show vendor/category |
| **Badges** | Shape (pill / tag / corner ribbon / circle) · position (top-left / top-right) · sale text (`-20%` / `Save ₹200` / `Sale`) · show *New*, *Bestseller*, *Low stock* |
| **Prices** | Compare-at style (strike-through / strike + saving pill) · show "You save" · tax note ("Incl. of all taxes") |
| **Inputs** | Style (outline / filled / underline) · roundness |
| **Icons** | Stroke (thin / regular / bold) · cart icon (bag / cart / basket) |
| **Layout & spacing** | Page width (narrow 1024 / regular 1200 / wide 1440 / full) · section spacing (compact / comfortable / airy) · grid gap (tight / normal / loose) |
| **Images** | Default roundness · frame (none / thin border / polaroid / arch top) · hover zoom · loading placeholder (blur / colour / shimmer) |
| **Decoration** | Section dividers (none / line / wave / curve / zigzag / torn paper) · background texture (none / grain / dots / grid / paper / linen) |
| **Motion** | Level (none / subtle / expressive) · scroll reveal (fade / slide-up / zoom) · add-to-cart effect (fly-to-cart / cart bounce / toast) · page transition (none / fade) — always off under reduced motion |
| **Drawers & popups** | Surface (solid / glass) · overlay darkness (light / medium / dark) · open animation (slide / fade / scale) · roundness |
| **Store behaviour** | Product opens as **popup / standalone page / popup with "View full page" link** · cart type (§8) · loader style (logo pulse / spinner / top progress bar / none) · back-to-top button · floating WhatsApp button (position, label) |

---

## 2. Colours — palettes and colour schemes

### 2.1 Colour schemes inside every palette (the "multi-colour" part)

Every palette has **5 colour schemes**. **Each section and block picks one** of them, so one page can alternate light, tinted, dark and brand-coloured bands while staying on-brand (this is how Squarespace and Shopify colour schemes work).

| Scheme | Background | Text | Buttons | Typical use |
|---|---|---|---|---|
| `light` | bg | text | primary | Default sections |
| `soft` | primary tint | text | primary | Feature bands, testimonials |
| `contrast` | dark (or light on dark palettes) | inverted | accent | Hero, footer, CTA |
| `brand` | primary | on-primary | accent / white | Offers, announcement |
| `accent` | accent tint | text | accent | Badges, sale strips |

Each scheme fills the same roles (`bg · surface · text · muted · border · button · button-text · link · badge`), so every layout works with every scheme.

### 2.2 Preset palettes (12)

| id | Name | Primary | Secondary | Accent | Background | Text | Fits |
|---|---|---|---|---|---|---|---|
| `teal-classic` | Teal Classic | `#0F766E` | `#134E4A` | `#D97706` | `#F8FAFC` | `#0F172A` | Default / any |
| `rose-gold` | Rose & Gold | `#BE185D` | `#EC4899` | `#D97706` | `#FDF2F8` | `#0F172A` | Bloom |
| `emerald-market` | Emerald Market | `#059669` | `#10B981` | `#EA580C` | `#ECFDF5` | `#064E3B` | Mandi |
| `fresh-amber` | Fresh & Amber | `#059669` | `#10B981` | `#D97706` | `#ECFDF5` | `#0F172A` | Mandi |
| `caramel` | Caramel Bakery | `#92400E` | `#B45309` | `#92400E` | `#FEF3C7` | `#78350F` | Crumb |
| `terracotta` | Terracotta Kitchen | `#9A3412` | `#C2410C` | `#059669` | `#FFFBEB` | `#0F172A` | Crumb |
| `luxe-gold` | Black & Gold | `#1C1917` | `#44403C` | `#A16207` | `#FAFAF9` | `#0C0A09` | Noor |
| `ivory-gold` | Ivory & Gold *(light Noor)* | `#A16207` | `#44403C` | `#1C1917` | `#FAFAF9` | `#0C0A09` | Noor |
| `blossom` | Blossom | `#EC4899` *(dark text on it)* | `#F9A8D4` | `#8B5CF6` | `#FDF2F8` | `#831843` | Bloom (beauty) |
| `florist` | Fresh Florist | `#15803D` | `#22C55E` | `#EC4899` | `#F0FDF4` | `#14532D` | Organic stores |
| `midnight` | Midnight *(dark)* | `#22C55E` | `#334155` | `#22C55E` | `#0F172A` | `#F8FAFC` | Volt |
| `launch-blue` | Launch Blue *(dark)* | `#3B82F6` | `#1E293B` | `#F8FAFC` | `#0B0B10` | `#F8FAFC` | Volt |

- Source: skill palette database (Wardrobe/Fashion, E-commerce, Grocery, Bakery/Cafe, Recipe, Luxury/Premium, Beauty/Spa, Florist, Smart-home dark, Space-tech).
- `ivory-gold` and `midnight` are adapted (roles swapped for readable buttons).
- All 12 must pass the built-in contrast checker before shipping.
- **Custom palette:** the merchant picks 3 colours; the builder generates the 5 schemes and readable text colours automatically.

### 2.3 Font pairs (10)

| id | Heading / Body | Mood | Source |
|---|---|---|---|
| `inter` | Inter / Inter | Neutral (today's look) | current app |
| `classic-elegant` | Playfair Display / Inter | Fashion, beauty | skill |
| `luxury-serif` | Cormorant / Montserrat | Jewellery, premium | skill |
| `bakery-sc` | Playfair Display SC / Karla | Bakery, café | skill (bakery design system) |
| `ecom-clean` | Rubik / Nunito Sans | Grocery, retail | skill |
| `geometric` | Outfit / Work Sans | Tech, modern D2C | skill |
| `soft-rounded` | Varela Round / Nunito Sans | Friendly, wellness | skill |
| `playful` | Fredoka / Nunito | Kids, sweets | skill |
| `editorial` | Cormorant / Inter | Lookbooks | combination of skill pairs |
| `system` | System UI | Fastest load | fallback |

Every stack ends with Noto Sans so Hindi, Tamil and Bengali text always renders.

---

## 3. Header (shared by all pages)

### 3.1 Header layouts (13)

| id | Layout | Best with |
|---|---|---|
| `header/classic` | Logo left · menu centre · icons right | Any |
| `header/logo-left-menu-right` | Logo left · menu + icons right | Minimal, Volt |
| `header/centered-logo` | Menu left · logo centre · icons right | Bloom |
| `header/stacked-centered` | Logo centred on top row, menu centred below | Noor, boutiques |
| `header/split-menu` | Menu split on both sides of a centre logo | Noor, editorial |
| `header/minimal-drawer` | Logo + ☰ + cart only, everything in a drawer | Lookbook, small catalogues |
| `header/search-first` | Logo · big search bar centre · icons | Mandi, large catalogues |
| `header/two-tier` | Utility bar (phone, WhatsApp, delivery info) + main bar | Mandi, Crumb |
| `header/mega-menu` | Classic + full-width dropdown with category images | Large catalogues |
| `header/category-rail` | Main bar + scrollable category chips row below | Mandi |
| `header/transparent-overlay` | Transparent over the first section, turns solid on scroll | Noor, Volt, Bloom |
| `header/sidebar` | Fixed vertical sidebar nav on desktop, top bar on mobile | Editorial, luxe |
| `header/floating-pill` | Floating rounded bar with margin (glass optional) | Volt, glass kit |

### 3.2 Header options

| Option | Choices |
|---|---|
| Sticky behaviour | always / show on scroll-up / off |
| Announcement bar | off / static / rotating messages / marquee / countdown (with end date) |
| Mobile menu | left drawer / right drawer / full-screen / bottom sheet |
| Mobile bottom tab bar | off / on (Home · Categories · Search · Cart · Account), app-like |
| Search | icon / inline bar / full-screen overlay with suggestions |
| Show account, wishlist, WhatsApp button | toggles |
| Logo size | desktop and mobile separately; optional alternate logo for the transparent header |
| Colour scheme | any of the 5 schemes |

The menu items come from the **Navigation editor**: pages, categories, products, external links, up to 3 levels deep for mega menus.

---

## 4. Footer (shared by all pages)

### 4.1 Footer layouts (10)

| id | Layout |
|---|---|
| `footer/simple-centered` | Logo · links row · social icons · copyright |
| `footer/columns` | 3–5 link columns + brand column (columns become accordions on mobile) |
| `footer/newsletter-band` | Big WhatsApp/email opt-in band above columns |
| `footer/minimal-line` | One line: © · policies · socials |
| `footer/big-wordmark` | Oversized store name across the bottom + links |
| `footer/split-story` | Brand story and image left, links right |
| `footer/contact-card` | Address, hours, phone, WhatsApp and directions button as a card |
| `footer/mega` | All categories + pages + trust badges + payment icons |
| `footer/instagram-strip` | Instagram-style image strip above simple footer |
| `footer/app-like` | Compact mobile-first footer with tab-style sections |

### 4.2 Footer blocks (mix, reorder, add or remove)

Link list · rich text · logo + about · social icons · payment icons (UPI, cards, COD) · trust badges · WhatsApp/email opt-in 🔌 · contact details · store hours · policies · "Made in India" / custom badge image.

---

## 5. Product view — popup or standalone page

A global switch in **Style → Store behaviour** (and per product-card section) decides what happens when a shopper taps a product:
- **Popup** (quick view)
- **Standalone page** (`/{slug}/products/{product}`, already a deep link today)
- **Both** — popup with a "View full details" link

Both are built from the same **product blocks**, so content set up once works in either.

### 5.1 Product blocks (used by popups and pages)

Gallery · title · price · rating summary · badges · short description · variant picker (buttons / dropdown / colour swatches / image swatches / chips) · quantity · buy buttons (Add to cart / Buy now / Order on WhatsApp) · sticky add-to-cart bar · delivery info · trust icons · full description · accordion rows (care, shipping, returns) · size guide popup · wholesale tiers (B2B) · stock level · share · reviews · related products · recently viewed 🔌 · custom text · custom image · countdown.

The merchant can add, remove and reorder blocks inside the chosen layout.

### 5.2 Quick-view popup layouts (15)

| id | Layout | Description |
|---|---|---|
| `quickview/classic-split` | Classic split | Image left, details right (today's look) |
| `quickview/wide-gallery` | Wide gallery | 60/40 split, thumbnail strip under the image |
| `quickview/thumb-rail` | Thumbnail rail | Vertical thumbnails · main image · details |
| `quickview/stacked-carousel` | Stacked carousel | Swipe carousel on top, details below, narrow modal |
| `quickview/side-drawer` | Side drawer | Slides in from the right, full height |
| `quickview/bottom-sheet` | Bottom sheet | Slides up from the bottom with a drag handle (mobile-native) |
| `quickview/compact-quick-add` | Compact quick-add | Small card: thumb, title, price, variants, add, "View full" |
| `quickview/immersive` | Full-screen immersive | Full-bleed image left, floating details panel right |
| `quickview/editorial` | Editorial | Large image with serif title overlay, minimal details |
| `quickview/grid-gallery` | Grid gallery | 2×2 image grid + details |
| `quickview/tabbed` | Tabbed | Split, with details in tabs (Details · Specs · Reviews) |
| `quickview/video-first` | Video first | Video or 360° on top, details below |
| `quickview/menu-item` | Menu item | Round image, description, option chips (size, eggless), add-ons |
| `quickview/spec-card` | Spec card | Image + key spec chips + EMI/warranty strip |
| `quickview/story` | Story | Vertical full-width images, sticky add bar (Instagram-story feel) |

### 5.3 Standalone product page layouts (15)

| id | Layout | Description |
|---|---|---|
| `product/classic` | Classic two-column | Gallery with thumbs below, info right |
| `product/thumb-rail` | Thumbnail rail | Vertical thumbs left, image, info |
| `product/stacked-sticky` | Stacked + sticky info | Images stack vertically, info stays in view |
| `product/grid-sticky` | Grid + sticky info | 2-column image grid, info stays in view |
| `product/hero-slider` | Hero slider | Wide slider on top, info in two columns below |
| `product/mirrored` | Mirrored | Info left, gallery right |
| `product/centered-minimal` | Centred minimal | One big image, info centred below |
| `product/split-screen` | Split screen | Image fills the left half edge-to-edge, info scrolls right |
| `product/bento-gallery` | Bento gallery | Mixed-size image tiles + info |
| `product/editorial-story` | Editorial story | Hero, then alternating image/text story blocks |
| `product/tabbed` | Tabbed | Gallery + tabbed info |
| `product/accordion` | Accordion | Gallery + collapsible rows |
| `product/spec-sheet` | Spec sheet | Gallery + spec grid + compare table + EMI/warranty |
| `product/menu-item` | Menu item | Big image, option chips, delivery date, add-on cross-sell |
| `product/shop-the-look` | Shop the look | Model image with hotspots to other products |

Below the main product area the merchant can add **any section** (reviews, related, FAQ, banners…).
*Phase 5:* alternate product templates per product (for example a "Pre-order" template).

---

## 6. Product card styles (10)

Used by every product section. Can be overridden per section.

| id | Style |
|---|---|
| `card/standard` | Image, title, price, add button |
| `card/minimal` | Image, title, price only |
| `card/overlay` | Info and button appear over the image on hover/tap |
| `card/bordered` | Framed card with padding |
| `card/elevated` | Shadow card, lifts on hover |
| `card/list-row` | Horizontal row with +/− stepper (fast grocery add) |
| `card/editorial` | Tall portrait image, serif title, no button |
| `card/compact` | Small dense tile for 3-column mobile grids |
| `card/rounded-center` | Round or arch image, centred text (bakery feel) |
| `card/tech` | Image, title, 2–3 spec chips, price, EMI hint |

---

## 7. Collection / category / all-products page (8 layouts)

| id | Layout |
|---|---|
| `collection/sidebar-filters` | Filters in a left sidebar + grid |
| `collection/top-filters` | Filter chips bar + drawer on mobile |
| `collection/list` | List rows (Mandi) |
| `collection/masonry` | Masonry grid (Bloom) |
| `collection/editorial-2col` | Large 2-column images (Noor) |
| `collection/category-rows` | One carousel row per sub-category |
| `collection/banner-grid` | Category banner + grid |
| `collection/bento` | Featured tile + regular grid (Volt) |

Options:
- Columns: desktop 2–6, mobile 1–3.
- Paging: pagination, "Load more" or infinite scroll.
- Default sort.
- Filters to show: price, availability, sub-category.

---

## 8. Cart styles (5)

`cart/drawer-right` · `cart/drawer-left` · `cart/page` · `cart/popup` · `cart/bottom-sheet`

Options:
- Free-delivery progress bar
- Upsell row
- Order note
- Coupon field (existing coupons)
- Auto-open on add

Checkout itself is unchanged (Razorpay / COD).

---

## 9. Section library (any section, any page, any order)

No page has required sections; only the header and footer are always present. Each section has layouts, blocks (where useful), a colour scheme, spacing, visibility (all / desktop / mobile) and a background (none / image / gradient / texture).

| Group | Section | Layouts |
|---|---|---|
| **Hero** | `hero` | centered · split-right · split-left · full-bleed overlay · video background · slideshow · collage (3 images) · bento (main + 2 tiles) · product hero (featured product + add) · bold text only · offer + countdown · lookbook hotspots (12) |
| **Announcement** | `announcement` | static · rotating · marquee · countdown |
| **Products** | `product-collection` (source: featured / category / hand-picked / newest / on sale) | grid · carousel · large-first grid · two-row scroll · list · tabs by category |
| | `product-spotlight` (one product) | image-left · image-right · centered · full-bleed |
| | `category-grid` | tiles · circles · icon rail · banner cards · mosaic |
| | `all-products` | any collection layout (§7) |
| | `deal-countdown` | banner · product card with timer |
| | `recently-viewed` 🔌 | carousel |
| **Content** | `rich-text` | narrow · wide · two-column |
| | `image-with-text` | left · right · overlap · full-bleed |
| | `features` | 3-col icons · 4-col · list · cards · bento |
| | `faq` | accordion · two-column · tabs |
| | `stats` | counters · cards |
| | `timeline` | vertical · horizontal |
| | `team` / `about-founder` | cards · split |
| | `logo-cloud` / `as-seen-in` | row · marquee |
| **Media** | `gallery` | grid · masonry · carousel · collage |
| | `video` | inline · full-width · with text |
| | `slideshow` | full · contained · cards |
| **Trust** | `trust-badges` | ribbon · cards · icons row |
| | `testimonials` | cards · carousel · big quote · wall |
| | `reviews-summary` 🔌 | rating bars + recent reviews (real store reviews) |
| **Conversion** | `cta-banner` | solid · gradient · image · split |
| | `whatsapp-cta` | banner · floating card |
| | `newsletter` 🔌 | inline · card · split image |
| | `coupon-strip` | strip · ticket cards (existing coupons) |
| | `enquiry-form` | simple · split image (uses existing public inquiry → CRM lead) |
| **Contact** | `contact-info` | card · list · split with image |
| | `store-hours` | table · card |
| | `map-embed` | Google Maps embed |
| **Utility** | `spacer`, `divider` | heights / divider shapes |
| | `custom-html` (sanitised, no scripts; free for now — D3/D4) | – |

**Section presets:** each section ships with 2–4 ready-made, pre-filled presets (for example "Hero — Festive Sale", "FAQ — Delivery & Returns") so merchants start from something beautiful rather than empty.

---

## 10. The 5 templates

Each template is a **template pack**:
- Its own style kit, 2 palettes and font pair
- Default header, footer, product view, product card, collection and cart layouts
- A fully designed **Home** page plus **About**, **FAQ** and **Contact** pages
- Its own **signature widgets** (⭐). These appear in the section picker under "*Template* exclusives"; see decision D9 about sharing them.

> **Shipped (Phase 4a, 2026-10-16): Noor and Mandi.** Differences from the plan below: the home pages use the live *Reviews summary* section instead of sample testimonials, and policy / FAQ copy is guidance for the merchant (spec SB-R18); Noor's header is `stacked-centered` (no per-page transparent header yet); Mandi's chip rail is not sticky (a section can't stick on its own) and "Reorder favourites" waits for D12. **Phase 4b (2026-10-17): Bloom, Crumb and Volt** shipped with the same rules. Differences: Bloom's hero is a slideshow from the store banner, "Size guide & Fit Finder" stays a product-page block and the "Trending ranked strip" is the product collection with rank badges; Crumb's "Occasion Cakes" is a product-collection carousel and veg / eggless markers are a card style option read from product tags; Volt's hero is a bold-text hero (no video background), the video spotlight plays video files already in a product's images (no 360°), and the Warranty & EMI strip ships without EMI claims; the compare tray is a store-behaviour option available to every template.

### 10.1 Noor — *luxury jewellery, premium ethnic wear, gifting*

| | |
|---|---|
| Mood | Quiet luxury, lots of space, slow elegant motion |
| Style kit / palettes / fonts | `luxe` · `luxe-gold`, `ivory-gold` · `luxury-serif` |
| Defaults | Header `stacked-centered` (transparent on home) · footer `big-wordmark` · product view **page** `split-screen`, popup `immersive` · card `editorial` · collection `editorial-2col` · cart `drawer-right` |
| Home | Transparent header → full-bleed hero → ⭐ Collection Spotlight → editorial product collection → ⭐ Craftsmanship Story → ⭐ Shop the Look → testimonials (big quote) → ⭐ Concierge → footer |
| ⭐ Signature widgets | **Collection Spotlight** (parallax full-bleed with gold rule) · **Shop the Look** (hotspot image) · **Craftsmanship Story** (timeline of the making) · **Certification strip** (hallmark / certificate badges supplied by merchant) · **Concierge** (book a WhatsApp video call) · **Gift Finder** (occasion + budget chips → filtered products) |

### 10.2 Bloom — *fashion, boutiques, beauty*

| | |
|---|---|
| Mood | Editorial, trendy, image-led |
| Style kit / palettes / fonts | `editorial` · `rose-gold`, `blossom` · `classic-elegant` |
| Defaults | Header `centered-logo` · footer `instagram-strip` · product view **popup** `story`, page `stacked-sticky` · card `overlay` · collection `masonry` · cart `drawer-right` |
| Home | Hero slideshow → ⭐ Shop by Occasion → trending collection (carousel) → ⭐ Lookbook Stories → image-with-text → ⭐ Shoppable Instagram grid → newsletter → footer |
| ⭐ Signature widgets | **Lookbook Stories** (tap-through story slider with products) · **Shop by Occasion** (Wedding · Festive · Office · Casual tiles) · **Shoppable Instagram grid** (merchant-uploaded posts linked to products) · **Size Guide & Fit Finder** (drawer) · **Before / After** (beauty compare slider) · **Trending ranked strip** (#1, #2, #3 badges) |

### 10.3 Crumb — *bakeries, cafés, home chefs, sweets, cloud kitchens*

| | |
|---|---|
| Mood | Warm, homely, appetising |
| Style kit / palettes / fonts | `soft` · `caramel`, `terracotta` · `bakery-sc` |
| Defaults | Header `two-tier` (delivery info in the top bar) · footer `contact-card` · product view **popup** `menu-item`, page `menu-item` · card `rounded-center` · collection `category-rows` · cart `bottom-sheet` on mobile / `drawer-right` on desktop |
| Home | Announcement (order cut-off) → hero split → ⭐ Today's Bake → ⭐ Menu Board → ⭐ Occasion Cakes → ⭐ Custom Cake Request → store hours + contact → footer |
| ⭐ Signature widgets | **Menu Board** (category menu with dotted price leaders) · **Today's Bake** (daily specials with "order before 6 PM" countdown) · **Pre-order banner** (order-by date) · **Occasion Cakes** carousel · **Custom Cake Request** (form → existing inquiry/lead) · **Delivery slots & areas** card · **Veg / Eggless markers** on cards |

### 10.4 Mandi — *grocery, organic, daily needs, kirana*

| | |
|---|---|
| Mood | Fresh, fast, dense, app-like |
| Style kit / palettes / fonts | `minimal` (dense spacing) · `emerald-market`, `fresh-amber` · `ecom-clean` |
| Defaults | Header `category-rail` + mobile bottom tab bar · footer `app-like` · product view **popup** `compact-quick-add`, page `classic` · card `list-row` / `compact` · collection `list` · cart `bottom-sheet` |
| Home | Search-first header → coupon strip → category grid (circles) → ⭐ Deal of the Day → product rows by category → ⭐ Combo Packs → trust badges → footer |
| ⭐ Signature widgets | **Quick-add rows** (+/− stepper without opening the product) · **Sticky category chip rail** · **Deal of the Day** (timer) · **Combo / bundle packs** · **Free-delivery progress bar** · **Reorder favourites** 🔌 (signed-in customers, from order history) |

### 10.5 Volt — *electronics, gadgets, accessories, modern D2C*

| | |
|---|---|
| Mood | Dark, sleek, techy, confident |
| Style kit / palettes / fonts | `bento` + `glass` header · `midnight`, `launch-blue` · `geometric` |
| Defaults | Header `floating-pill` (glass) · footer `mega` · product view **page** `spec-sheet`, popup `spec-card` · card `tech` · collection `bento` · cart `drawer-right` |
| Home | Floating header → product hero (video background) → ⭐ Feature Bento → product collection (tabs by category) → ⭐ Spec Compare → stats (counters) → ⭐ Warranty & EMI strip → testimonials (wall) → footer |
| ⭐ Signature widgets | **Feature Bento** (mixed tiles with icons/images) · **Spec Compare table** (2–4 products side by side) · **360° / video spotlight** · **Warranty & EMI strip** · **Compare tray** (pick products to compare while browsing) |

> The skill suggested Exo + Roboto Mono for "electronics". It was replaced with Outfit / Work Sans because a monospace body font hurts readability on product text.

---

## 11. Totals at launch (v1 target)

| Kind | Count |
|---|---|
| Style kits | 10 (+ ~60 fine-tune options) |
| Palettes × schemes | 12 × 5 (+ custom) |
| Font pairs | 10 |
| Header layouts | 13 |
| Footer layouts | 10 |
| Quick-view layouts | 15 |
| Product page layouts | 15 |
| Product card styles | 10 |
| Collection layouts | 8 |
| Cart styles | 5 |
| Sections (shared) | 33 with ~105 layouts |
| Templates | 5 with 30 signature widgets |

Rollout across the phases is described in the plan.

---

## Sources

- [Shopify — templates, sections and blocks best practices](https://shopify.dev/docs/storefronts/themes/best-practices/templates-sections-blocks)
- [Shopify — Online Store 2.0 JSON templates](https://shopify.dev/changelog/online-store-2-0-json-templates-and-improvements-to-liquid.md)
- [Shopify Horizon theme settings (community docs)](https://www.mintlify.com/Shopify/horizon/customization/settings)
- [Fluorescent — product template options](https://help.fluorescent.co/lorenza/product-pages/product-template)
- [Fluorescent — header layout and style](https://help.fluorescent.co/context/pages/header/layout-and-style)
- [FoxEcom Sleek — quick view settings](https://docs.foxecom.com/sleek-theme/pages-global-sections/quick-view)
- [Squarespace site styles (Paige Brunton)](https://www.paigebrunton.com/blog/squarespace-site-styles)
- [Squarespace Fluid Engine vs classic editor (Big Cat Creative)](https://www.bigcatcreative.com/blog/squarespace-fluid-engine-classic-editor)
- [Inc42 — Dukaan's mobile-first builder for Indian SMBs](https://inc42.com/?p=277259)
