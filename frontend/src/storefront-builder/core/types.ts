/**
 * Storefront builder — shared contracts.
 *
 * Every pack (section, header, footer, popup, card, cart …) and every data pack
 * (palette, font pair, style kit) is described by the types in this file.
 * Packs import ONLY from `core/` and `ui/` (enforced by ESLint, see design.md §13).
 */
import type { ComponentType } from 'react';

// ── Saved documents (mirrors what the backend stores) ───────────────────────

export type SchemeId = 'light' | 'soft' | 'contrast' | 'brand' | 'accent';
export const SCHEME_IDS: SchemeId[] = ['light', 'soft', 'contrast', 'brand', 'accent'];

export type Visibility = 'all' | 'desktop' | 'mobile';

/** Arbitrary JSON-ish settings stored for a section or block. */
export type Settings = Record<string, unknown>;

export interface BlockInstance {
  id: string;
  type: string;
  scheme?: SchemeId;
  settings?: Settings;
}

export interface SectionInstance {
  id: string;
  /** Pack id, e.g. "hero", "product-collection", "header". */
  type: string;
  /** Layout id inside the pack, e.g. "split-right". Falls back to the pack default. */
  layout?: string;
  scheme?: SchemeId;
  visibility?: Visibility;
  settings?: Settings;
  blocks?: BlockInstance[];
  /** Pack `version` the settings were saved with (drives `upgrade()`). */
  v?: number;
  /** Hidden from shoppers (kept on the page in the editor, dimmed). */
  hidden?: boolean;
}

export interface PageLayout {
  schemaVersion: number;
  sections: SectionInstance[];
}

// ── Smart values (see backend StorefrontLayoutProcessor) ────────────────────

export interface SmartRichText { $richtext: string }
export interface SmartLink { $link: string }
export interface SmartImage { $image: string }

export type ProductSource = 'featured' | 'category' | 'manual' | 'newest' | 'sale' | 'all';
export interface ProductQuery {
  source: ProductSource;
  categoryId?: string;
  productIds?: string[];
  limit?: number;
}
/** `items` is filled by the server on public reads; absent in drafts / Starter defaults. */
export interface SmartProducts { $products: ProductQuery; items?: StoreProduct[] }

export type CategorySource = 'all' | 'featured' | 'manual';
export interface CategoryQuery {
  source: CategorySource;
  categoryIds?: string[];
  limit?: number;
}
export interface SmartCategories { $categories: CategoryQuery; items?: StoreCategory[] }

// ── Site document ────────────────────────────────────────────────────────────

export interface MenuItem {
  id: string;
  label: string;
  link?: SmartLink;
  children?: MenuItem[];
}

export interface PaletteColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface PaletteChoice {
  /** id of a preset palette pack, or undefined when `custom` is used. */
  presetId?: string;
  custom?: PaletteColors;
}

export interface ThemeSettings {
  styleKit: string;
  /** Fine-tune options layered on top of the style kit. */
  overrides?: Partial<StyleOptions>;
  palette: PaletteChoice;
  fontPair: string;
}

export type ProductViewMode = 'popup' | 'page' | 'both';

/** Cart drawer options (catalogue §8); checkout itself is unchanged. */
export interface CartOptions {
  /** Free-delivery progress bar target (0 = off). Display only — delivery charges are not changed. */
  freeDeliveryAt: number;
  /** "You may also like" row of featured products in the cart. */
  upsell: boolean;
  coupon: boolean;
  /** Open the cart when something is added (off = a short "Added" toast). */
  autoOpen: boolean;
}

export interface StoreBehaviour {
  productView: ProductViewMode;
  /** Layout of the `quickview` pack (product popup). The product page layout lives in the Product template. */
  quickviewLayout: string;
  /** Layout of the `card` pack, used by every product section unless overridden. */
  cardStyle: string;
  /** Layout of the `cart` pack. */
  cartStyle: string;
  cart?: CartOptions;
  backToTop: boolean;
  mobileBottomBar: boolean;
  loader: 'logo' | 'none';
  /** Product compare: a "Compare" toggle under cards and a compare tray (store shell). */
  compare?: boolean;
}

export interface SiteDoc {
  schemaVersion: number;
  templateId: string | null;
  theme: ThemeSettings;
  behaviour: StoreBehaviour;
  header: SectionInstance;
  footer: SectionInstance;
  menus: { main: MenuItem[]; footer: MenuItem[] };
}

