import type { BlockDef, FieldDef, PackEditorMeta, ThumbRect } from '../../../core/types';
import { DEFAULT_PRODUCT_BLOCKS, PRODUCT_BLOCK_DEFAULTS as D } from '../../../ui/product/blockTypes';

const size = (key: string, label: string, options: [string, string][]): FieldDef =>
  ({ key, label, type: 'select', options: options.map(([value, l]) => ({ value, label: l })) });

const BLOCKS: BlockDef[] = [
  { type: 'title', name: 'Title', defaults: { ...D.title }, fields: [size('size', 'Size', [['md', 'Medium'], ['lg', 'Large'], ['xl', 'Extra large']]), { key: 'showCategory', label: 'Show category above', type: 'toggle' }] },
  { type: 'price', name: 'Price', defaults: { ...D.price }, fields: [size('size', 'Size', [['md', 'Medium'], ['lg', 'Large']]), { key: 'showTaxNote', label: 'Show "Inclusive of all taxes"', type: 'toggle' }] },
  { type: 'rating', name: 'Rating summary', defaults: {}, fields: [] },
  { type: 'badges', name: 'Badges', defaults: { ...D.badges }, fields: [
    { key: 'showSale', label: 'Sale badge', type: 'toggle' },
    { key: 'showFeatured', label: 'Bestseller badge (featured products)', type: 'toggle' },
    { key: 'lowStockAt', label: 'Show "Only N left" at or below', type: 'number', min: 0, max: 50 },
  ] },
  { type: 'description', name: 'Description', defaults: { ...D.description }, fields: [
    size('mode', 'Show', [['short', 'Short (a few lines + read more)'], ['full', 'Full description']]),
    { key: 'lines', label: 'Lines before "Read more"', type: 'select', options: [2, 3, 4, 6].map(n => ({ value: String(n), label: String(n) })), showIf: { key: 'mode', equals: ['short'] } },
  ] },
  { type: 'variants', name: 'Variant picker', defaults: { ...D.variants }, fields: [
    size('style', 'Style', [['buttons', 'Buttons'], ['chips', 'Chips'], ['dropdown', 'Dropdown'], ['swatches', 'Colour swatches (colour names)']]),
  ] },
  { type: 'quantity', name: 'Quantity', defaults: {}, fields: [] },
  { type: 'buy-buttons', name: 'Buy buttons', defaults: { ...D['buy-buttons'] }, fields: [
    { key: 'addToCart', label: 'Add to cart', type: 'toggle' },
    { key: 'buyNow', label: 'Buy now (quick checkout)', type: 'toggle' },
    { key: 'whatsapp', label: 'Order on WhatsApp', type: 'toggle', helper: 'Needs a WhatsApp number in Storefront Settings.' },
    size('arrange', 'Arrange', [['stack', 'Stacked'], ['row', 'Side by side']]),
  ] },
  { type: 'inquiry', name: 'Inquiry form', defaults: { ...D.inquiry }, fields: [{ key: 'label', label: 'Button text', type: 'text' }] },
  { type: 'quote', name: 'Bulk quote (B2B)', defaults: { ...D.quote }, fields: [{ key: 'label', label: 'Button text', type: 'text', helper: 'Shown to signed-in B2B customers only.' }] },
  { type: 'wholesale', name: 'Wholesale tiers (B2B)', defaults: {}, fields: [] },
  { type: 'stock', name: 'Stock level', defaults: { ...D.stock }, fields: [{ key: 'lowStockAt', label: '"Hurry" message at or below', type: 'number', min: 0, max: 50 }] },
  { type: 'delivery', name: 'Delivery info', defaults: { ...D.delivery }, fields: [
    { key: 'icon', label: 'Icon', type: 'icon' },
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'subtext', label: 'Small text', type: 'text' },
  ] },
  { type: 'trust', name: 'Trust icons', defaults: { ...D.trust }, fields: [
    { key: 'cod', label: 'Cash on delivery', type: 'toggle' },
    { key: 'returns', label: 'Easy returns', type: 'toggle' },
    { key: 'secure', label: 'Secure checkout', type: 'toggle' },
    { key: 'shipping', label: 'Fast shipping', type: 'toggle' },
    { key: 'genuine', label: '100% genuine', type: 'toggle' },
  ] },
  { type: 'accordion', name: 'Collapsible row', defaults: { ...D.accordion }, fields: [
    { key: 'title', label: 'Title', type: 'text' },
    size('content', 'Content', [['text', 'My text'], ['description', 'Product description'], ['return-policy', 'Return policy']]),
    { key: 'text', label: 'Text', type: 'textarea', showIf: { key: 'content', equals: ['text'] } },
    { key: 'open', label: 'Open by default', type: 'toggle' },
  ] },
  { type: 'size-guide', name: 'Size guide', defaults: { ...D['size-guide'] }, fields: [
    { key: 'label', label: 'Link text', type: 'text' },
    { key: 'heading', label: 'Popup heading', type: 'text' },
    { key: 'image', label: 'Size chart image', type: 'image' },
    { key: 'text', label: 'Text', type: 'textarea' },
  ] },
  { type: 'specs', name: 'Specifications', defaults: { ...D.specs }, fields: [
    { key: 'title', label: 'Heading', type: 'text', helper: 'Rows come from "Label: value" lines in each product description.' },
  ] },
  { type: 'share', name: 'Share buttons', defaults: {}, fields: [] },
  { type: 'reviews', name: 'Reviews', defaults: {}, fields: [] },
  { type: 'countdown', name: 'Countdown', defaults: { ...D.countdown }, fields: [{ key: 'label', label: 'Label', type: 'text' }, { key: 'endsAt', label: 'Ends at', type: 'date' }] },
  { type: 'text', name: 'Custom text', defaults: { ...D.text }, fields: [{ key: 'heading', label: 'Heading', type: 'text' }, { key: 'text', label: 'Text', type: 'richtext' }] },
  { type: 'image', name: 'Custom image', defaults: { ...D.image }, fields: [{ key: 'image', label: 'Image', type: 'image' }, { key: 'alt', label: 'Image description', type: 'text' }, { key: 'link', label: 'Link', type: 'link' }] },
];

