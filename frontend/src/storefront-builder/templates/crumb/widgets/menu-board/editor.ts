import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'Your products as a café menu with dotted price lines, grouped by category. Tap an item to open it.',
  keywords: ['menu', 'cafe', 'bakery', 'price list', 'food', 'crumb'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'categories', label: 'Categories', type: 'categories', helper: 'One menu column per category.' },
    { key: 'perCategory', label: 'Items per category', type: 'number', min: 3, max: 20 },
  ],
  presets: [{ id: 'menu', name: 'Menu board', description: 'Café menu with dotted price lines', layout: 'board', scheme: 'soft' }],
  layouts: {
    board: { description: 'Categories in columns, items with dotted price lines', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 40, 4, 'h'], [6, 23, 40, 2, 't'], [6, 28, 40, 2, 't'], [6, 33, 40, 2, 't'], [54, 16, 40, 4, 'h'], [54, 23, 40, 2, 't'], [54, 28, 40, 2, 't'], [54, 33, 40, 2, 't']] },
  },
};

export default meta;
