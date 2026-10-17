import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Content',
  description: 'A photo beside a short story, with an optional button.',
  keywords: ['about', 'story', 'photo', 'split', 'feature'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Text', type: 'richtext' },
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'imageRatio', label: 'Image shape', type: 'select', options: [{ value: 'square', label: 'Square' }, { value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }] },
    { key: 'buttonLabel', label: 'Button text', type: 'text' },
    { key: 'buttonLink', label: 'Button link', type: 'link' },
  ],
  presets: [
    { id: 'story', name: 'Brand story', description: 'Photo left, story right', layout: 'image-left', settings: { eyebrow: 'Our story', heading: 'Small batches, big heart', buttonLabel: 'Read more' } },
    { id: 'highlight', name: 'Product highlight', description: 'Overlapping card', layout: 'overlap', scheme: 'soft', settings: { eyebrow: 'Bestseller', heading: 'The one everyone asks about', buttonLabel: 'Shop now', buttonLink: { $link: '/products' } } },
  ],
  layouts: {
    'image-left': { description: 'Photo on the left', thumb: [[6, 6, 42, 52, 'i'], [56, 18, 36, 6, 'h'], [56, 28, 36, 3, 't'], [56, 34, 30, 3, 't'], [56, 43, 18, 6, 'b']] },
    'image-right': { description: 'Photo on the right', thumb: [[52, 6, 42, 52, 'i'], [8, 18, 36, 6, 'h'], [8, 28, 36, 3, 't'], [8, 34, 30, 3, 't'], [8, 43, 18, 6, 'b']] },
    overlap: { description: 'Text card overlapping the photo', thumb: [[6, 6, 56, 52, 'i'], [50, 16, 44, 32, 'c'], [56, 22, 30, 5, 'h'], [56, 31, 32, 3, 't'], [56, 38, 16, 5, 'b']] },
    'full-bleed': { description: 'Text over a wide photo', thumb: [[0, 0, 100, 64, 'i'], [10, 22, 40, 6, 'h'], [10, 32, 36, 3, 't'], [10, 40, 18, 6, 'b']] },
  },
};

export default meta;
