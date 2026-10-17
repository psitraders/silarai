import type { PackEditorMeta } from '../../../../core/types';
import { STORY_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Media',
  description: 'Instagram-style stories: shoppers tap through looks and shop the pieces in each.',
  keywords: ['stories', 'lookbook', 'looks', 'outfits', 'fashion', 'bloom'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
  ],
  blocks: {
    label: 'Stories',
    max: 12,
    types: [{
      type: 'story', name: 'Story', defaults: { ...STORY_DEFAULTS },
      fields: [
        { key: 'image', label: 'Photo', type: 'image', helper: 'Tall photos (9:16) look best.' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'products', label: 'Products in this look', type: 'products', max: 4 },
      ],
    }],
  },
  presets: [
    { id: 'stories', name: 'Lookbook stories', description: 'Story circles that open full screen', layout: 'circles', blocks: [{ type: 'story', settings: { title: 'Festive' } }, { type: 'story', settings: { title: 'Office' } }, { type: 'story', settings: { title: 'Weekend' } }] },
    { id: 'story-cards', name: 'Story cards', description: 'Tall cards in a swipeable row', layout: 'cards', scheme: 'soft' },
  ],
  layouts: {
    circles: { description: 'Round story bubbles, open full screen', thumb: [[6, 8, 40, 5, 'h'], [6, 20, 16, 16, 'i'], [26, 20, 16, 16, 'i'], [46, 20, 16, 16, 'i'], [66, 20, 16, 16, 'i'], [6, 40, 16, 3, 't'], [26, 40, 16, 3, 't'], [46, 40, 16, 3, 't'], [66, 40, 16, 3, 't']] },
    cards: { description: 'Tall story cards in a row', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 20, 42, 'i'], [29, 16, 20, 42, 'i'], [52, 16, 20, 42, 'i'], [75, 16, 20, 42, 'i']] },
  },
};

export default meta;