const g = (x: number, y: number, w: number, h: number): ThumbRect => [x, y, w, h, 'i'];
const info = (x: number, y = 8, w = 36): ThumbRect[] =>
  [[x, y, w * 0.8, 5, 'h'], [x, y + 9, w * 0.4, 4, 't'], [x, y + 17, w, 3, 't'], [x, y + 22, w * 0.9, 3, 't'], [x, y + 31, w, 7, 'b'], [x, y + 41, w, 7, 'c']];

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Product page',
  description: 'The product: photos, price, options and buy buttons. Its blocks also fill the product popup.',
  keywords: ['product', 'pdp', 'buy', 'gallery', 'variants', 'add to cart', 'popup', 'quick view'],
  fields: [
    { key: 'imageRatio', label: 'Image shape', type: 'select', group: 'Gallery', options: [{ value: 'portrait', label: 'Portrait 4:5' }, { value: 'square', label: 'Square' }, { value: 'landscape', label: 'Landscape 4:3' }, { value: 'natural', label: 'Natural (no crop)' }] },
    { key: 'zoom', label: 'Tap to view full screen', type: 'toggle', group: 'Gallery' },
    { key: 'infoStyle', label: 'Long content (description, specs, reviews)', type: 'select', group: 'Details', helper: 'The Tabbed and Accordion layouts always use their own style.', options: [{ value: 'plain', label: 'One under another' }, { value: 'tabs', label: 'Tabs' }, { value: 'accordion', label: 'Collapsible rows' }] },
    { key: 'breadcrumbs', label: 'Breadcrumbs', type: 'toggle', group: 'Details' },
    { key: 'stickyBar', label: 'Sticky add-to-cart bar when scrolling', type: 'toggle', group: 'Details' },
    { key: 'warranty', label: 'Warranty text', type: 'text', group: 'Spec sheet', showIf: { key: '$layout', equals: ['spec-sheet'] } },
    { key: 'emi', label: 'EMI text', type: 'text', group: 'Spec sheet', showIf: { key: '$layout', equals: ['spec-sheet'] } },
    { key: 'addOnsHeading', label: 'Cross-sell heading', type: 'text', group: 'Cross-sell', showIf: { key: '$layout', equals: ['menu-item', 'shop-the-look'] } },
  ],
  blocks: { label: 'Product blocks', types: BLOCKS, max: 30 },
  presets: [
    { id: 'classic', name: 'Classic product', description: 'Gallery left, details right', layout: 'classic', blocks: DEFAULT_PRODUCT_BLOCKS },
  ],
  layouts: {
    classic: { description: 'Gallery with thumbs below, info right', thumb: [g(4, 4, 44, 44), [4, 52, 9, 9, 'm'], [15, 52, 9, 9, 'm'], [26, 52, 9, 9, 'm'], ...info(56)] },
    'thumb-rail': { description: 'Vertical thumbs left, image, info', thumb: [[4, 4, 8, 8, 'm'], [4, 14, 8, 8, 'm'], [4, 24, 8, 8, 'm'], g(14, 4, 40, 56), ...info(60, 8, 34)] },
    'stacked-sticky': { description: 'Images stack, info stays in view', thumb: [g(4, 2, 50, 29), g(4, 33, 50, 29), ...info(60, 8, 34)] },
    'grid-sticky': { description: '2-column image grid, info stays in view', thumb: [g(4, 2, 28, 29), g(34, 2, 28, 29), g(4, 33, 28, 29), g(34, 33, 28, 29), ...info(68, 8, 28)] },
    'hero-slider': { description: 'Wide slider on top, info in two columns below', thumb: [g(0, 2, 62, 32), g(64, 2, 36, 32), [4, 40, 30, 5, 'h'], [4, 48, 20, 4, 't'], [4, 55, 30, 6, 'b'], [54, 40, 40, 3, 't'], [54, 46, 40, 3, 't'], [54, 52, 34, 3, 't']] },
    mirrored: { description: 'Info left, gallery right', thumb: [...info(6), g(52, 4, 44, 56)] },
    'centered-minimal': { description: 'One big image, info centred below', thumb: [g(28, 2, 44, 38), [34, 44, 32, 4, 'h'], [42, 50, 16, 3, 't'], [34, 56, 32, 6, 'b']] },
    'split-screen': { description: 'Image fills the left half, info scrolls right', thumb: [g(0, 0, 50, 64), ...info(58, 10, 36)] },
    'bento-gallery': { description: 'Mixed-size image tiles + info', thumb: [g(4, 4, 52, 34), g(4, 40, 25, 20), g(31, 40, 25, 20), ...info(62, 8, 32)] },
    'editorial-story': { description: 'Hero, then alternating image / text story', thumb: [g(0, 0, 100, 26), [6, 18, 40, 5, 'h'], g(6, 32, 26, 28), [38, 36, 30, 3, 't'], [38, 42, 26, 3, 't'], g(70, 32, 24, 28)] },
    tabbed: { description: 'Gallery + tabbed info', thumb: [g(4, 4, 44, 56), ...info(54, 4, 40).slice(0, 4), [54, 34, 12, 5, 'b'], [68, 34, 12, 5, 'm'], [82, 34, 12, 5, 'm'], [54, 42, 40, 18, 'c']] },
    accordion: { description: 'Gallery + collapsible rows', thumb: [g(4, 4, 44, 56), ...info(54, 4, 40).slice(0, 5), [54, 42, 40, 5, 'c'], [54, 49, 40, 5, 'c'], [54, 56, 40, 5, 'c']] },
    'spec-sheet': { description: 'Gallery + spec grid + warranty / EMI strip', thumb: [g(4, 2, 40, 34), ...info(50, 2, 44).slice(0, 5), [4, 40, 44, 4, 'c'], [52, 40, 44, 4, 'c'], [4, 45, 44, 4, 'c'], [52, 45, 44, 4, 'c'], [4, 54, 28, 7, 'm'], [36, 54, 28, 7, 'm'], [68, 54, 28, 7, 'm']] },
    'menu-item': { description: 'Big image, option chips, delivery note, add-ons', thumb: [g(4, 4, 44, 40), [54, 6, 34, 5, 'h'], [54, 14, 16, 4, 't'], [54, 22, 12, 5, 'c'], [68, 22, 12, 5, 'c'], [82, 22, 12, 5, 'c'], [54, 32, 40, 7, 'b'], g(4, 50, 20, 12), g(28, 50, 20, 12), g(52, 50, 20, 12), g(76, 50, 20, 12)] },
    'shop-the-look': { description: 'Model photo with a shoppable look card', thumb: [g(4, 2, 50, 60), [30, 40, 22, 18, 'c'], ...info(60, 8, 34)] },
  },
};

export default meta;
