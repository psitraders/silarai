import type { PackEditorMeta } from '../../../../core/types';
import { OCCASION_TILE_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'Occasion tiles (Wedding, Festive, Office…), each opening a category.',
  keywords: ['occasion', 'wedding', 'festive', 'office', 'collections', 'tiles', 'bloom'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
  ],
  blocks: {
    label: 'Occasions',
    max: 8,
    types: [{
      type: 'occasion', name: 'Occasion', defaults: { ...OCCASION_TILE_DEFAULTS },
      fields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'category', label: 'Opens category', type: 'categories', helper: 'The first category is used. “All” opens all products.' },
        { key: 'image', label: 'Photo', type: 'image', helper: 'Optional — the category photo is used otherwise.' },
      ],
    }],
  },
  presets: [
    {
      id: 'occasions', name: 'Shop by occasion', description: 'Four photo tiles', layout: 'tiles',
      blocks: [{ type: 'occasion', settings: { label: 'Wedding' } }, { type: 'occasion', settings: { label: 'Festive' } }, { type: 'occasion', settings: { label: 'Office' } }, { type: 'occasion', settings: { label: 'Casual' } }],
    },
  ],
  layouts: {
    tiles: { description: 'Tall photo tiles with the label over them', thumb: [[6, 8, 20, 48, 'i'], [29, 8, 20, 48, 'i'], [52, 8, 20, 48, 'i'], [75, 8, 20, 48, 'i']] },
    arches: { description: 'Arched photos with the label below', thumb: [[6, 8, 20, 40, 'i'], [29, 8, 20, 40, 'i'], [52, 8, 20, 40, 'i'], [75, 8, 20, 40, 'i'], [9, 52, 14, 3, 't'], [32, 52, 14, 3, 't'], [55, 52, 14, 3, 't'], [78, 52, 14, 3, 't']] },
  },
};

export default meta;
