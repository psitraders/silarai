import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'One block per category with +/− buttons, so regulars can fill the cart fast.',
  keywords: ['quick add', 'grocery', 'rows', 'category', 'stepper', 'kirana', 'mandi'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'categories', label: 'Categories', type: 'categories', helper: 'One row per category.' },
    { key: 'perCategory', label: 'Products per category', type: 'number', min: 2, max: 12 },
    { key: 'showViewAll', label: 'Show "View all" links', type: 'toggle' },
  ],
  presets: [
    { id: 'rows', name: 'Quick-add rows', description: 'Products by category with +/−', layout: 'rows' },
    { id: 'swipe', name: 'Swipeable category rows', description: 'Compact cards you can swipe', layout: 'carousel', scheme: 'soft' },
  ],
  layouts: {
    rows: { description: 'A grid of +/− rows under each category', thumb: [[6, 4, 30, 4, 'h'], [6, 11, 42, 9, 'c'], [52, 11, 42, 9, 'c'], [6, 22, 42, 9, 'c'], [52, 22, 42, 9, 'c'], [6, 35, 30, 4, 'h'], [6, 42, 42, 9, 'c'], [52, 42, 42, 9, 'c']] },
    carousel: { description: 'A swipeable row per category', thumb: [[6, 4, 30, 4, 'h'], [6, 11, 20, 20, 'c'], [29, 11, 20, 20, 'c'], [52, 11, 20, 20, 'c'], [75, 11, 20, 20, 'c'], [6, 36, 30, 4, 'h'], [6, 43, 20, 18, 'c'], [29, 43, 20, 18, 'c'], [52, 43, 20, 18, 'c'], [75, 43, 20, 18, 'c']] },
  },
};

export default meta;
