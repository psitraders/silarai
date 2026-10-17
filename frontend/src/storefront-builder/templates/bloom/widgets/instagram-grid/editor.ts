import type { PackEditorMeta } from '../../../../core/types';
import { POST_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Media',
  description: 'Upload your Instagram posts and link each to the product in it. Shows your Instagram handle from Business settings.',
  keywords: ['instagram', 'social', 'ugc', 'posts', 'shoppable', 'grid', 'bloom'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'showHandle', label: 'Show “Follow @handle” link', type: 'toggle' },
  ],
  blocks: {
    label: 'Posts',
    max: 12,
    types: [{
      type: 'post', name: 'Post', defaults: { ...POST_DEFAULTS },
      fields: [
        { key: 'image', label: 'Photo', type: 'image', helper: 'Use posts you own or have permission to share.' },
        { key: 'caption', label: 'Caption', type: 'text' },
        { key: 'product', label: 'Product in the post', type: 'products', max: 1 },
      ],
    }],
  },
  presets: [{ id: 'insta', name: 'Shoppable Instagram grid', description: 'Square posts that open the product', layout: 'grid', blocks: [] }],
  layouts: {
    grid: { description: 'Square posts; tap to shop the product', thumb: [[6, 6, 40, 5, 'h'], [6, 15, 28, 21, 'i'], [36, 15, 28, 21, 'i'], [66, 15, 28, 21, 'i'], [6, 38, 28, 21, 'i'], [36, 38, 28, 21, 'i'], [66, 38, 28, 21, 'i']] },
  },
};

export default meta;
