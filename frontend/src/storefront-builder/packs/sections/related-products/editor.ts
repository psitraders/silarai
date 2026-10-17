import type { PackEditorMeta } from '../../../core/types';
import { CARD_STYLE_FIELD } from '../../../ui/cardStyles';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Product page',
  description: 'More products from the same category as the product being viewed.',
  keywords: ['related', 'similar', 'you may also like', 'cross-sell', 'recommendations'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'limit', label: 'How many products', type: 'number', min: 2, max: 24 },
    CARD_STYLE_FIELD,
  ],
  presets: [
    { id: 'related', name: 'You may also like', description: 'Same-category products in a row', layout: 'carousel' },
  ],
  layouts: {
    carousel: { description: 'Swipeable row', thumb: [[6, 8, 40, 5, 'h'], [6, 20, 24, 36, 'c'], [33, 20, 24, 36, 'c'], [60, 20, 24, 36, 'c'], [87, 20, 13, 36, 'c']] },
    grid: { description: 'Product grid', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 20, 30, 'c'], [29, 16, 20, 30, 'c'], [52, 16, 20, 30, 'c'], [75, 16, 20, 30, 'c']] },
  },
};

export default meta;
