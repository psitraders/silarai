import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'Today’s deals with a live countdown. Set the discount on the products themselves — prices here are always live.',
  keywords: ['deal', 'offer', 'timer', 'countdown', 'sale', 'today', 'mandi'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'products', label: 'Deal products', type: 'products', max: 8, helper: '“On sale” shows products with a sale price.' },
    { key: 'endsAt', label: 'Ends at', type: 'date', helper: 'Leave empty to count down to midnight every day.' },
    { key: 'hideWhenDone', label: 'Hide when the time is up', type: 'toggle', helper: 'Only for a fixed end time.' },
  ],
  presets: [
    { id: 'deal', name: 'Deal of the day', description: 'Big deal with a timer and more deals beside it', layout: 'spotlight', scheme: 'accent' },
    { id: 'deal-strip', name: 'Deals strip', description: 'Timer and a row of deals', layout: 'strip', scheme: 'soft' },
  ],
  layouts: {
    spotlight: { description: 'One big deal with the timer, more deals beside it', thumb: [[6, 6, 40, 6, 'h'], [6, 16, 40, 8, 'b'], [6, 28, 40, 30, 'c'], [52, 6, 42, 16, 'c'], [52, 25, 42, 16, 'c'], [52, 44, 42, 14, 'c']] },
    strip: { description: 'Timer, then a row of deals', thumb: [[6, 6, 30, 6, 'h'], [60, 6, 34, 7, 'b'], [6, 20, 20, 36, 'c'], [29, 20, 20, 36, 'c'], [52, 20, 20, 36, 'c'], [75, 20, 20, 36, 'c']] },
  },
};

export default meta;
