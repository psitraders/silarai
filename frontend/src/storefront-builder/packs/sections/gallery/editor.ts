import type { PackEditorMeta } from '../../../core/types';
import { IMAGE_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Media',
  description: 'A set of photos — lookbook, workshop, happy customers.',
  keywords: ['photos', 'images', 'lookbook', 'instagram', 'masonry'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
    { key: 'columns', label: 'Columns (wide screens)', type: 'select', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
  ],
  blocks: {
    label: 'Images',
    max: 24,
    types: [{
      type: 'image', name: 'Image', defaults: { ...IMAGE_DEFAULTS },
      fields: [
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'caption', label: 'Caption', type: 'text' },
        { key: 'link', label: 'Link', type: 'link' },
      ],
    }],
  },
  presets: [
    { id: 'lookbook', name: 'Lookbook', description: 'Six photos in a grid', layout: 'grid', blocks: Array.from({ length: 6 }, () => ({ type: 'image' })) },
    { id: 'masonry', name: 'Instagram wall', description: 'Masonry photo wall', layout: 'masonry', settings: { heading: 'Follow us on Instagram', columns: '4' }, blocks: Array.from({ length: 8 }, () => ({ type: 'image' })) },
  ],
  layouts: {
    grid: { description: 'Even square tiles', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 28, 20, 'i'], [37, 16, 28, 20, 'i'], [68, 16, 28, 20, 'i'], [6, 39, 28, 20, 'i'], [37, 39, 28, 20, 'i'], [68, 39, 28, 20, 'i']] },
    masonry: { description: 'Natural heights, Pinterest-style', thumb: [[6, 6, 28, 30, 'i'], [37, 6, 28, 18, 'i'], [68, 6, 28, 26, 'i'], [6, 39, 28, 20, 'i'], [37, 27, 28, 32, 'i'], [68, 35, 28, 24, 'i']] },
    carousel: { description: 'Swipeable row of photos', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 30, 42, 'i'], [39, 16, 30, 42, 'i'], [72, 16, 28, 42, 'i']] },
  },
};

export default meta;