// ── Style options (component-token layer) ───────────────────────────────────

export type Roundness = 'sharp' | 'subtle' | 'soft' | 'round';

/**
 * Global fine-tune options (catalogue §1.2). A style kit sets a starting point;
 * the merchant can override any of these. Every option is applied either as a
 * CSS token / root data-attribute (theme engine) or read by `ui/` primitives
 * and card packs through `useStyleOptions()`.
 */
export interface StyleOptions {
  // Corners & depth
  corners: Roundness;
  imageCorners: Roundness;
  shadowDepth: 'none' | 'soft' | 'strong' | 'hard';
  // Typography
  headingScale: 'compact' | 'regular' | 'large' | 'huge';
  headingWeight: 'regular' | 'semibold' | 'bold' | 'black';
  headingCase: 'normal' | 'upper';
  headingTracking: 'tight' | 'normal' | 'wide';
  bodySize: 15 | 16 | 17;
  linkStyle: 'color' | 'underline' | 'animated';
  // Buttons
  buttonShape: 'square' | 'soft' | 'rounded' | 'pill';
  buttonStyle: 'filled' | 'outline' | 'soft' | 'gradient' | 'hard-shadow';
  buttonSize: 'compact' | 'regular' | 'large';
  buttonHover: 'darken' | 'lift' | 'glow';
  buttonCase: 'normal' | 'upper';
  // Cards
  cardStyle: 'flat' | 'bordered' | 'shadow' | 'elevated' | 'glass' | 'hard-shadow';
  cardPadding: 'tight' | 'normal' | 'roomy';
  cardHover: 'none' | 'lift' | 'zoom' | 'border';
  // Product cards
  productImageRatio: 'square' | 'portrait' | 'landscape';
  productSecondImage: boolean;
  productQuickAdd: boolean;
  productWishlist: boolean;
  productTitleLines: 1 | 2;
  productShowCategory: boolean;
  /** Veg / non-veg / eggless marks on cards, from product tags (food stores). */
  foodMarkers: boolean;
  // Badges & prices
  badgeShape: 'pill' | 'tag' | 'square';
  badgePosition: 'left' | 'right';
  saleBadge: 'percent' | 'amount' | 'text';
  priceCompare: 'strike' | 'strike-pill';
  taxNote: boolean;
  // Inputs & icons
  inputStyle: 'outline' | 'filled' | 'underline';
  iconStroke: 'thin' | 'regular' | 'bold';
  // Layout & spacing
  pageWidth: 'narrow' | 'regular' | 'wide' | 'full';
  sectionSpacing: 'compact' | 'comfortable' | 'airy';
  gridGap: 'tight' | 'normal' | 'loose';
  // Decoration
  texture: 'none' | 'grain' | 'dots' | 'grid' | 'paper';
  gradients: boolean;
  // Motion
  motion: 'none' | 'subtle' | 'expressive';
  scrollReveal: 'none' | 'fade' | 'slide-up' | 'zoom';
  // Drawers & popups
  surface: 'solid' | 'glass';
  overlay: 'light' | 'medium' | 'dark';
}

// ── Store data (from the existing public endpoints) ─────────────────────────

export interface StoreInfo {
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsAppNumber?: string;
  instagramHandle?: string;
  facebookPageUrl?: string;
  currency?: string;
  themeColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  whatsAppCtaLabel?: string;
  announcementText?: string;
  razorpayEnabled?: boolean;
  razorpayKeyId?: string;
  allowsCustomBranding?: boolean;
  ga4MeasurementId?: string;
  faviconUrl?: string;
  loaderEnabled?: boolean;
  allowPublicInquiries?: boolean;
  b2bEnabled?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  seoKeywords?: string;
  returnPolicy?: string;
  socialLinks?: { platform: string; url: string }[];
}

export interface StoreProduct {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  basePrice: number;
  discountedPrice?: number | null;
  /** Lowest price when variants carry price adjustments. */
  minVariantPrice?: number | null;
  isFeatured: boolean;
  stockQuantity?: number | null;
  isOutOfStock?: boolean;
  primaryImage?: string | null;
  allImages?: string[];
  categoryName?: string | null;
  categoryId?: string | null;
  /** Merchant tags, e.g. "veg", "eggless" (food markers on cards). */
  tags?: string[];
}

