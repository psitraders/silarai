import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Trust',
  description: 'A row of reassurance points: delivery, payments, returns.',
  keywords: ['trust', 'usp', 'guarantee', 'delivery', 'returns'],
  fields: [
    {
      key: 'items', label: 'Badges', type: 'list',
      itemFields: [
        {
          key: 'icon', label: 'Icon', type: 'select',
          options: ['truck', 'shield', 'whatsapp', 'returns', 'verified', 'lock', 'star', 'gift'].map(v => ({ value: v, label: v })),
        },
        { key: 'text', label: 'Text', type: 'text' },
      ],
    },
  ],
  presets: [
    { id: 'ribbon', name: 'Trust ribbon', description: 'One compact row under the hero', layout: 'ribbon' },
    { id: 'cards', name: 'Why shop with us', description: 'Icon cards', layout: 'cards', scheme: 'soft' },
  ],
  layouts: {
    ribbon: { description: 'One compact row', thumb: [[0, 24, 100, 16, 'm'], [6, 30, 4, 4, 'b'], [12, 31, 14, 3, 't'], [32, 30, 4, 4, 'b'], [38, 31, 14, 3, 't'], [58, 30, 4, 4, 'b'], [64, 31, 14, 3, 't'], [84, 30, 4, 4, 'b'], [90, 31, 8, 3, 't']] },
    cards: { description: 'Icon cards in a grid', thumb: [[6, 14, 20, 36, 'c'], [29, 14, 20, 36, 'c'], [52, 14, 20, 36, 'c'], [75, 14, 20, 36, 'c'], [12, 22, 8, 8, 'b'], [35, 22, 8, 8, 'b'], [58, 22, 8, 8, 'b'], [81, 22, 8, 8, 'b']] },
    'icons-row': { description: 'Large centred icons with labels', thumb: [[10, 16, 12, 12, 'b'], [34, 16, 12, 12, 'b'], [58, 16, 12, 12, 'b'], [82, 16, 12, 12, 'b'], [6, 34, 20, 3, 'h'], [30, 34, 20, 3, 'h'], [54, 34, 20, 3, 'h'], [78, 34, 20, 3, 'h']] },
  },
};

export default meta;
