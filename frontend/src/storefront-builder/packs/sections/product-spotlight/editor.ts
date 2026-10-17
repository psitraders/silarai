import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'One product, big — with price and an add-to-cart button.',
  keywords: ['feature product', 'hero product', 'bestseller', 'single product'],
  fields: [
    { key: 'product', label: 'Product', type: 'products', helper: 'Pick one product, or use the first featured / newest one.', max: 1 },
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text', helper: 'Leave empty to use the product name.' },
    { key: 'text', label: 'Text', type: 'textarea', helper: 'Leave empty to use the product description.' },
    { key: 'buttonLabel', label: 'Button text', type: 'text' },
  ],
  presets: [
    { id: 'bestseller', name: 'Bestseller spotlight', description: 'Your top featured product', layout: 'image-left', scheme: 'soft' },
  ],
  layouts: {
    'image-left': { description: 'Photo left, details right', thumb: [[6, 6, 44, 52, 'i'], [56, 14, 20, 3, 'b'], [56, 20, 36, 6, 'h'], [56, 30, 20, 5, 'h'], [56, 38, 34, 3, 't'], [56, 46, 26, 7, 'b']] },
    'image-right': { description: 'Details left, photo right', thumb: [[50, 6, 44, 52, 'i'], [8, 14, 20, 3, 'b'], [8, 20, 36, 6, 'h'], [8, 30, 20, 5, 'h'], [8, 38, 34, 3, 't'], [8, 46, 26, 7, 'b']] },
  },
};

export default meta;
