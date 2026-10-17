import type { PackEditorMeta } from '../../../../core/types';
import { BENTO_TILE_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Content',
  description: 'Features in a bento grid: mix small, wide, tall and large tiles with icons or photos.',
  keywords: ['bento', 'features', 'tiles', 'grid', 'tech', 'highlights', 'volt'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
  ],
  blocks: {
    label: 'Tiles',
    max: 10,
    types: [{
      type: 'tile', name: 'Tile', defaults: { ...BENTO_TILE_DEFAULTS },
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'text', label: 'Text', type: 'textarea' },
        { key: 'icon', label: 'Icon', type: 'icon' },
        { key: 'image', label: 'Photo', type: 'image', helper: 'Optional — fills the tile behind the text.' },
        { key: 'size', label: 'Size', type: 'select', options: [{ value: 'small', label: 'Small' }, { value: 'wide', label: 'Wide' }, { value: 'tall', label: 'Tall' }, { value: 'large', label: 'Large' }] },
      ],
    }],
  },
  presets: [{
    id: 'bento', name: 'Feature bento', description: 'Mixed tiles with icons', layout: 'bento', scheme: 'contrast',
    blocks: [
      { type: 'tile', settings: { icon: 'zap', title: 'Fast', text: 'Describe your headline feature.', size: 'large' } },
      { type: 'tile', settings: { icon: 'shield', title: 'Warranty', text: 'Say what the warranty covers.', size: 'small' } },
      { type: 'tile', settings: { icon: 'truck', title: 'Quick delivery', text: 'Say how fast you ship.', size: 'small' } },
      { type: 'tile', settings: { icon: 'support', title: 'Real support', text: 'Say how shoppers reach you.', size: 'wide' } },
    ],
  }],
  layouts: {
    bento: { description: 'Mixed tile sizes in a 4-column grid', thumb: [[6, 6, 42, 52, 'c'], [51, 6, 20, 25, 'c'], [74, 6, 20, 25, 'c'], [51, 33, 43, 25, 'c']] },
  },
};

export default meta;
