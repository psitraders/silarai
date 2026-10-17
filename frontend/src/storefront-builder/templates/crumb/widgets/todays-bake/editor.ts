import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'Today’s specials with a countdown to your daily order cut-off.',
  keywords: ['today', 'specials', 'fresh', 'cutoff', 'bakery', 'daily', 'crumb'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'products', label: 'Today’s products', type: 'products', max: 8 },
    { key: 'cutoff', label: 'Order cut-off (24 h, e.g. 18:00)', type: 'text', placeholder: '18:00', helper: 'Leave empty to hide the countdown.' },
    { key: 'afterCutoff', label: 'Text after the cut-off', type: 'text' },
  ],
  presets: [{ id: 'bake', name: 'Today’s bake', description: 'Specials with an order cut-off countdown', layout: 'cards', scheme: 'accent' }],
  layouts: {
    cards: { description: 'Countdown bar over product cards', thumb: [[6, 6, 40, 5, 'h'], [60, 6, 34, 6, 'b'], [6, 18, 20, 38, 'c'], [29, 18, 20, 38, 'c'], [52, 18, 20, 38, 'c'], [75, 18, 20, 38, 'c']] },
  },
};

export default meta;
