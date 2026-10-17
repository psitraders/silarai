import type { PackEditorMeta } from '../../../../core/types';
import { SPOT_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'A styled photo with tappable dots — each opens the product being worn.',
  keywords: ['look', 'lookbook', 'hotspot', 'shoppable', 'styled', 'outfit', 'noor'],
  fields: [
    { key: 'image', label: 'Look photo', type: 'image', helper: 'A styled photo showing the pieces. Then add a hotspot per product.' },
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
  ],
  blocks: {
    label: 'Hotspots',
    max: 8,
    types: [{
      type: 'spot', name: 'Hotspot', defaults: { ...SPOT_DEFAULTS },
      fields: [
        { key: 'product', label: 'Product', type: 'products', max: 1 },
        { key: 'x', label: 'Across (%)', type: 'number', min: 0, max: 100, helper: '0 = left edge, 100 = right edge of the photo.' },
        { key: 'y', label: 'Down (%)', type: 'number', min: 0, max: 100, helper: '0 = top, 100 = bottom.' },
      ],
    }],
  },
  presets: [
    { id: 'look', name: 'Shop the look', description: 'Photo with product hotspots', layout: 'hotspots', blocks: [{ type: 'spot', settings: { x: 40, y: 35 } }, { type: 'spot', settings: { x: 62, y: 60 } }] },
  ],
  layouts: {
    hotspots: { description: 'Photo with dots, products beside it', thumb: [[6, 6, 46, 52, 'i'], [22, 22, 4, 4, 'b'], [34, 40, 4, 4, 'b'], [58, 10, 36, 5, 'h'], [58, 20, 36, 14, 'c'], [58, 38, 36, 14, 'c']] },
    stacked: { description: 'Wide photo with dots, products below', thumb: [[6, 4, 88, 34, 'i'], [30, 16, 4, 4, 'b'], [62, 24, 4, 4, 'b'], [6, 42, 27, 18, 'c'], [36, 42, 27, 18, 'c'], [66, 42, 27, 18, 'c']] },
  },
};

export default meta;