export interface StoreSubCategory {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface StoreCategory extends StoreSubCategory {
  isFeatured?: boolean;
  subCategories?: StoreSubCategory[];
}

/** A coupon the merchant chose to show on the storefront (`GET /public/{slug}/coupons`). */
export interface StoreCoupon {
  code: string;
  type: 'Percentage' | 'Flat' | 'BuyXGetY';
  value: number;
  minOrderAmount?: number | null;
  validTo?: string | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
}

/** Store-wide approved reviews (`GET /public/{slug}/reviews/summary`). */
export interface StoreReviewsSummary {
  averageRating: number;
  totalCount: number;
  distribution: { rating: number; count: number }[];
  items: {
    id: string;
    reviewerName: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    productId: string;
    productTitle: string;
    productImage?: string | null;
  }[];
}

export interface NavPage {
  id: string;
  title: string;
  slug: string;
  showInNav: boolean;
  showInFooter: boolean;
}

// ── Packs ────────────────────────────────────────────────────────────────────

export type PackKind =
  | 'section'
  | 'header'
  | 'footer'
  | 'quickview'
  | 'product-page'
  | 'card'
  | 'collection'
  | 'cart';

export type FieldType =
  | 'text' | 'textarea' | 'richtext' | 'html' | 'image' | 'link' | 'number' | 'toggle'
  | 'select' | 'products' | 'categories' | 'list' | 'date' | 'icon';

/** Describes one editable setting; the editor builds its forms from these. */
export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  helper?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  /** For `list` fields: the fields of each item. */
  itemFields?: FieldDef[];
  /** Show this field only when another setting has one of these values (`$layout` = the chosen layout). */
  showIf?: { key: string; equals: unknown[] };
  /** Groups fields under a collapsible heading in the editor ("Content", "Style"…). */
  group?: string;
}

/**
 * A tiny schematic used for layout thumbnails in the editor:
 * [x, y, width, height, kind] in a 100 × 64 box.
 * kind: h = heading, t = text, i = image, b = button, m = muted fill, c = card outline.
 */
export type ThumbKind = 'h' | 't' | 'i' | 'b' | 'm' | 'c';
export type ThumbRect = [number, number, number, number, ThumbKind];

/** A repeatable item inside a section (FAQ question, slide, feature, logo…). */
export interface BlockDef {
  type: string;
  name: string;
  fields: FieldDef[];
  defaults: Settings;
}

/** A ready-made, pre-filled starting point shown in the section gallery. */
export interface SectionPreset {
  id: string;
  name: string;
  description?: string;
  layout?: string;
  scheme?: SchemeId;
  settings?: Settings;
  blocks?: { type: string; settings?: Settings }[];
}

/** Where and how a layout is being drawn. */
export interface RenderContext {
  mode: 'live' | 'editor' | 'gallery';
  /** True for the first section on the page (may own the h1, loads images eagerly). */
  isFirst: boolean;
  page: 'home' | 'custom' | 'collection' | 'product' | 'gallery';
}

/** Props every section / header / footer layout receives (one contract for all). */
export interface LayoutProps<S = Settings> {
  section: SectionInstance;
  settings: S;
  blocks: BlockInstance[];
  scheme: SchemeId;
  context: RenderContext;
}

export interface LayoutDef<P> {
  name: string;
  /**
   * Header layouts only — how the store shell places the header:
   * `overlay` sits on top of the first section; `sidebar` is a fixed left column on desktop.
   */
  placement?: 'overlay' | 'sidebar';
  load: () => Promise<{ default: ComponentType<P> }>;
}

export interface PackManifest<S = Settings, P = LayoutProps<S>> {
  kind: PackKind;
  id: string;
  name: string;
  version: number;
  /** All packs are free for now (D3); `canUse()` is the single gate. */
  tier: 'free' | 'premium';
  /** Template pack that owns this signature widget, if any (D9: unlockable everywhere). */
  template?: string;
  defaults: S;
  defaultLayout: string;
  layouts: Record<string, LayoutDef<P>>;
  /** Upgrades settings saved with an older `version` (SB-R3). */
  upgrade?: (settings: Settings, fromVersion: number) => Settings;
}

/**
 * Editor-only metadata, kept in each pack's `editor.ts` so the storefront bundle never ships it.
 * The editor merges it with the runtime manifest (see `editor/packs.ts`).
 */
