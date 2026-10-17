import type { PackEditorMeta } from '../../../core/types';
import { CARD_STYLE_FIELD } from '../../../ui/cardStyles';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'Featured, newest, on-sale, a category or hand-picked products.',
  keywords: ['featured', 'best sellers', 'new arrivals', 'sale', 'products'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
    { key: 'products', label: 'Products', type: 'products', helper: 'Prices and stock always come live from your catalogue.' },
    { key: 'showRank', label: 'Show rank badges', type: 'toggle' },
    { key: 'showViewAll', label: 'Show "View all" button', type: 'toggle' },
    CARD_STYLE_FIELD,
  ],
  presets: [
    { id: 'featured', name: 'Featured products', description: 'Your featured items', layout: 'grid' },
    { id: 'best-sellers', name: 'Trending carousel', description: 'Swipeable row with rank badges', layout: 'carousel', scheme: 'soft', settings: { eyebrow: 'Hot right now', title: 'Trending products', showRank: true, products: { $products: { source: 'featured', limit: 12 } } } },
    { id: 'new-arrivals', name: 'New arrivals', description: 'Latest products first', layout: 'large-first', settings: { eyebrow: 'Just in', title: 'New arrivals', products: { $products: { source: 'newest', limit: 7 } } } },
    { id: 'on-sale', name: 'On sale', description: 'Discounted products', layout: 'grid', scheme: 'accent', settings: { eyebrow: 'Deals', title: 'On sale now', products: { $products: { source: 'sale', limit: 8 } } } },
  ],
  layouts: {
    grid: { description: 'Responsive product grid', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 20, 30, 'c'], [29, 16, 20, 30, 'c'], [52, 16, 20, 30, 'c'], [75, 16, 20, 30, 'c'], [6, 50, 20, 8, 'c'], [29, 50, 20, 8, 'c'], [52, 50, 20, 8, 'c'], [75, 50, 20, 8, 'c']] },
    carousel: { description: 'Horizontal scroll with arrows', thumb: [[6, 8, 40, 5, 'h'], [80, 8, 6, 5, 'm'], [89, 8, 6, 5, 'm'], [6, 20, 24, 36, 'c'], [33, 20, 24, 36, 'c'], [60, 20, 24, 36, 'c'], [87, 20, 13, 36, 'c']] },
    'large-first': { description: 'First product big, the rest beside it', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 42, 44, 'c'], [52, 16, 20, 20, 'c'], [75, 16, 20, 20, 'c'], [52, 40, 20, 20, 'c'], [75, 40, 20, 20, 'c']] },
    list: { description: 'Compact rows with image, name and price', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 12, 12, 'i'], [22, 18, 40, 3, 't'], [22, 23, 20, 3, 'h'], [6, 32, 12, 12, 'i'], [22, 34, 40, 3, 't'], [22, 39, 20, 3, 'h'], [6, 48, 12, 12, 'i'], [22, 50, 40, 3, 't'], [22, 55, 20, 3, 'h']] },
  },
};

export default meta;
