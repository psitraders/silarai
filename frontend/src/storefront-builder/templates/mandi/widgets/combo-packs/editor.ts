import type { PackEditorMeta } from '../../../../core/types';
import { COMBO_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'Ready-made bundles shoppers add in one tap. The total is the sum of live prices — no separate combo price.',
  keywords: ['combo', 'bundle', 'pack', 'kit', 'add all', 'grocery', 'mandi'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
  ],
  blocks: {
    label: 'Combos',
    max: 6,
    types: [{
      type: 'combo', name: 'Combo', defaults: { ...COMBO_DEFAULTS },
      fields: [
        { key: 'title', label: 'Name', type: 'text' },
        { key: 'note', label: 'Note', type: 'text', placeholder: 'Serves a family of four' },
        { key: 'products', label: 'Products in the combo', type: 'products', max: 6 },
      ],
    }],
  },
  presets: [
    {
      id: 'combos', name: 'Combo packs', description: 'Bundles with "Add all to cart"', layout: 'cards', scheme: 'soft',
      blocks: [{ type: 'combo', settings: { title: 'Breakfast combo' } }, { type: 'combo', settings: { title: 'Monthly staples' } }],
    },
  ],
  layouts: {
    cards: { description: 'One card per combo with its items and total', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 42, 42, 'c'], [10, 22, 8, 8, 'i'], [20, 22, 8, 8, 'i'], [30, 22, 8, 8, 'i'], [10, 46, 30, 7, 'b'], [52, 16, 42, 42, 'c'], [56, 22, 8, 8, 'i'], [66, 22, 8, 8, 'i'], [56, 46, 30, 7, 'b']] },
  },
};

export default meta;
