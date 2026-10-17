import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Hero',
  description: 'One collection, full width, with a fine accent rule. Uses the category photo if you don’t upload one.',
  keywords: ['collection', 'spotlight', 'banner', 'luxury', 'category', 'noor'],
  fields: [
    { key: 'category', label: 'Collection', type: 'categories', helper: 'The first category is shown and linked.' },
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Empty = the category name' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'image', label: 'Photo', type: 'image', helper: 'Optional — the category photo is used otherwise.' },
    { key: 'buttonLabel', label: 'Button label', type: 'text' },
    { key: 'height', label: 'Height', type: 'select', options: [{ value: 'regular', label: 'Regular' }, { value: 'tall', label: 'Tall' }], showIf: { key: '$layout', equals: ['full-bleed'] } },
  ],
  presets: [
    { id: 'spotlight', name: 'Collection spotlight', description: 'Full-bleed band for one collection', layout: 'full-bleed', scheme: 'contrast' },
    { id: 'framed', name: 'Framed collection', description: 'Framed photo beside the story', layout: 'framed', scheme: 'soft' },
  ],
  layouts: {
    'full-bleed': { description: 'Photo across the page, text over it', thumb: [[0, 0, 100, 64, 'i'], [10, 30, 10, 1, 'm'], [10, 34, 44, 6, 'h'], [10, 43, 30, 3, 't'], [10, 50, 18, 6, 'b']] },
    framed: { description: 'Framed photo beside the text', thumb: [[8, 8, 38, 50, 'c'], [11, 11, 32, 44, 'i'], [54, 20, 8, 1, 'm'], [54, 24, 38, 6, 'h'], [54, 33, 30, 3, 't'], [54, 42, 18, 6, 'b']] },
  },
};

export default meta;
