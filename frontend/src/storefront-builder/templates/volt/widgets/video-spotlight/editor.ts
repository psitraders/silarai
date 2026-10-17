import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Media',
  description: 'Plays a product’s own video (an .mp4 or .webm uploaded among its photos), with its live price and a button.',
  keywords: ['video', 'product video', 'demo', 'spotlight', 'electronics', 'volt'],
  fields: [
    { key: 'product', label: 'Product', type: 'products', max: 1 },
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Empty = the product name' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'buttonLabel', label: 'Button label', type: 'text' },
  ],
  presets: [
    { id: 'video', name: 'Video spotlight', description: 'Product video beside its details', layout: 'split', scheme: 'contrast' },
    { id: 'video-wide', name: 'Wide product video', description: 'Video across the page', layout: 'wide', scheme: 'contrast' },
  ],
  layouts: {
    split: { description: 'Video beside the product details', thumb: [[6, 8, 52, 48, 'i'], [64, 18, 30, 5, 'h'], [64, 27, 26, 3, 't'], [64, 34, 16, 4, 'h'], [64, 44, 22, 7, 'b']] },
    wide: { description: 'Video across the page, details below', thumb: [[6, 4, 88, 40, 'i'], [6, 48, 40, 5, 'h'], [72, 47, 22, 7, 'b']] },
  },
};

export default meta;
