import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'A slim, swipeable row of category chips — fast jumps for regular shoppers.',
  keywords: ['categories', 'chips', 'rail', 'navigation', 'grocery', 'mandi'],
  fields: [
    { key: 'heading', label: 'Heading', type: 'text', helper: 'Optional.' },
    { key: 'categories', label: 'Categories', type: 'categories' },
    { key: 'showAll', label: 'Start with an "All products" chip', type: 'toggle' },
  ],
  presets: [
    { id: 'chips', name: 'Category chips', description: 'Slim row of text chips', layout: 'chips' },
    { id: 'photo-chips', name: 'Category photo chips', description: 'Chips with a small photo', layout: 'photo-chips' },
  ],
  layouts: {
    chips: { description: 'Text chips in one swipeable row', thumb: [[0, 24, 100, 16, 'm'], [6, 28, 14, 7, 'b'], [23, 28, 16, 7, 'c'], [42, 28, 14, 7, 'c'], [59, 28, 18, 7, 'c'], [80, 28, 14, 7, 'c']] },
    'photo-chips': { description: 'Chips with a round photo', thumb: [[6, 26, 20, 11, 'c'], [7, 27, 9, 9, 'i'], [29, 26, 20, 11, 'c'], [30, 27, 9, 9, 'i'], [52, 26, 20, 11, 'c'], [53, 27, 9, 9, 'i'], [75, 26, 20, 11, 'c'], [76, 27, 9, 9, 'i']] },
  },
};

export default meta;
