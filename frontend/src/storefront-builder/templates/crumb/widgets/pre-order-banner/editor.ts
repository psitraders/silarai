import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'Announce pre-orders with an order-by date. Hides itself after the date if you like.',
  keywords: ['pre-order', 'preorder', 'festive', 'hamper', 'order by', 'crumb'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'orderBy', label: 'Order by', type: 'date', helper: 'Optional.' },
    { key: 'hideAfter', label: 'Hide after the order-by date', type: 'toggle' },
    { key: 'buttonLabel', label: 'Button label', type: 'text' },
    { key: 'buttonLink', label: 'Button link', type: 'link' },
  ],
  presets: [{ id: 'preorder', name: 'Pre-order banner', description: 'Order-by date and a button', layout: 'banner', scheme: 'brand' }],
  layouts: {
    banner: { description: 'Heading, order-by date and a button', thumb: [[0, 14, 100, 36, 'm'], [8, 22, 40, 6, 'h'], [8, 32, 30, 3, 't'], [8, 39, 20, 4, 't'], [70, 27, 22, 9, 'b']] },
  },
};

export default meta;
