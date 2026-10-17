/**
 * Product blocks (catalogue §5.1): the pieces a product page or popup is built
 * from. Block settings live in the product template's `product-main` section, so
 * content set up once shows in both the page and the popup.
 */
import type { BlockInstance } from '../../core/types';

export interface TitleBlock { size: 'md' | 'lg' | 'xl'; showCategory: boolean }
export interface PriceBlock { size: 'md' | 'lg'; showTaxNote: boolean }
export interface BadgesBlock { showSale: boolean; showFeatured: boolean; lowStockAt: number }
export interface DescriptionBlock { mode: 'short' | 'full'; lines: number }
export interface VariantsBlock { style: 'buttons' | 'dropdown' | 'swatches' | 'chips' }
export interface BuyButtonsBlock { addToCart: boolean; buyNow: boolean; whatsapp: boolean; arrange: 'stack' | 'row' }
export interface LabelBlock { label: string }
export interface StockBlock { lowStockAt: number }
export interface DeliveryBlock { text: string; subtext: string; icon: string }
export interface TrustBlock { cod: boolean; returns: boolean; secure: boolean; shipping: boolean; genuine: boolean }
export interface AccordionBlock { title: string; content: 'text' | 'description' | 'return-policy'; text: string; open: boolean }
export interface SizeGuideBlock { label: string; heading: string; text: string; image: unknown }
export interface TextBlock { heading: string; text: unknown }
export interface ImageBlock { image: unknown; link: unknown; alt: string }
export interface CountdownBlock { label: string; endsAt: string }
export interface SpecsBlock { title: string }

export const PRODUCT_BLOCK_DEFAULTS = {
  title: { size: 'lg', showCategory: true } as TitleBlock,
  price: { size: 'lg', showTaxNote: true } as PriceBlock,
  rating: {} as Record<string, never>,
  badges: { showSale: true, showFeatured: true, lowStockAt: 5 } as BadgesBlock,
  description: { mode: 'short', lines: 4 } as DescriptionBlock,
  variants: { style: 'buttons' } as VariantsBlock,
  quantity: {} as Record<string, never>,
  'buy-buttons': { addToCart: true, buyNow: true, whatsapp: true, arrange: 'stack' } as BuyButtonsBlock,
  inquiry: { label: 'Send an inquiry' } as LabelBlock,
  quote: { label: 'Request bulk quote' } as LabelBlock,
  wholesale: {} as Record<string, never>,
  stock: { lowStockAt: 5 } as StockBlock,
  delivery: { text: 'Delivered in 3–7 days', subtext: 'Free delivery on prepaid orders', icon: 'truck' } as DeliveryBlock,
  trust: { cod: true, returns: true, secure: true, shipping: false, genuine: false } as TrustBlock,
  accordion: { title: 'Shipping & returns', content: 'return-policy', text: '', open: false } as AccordionBlock,
  'size-guide': { label: 'Size guide', heading: 'Size guide', text: '', image: { $image: '' } } as SizeGuideBlock,
  share: {} as Record<string, never>,
  reviews: {} as Record<string, never>,
  text: { heading: '', text: { $richtext: '' } } as TextBlock,
  image: { image: { $image: '' }, link: { $link: '' }, alt: '' } as ImageBlock,
  countdown: { label: 'Offer ends in', endsAt: '' } as CountdownBlock,
  specs: { title: 'Specifications' } as SpecsBlock,
};

export type ProductBlockType = keyof typeof PRODUCT_BLOCK_DEFAULTS;

/** Long-form blocks that tabbed / accordion layouts move into tabs or rows. */
const CONTENT_TYPES = new Set<string>(['accordion', 'specs', 'reviews', 'text', 'image']);

export function isContentBlock(block: BlockInstance): boolean {
  if (block.type === 'description') return (block.settings?.mode ?? 'short') === 'full';
  return CONTENT_TYPES.has(block.type);
}

/** Tab / row label for a long-form block. */
export function contentLabel(block: BlockInstance): string {
  const s = block.settings ?? {};
  switch (block.type) {
    case 'description': return 'Details';
    case 'specs': return String(s.title || 'Specifications');
    case 'reviews': return 'Reviews';
    case 'accordion': return String(s.title || 'More info');
    case 'text': return String(s.heading || 'More info');
    default: return 'More';
  }
}

/** The block set a new product template starts with. */
export const DEFAULT_PRODUCT_BLOCKS: { type: ProductBlockType; settings?: Record<string, unknown> }[] = [
  { type: 'badges' },
  { type: 'title' },
  { type: 'rating' },
  { type: 'price' },
  { type: 'description', settings: { mode: 'short', lines: 4 } },
  { type: 'variants' },
  { type: 'quantity' },
  { type: 'buy-buttons' },
  { type: 'wholesale' },
  { type: 'quote' },
  { type: 'inquiry' },
  { type: 'delivery' },
  { type: 'trust' },
  { type: 'description', settings: { mode: 'full' } },
  { type: 'accordion' },
  { type: 'reviews' },
];

/** Parses "Key: Value" lines of a description into spec rows (Spec sheet / spec card). */
export function parseSpecs(description: string | undefined | null): { label: string; value: string }[] {
  if (!description) return [];
  return description
    .split(/\r?\n/)
    .map(line => line.replace(/^[\s•\-*]+/, '').match(/^([^:]{1,32}):\s*(.{1,120})$/))
    .flatMap(m => (m ? [{ label: m[1].trim(), value: m[2].trim() }] : []))
    .slice(0, 16);
}

/** True for media URLs that should play as video (merchant-uploaded clips). */
export const isVideoUrl = (url: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
