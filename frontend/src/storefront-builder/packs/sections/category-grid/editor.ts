import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'Your categories as tiles, circles or a scrollable rail.',
  keywords: ['categories', 'collections', 'departments'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'categories', label: 'Categories', type: 'categories' },
    { key: 'showAll', label: 'Show "All" tile', type: 'toggle' },
  ],
  presets: [
    { id: 'rail', name: 'Category rail', description: 'Round icons you can swipe', layout: 'icon-rail' },
    { id: 'tiles', name: 'Featured categories', description: 'Large photo tiles', layout: 'tiles', settings: { title: 'Shop our favourites', categories: { $categories: { source: 'featured', limit: 8 } } } },
  ],
  layouts: {
    'icon-rail': { description: 'Round icons in a scrollable row', thumb: [[6, 8, 40, 5, 'h'], [6, 24, 14, 14, 'i'], [24, 24, 14, 14, 'i'], [42, 24, 14, 14, 'i'], [60, 24, 14, 14, 'i'], [78, 24, 14, 14, 'i'], [6, 42, 14, 3, 't'], [24, 42, 14, 3, 't'], [42, 42, 14, 3, 't'], [60, 42, 14, 3, 't'], [78, 42, 14, 3, 't']] },
    tiles: { description: 'Image tiles in a grid', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 28, 20, 'i'], [37, 16, 28, 20, 'i'], [68, 16, 28, 20, 'i'], [6, 39, 28, 20, 'i'], [37, 39, 28, 20, 'i'], [68, 39, 28, 20, 'i']] },
    circles: { description: 'Round photos in a centred grid', thumb: [[30, 6, 40, 5, 'h'], [10, 18, 18, 18, 'i'], [32, 18, 18, 18, 'i'], [54, 18, 18, 18, 'i'], [76, 18, 18, 18, 'i'], [12, 41, 14, 3, 't'], [34, 41, 14, 3, 't'], [56, 41, 14, 3, 't'], [78, 41, 14, 3, 't']] },
    'banner-cards': { description: 'Wide cards with name and arrow', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 43, 20, 'i'], [51, 16, 43, 20, 'i'], [6, 39, 43, 20, 'i'], [51, 39, 43, 20, 'i']] },
  },
};

export default meta;