export interface PackEditorMeta {
  description?: string;
  /** Section-gallery group, e.g. "Hero", "Products". */
  group?: string;
  /** Search words for the section gallery. */
  keywords?: string[];
  fields: FieldDef[];
  /** Repeatable items this section holds (add / reorder / remove in the editor). */
  blocks?: { label: string; types: BlockDef[]; max?: number; min?: number };
  /** Pre-filled starting points for the section gallery (first = default when added). */
  presets?: SectionPreset[];
  /** Per-layout picker info, keyed like `PackManifest.layouts`. */
  layouts?: Record<string, { description?: string; thumb?: ThumbRect[] }>;
}

/** Layout as the editor sees it: runtime definition + picker info. */
export type EditorLayoutDef<P> = LayoutDef<P> & { description?: string; thumb?: ThumbRect[] };

/** Runtime manifest merged with its editor metadata. */
export type EditorPack<S = Settings, P = LayoutProps<S>> =
  Omit<PackManifest<S, P>, 'layouts'> & Omit<PackEditorMeta, 'layouts'> & { layouts: Record<string, EditorLayoutDef<P>> };

// Kind-specific props for non-section packs ------------------------------------

export interface CardProps {
  product: StoreProduct;
  /** Position in its list (0-based) — some styles show rank badges. */
  index: number;
  context: RenderContext;
}

export interface QuickviewProps {
  product: StoreProduct;
  /** Product blocks of the product template's `product-main` section (same content as the page). */
  blocks: BlockInstance[];
  /** `product-main` settings (image shape, zoom, warranty / EMI text…). */
  settings: Settings;
  context: RenderContext;
  onClose: () => void;
  /** Opens the full product page ("popup with View full details" mode). */
  onViewFull?: () => void;
}

export interface CartProps {
  open: boolean;
  onClose: () => void;
}

// ── Data packs ───────────────────────────────────────────────────────────────

export interface PaletteDef {
  id: string;
  name: string;
  colors: PaletteColors;
  dark?: boolean;
  /** Free-text hint shown in the picker, e.g. "Fashion, boutique". */
  fits?: string;
}

export interface FontSpec {
  family: string;
  /** CSS fallback stack appended after the family (Noto Sans is always added). */
  fallback: 'sans' | 'serif';
}

export interface FontPairDef {
  id: string;
  name: string;
  heading: FontSpec;
  body: FontSpec;
  /** Google Fonts css2 query, without `display=swap`. Empty = system fonts only. */
  googleQuery: string;
  mood?: string;
}

export interface StyleKitDef {
  id: string;
  name: string;
  description: string;
  /** Kits set what makes them distinctive; anything left out uses the engine default. */
  options: Partial<StyleOptions>;
}

/** What the merchant sells — the template wizard's first question. */
export type ShopType = 'jewellery' | 'fashion' | 'beauty' | 'food' | 'grocery' | 'electronics' | 'other';

/** An extra page a template brings (About, FAQ, Contact …), created as a custom page. */
export interface TemplatePage {
  title: string;
  slug: string;
  layout: PageLayout;
  showInNav?: boolean;
  showInFooter?: boolean;
}

/** Everything a template creates for a store. Built from the store's own data (logo, colours, contact). */
export interface TemplateDocs {
  site: SiteDoc;
  home: PageLayout;
  collection?: PageLayout;
  product?: PageLayout;
  pages?: TemplatePage[];
}

export type TemplateBuild = (store: StoreInfo) => TemplateDocs;

/**
 * A template pack (`templates/<id>/template.ts`). The manifest is tiny and loaded eagerly;
 * the documents load on demand through `load()` so shoppers never download templates.
 * Only the built-in Starter (the default design, SB-R5) builds synchronously.
 */
export interface TemplateManifest {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'premium';
  /** One short line on the feel, shown in the template gallery. */
  mood?: string;
  /** Shop types it is designed for (wizard ordering). Empty = suits any shop. */
  shopTypes: ShopType[];
  /** Palette ids suggested in the wizard (first = the template's default). */
  palettes: string[];
  fontPair: string;
  styleKit: string;
  /** Synchronous build — Starter only (the fallback design must render without waiting). */
  build?: TemplateBuild;
  /** The template's documents, in their own chunk. */
  load?: () => Promise<{ default: TemplateBuild }>;
}
