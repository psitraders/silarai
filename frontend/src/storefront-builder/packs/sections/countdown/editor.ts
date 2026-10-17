import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'A live timer for a sale or launch. Hides itself when it ends.',
  keywords: ['timer', 'sale', 'deal', 'launch', 'offer', 'countdown'],
  fields: [
    { key: 'endsAt', label: 'Ends at', type: 'date' },
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'buttonLabel', label: 'Button text', type: 'text' },
    { key: 'buttonLink', label: 'Button link', type: 'link' },
    { key: 'hideWhenDone', label: 'Hide when the timer ends', type: 'toggle' },
  ],
  presets: [
    { id: 'sale', name: 'Sale countdown', description: 'Brand band with timer', layout: 'banner', scheme: 'brand' },
    { id: 'launch', name: 'Launch countdown', description: 'Card with big digits', layout: 'boxed', scheme: 'soft', settings: { eyebrow: 'Coming soon', heading: 'New collection drops in', buttonLabel: 'Get notified on WhatsApp' } },
  ],
  layouts: {
    banner: { description: 'Text and timer in one band', thumb: [[0, 12, 100, 40, 'm'], [6, 22, 34, 6, 'h'], [6, 32, 24, 3, 't'], [50, 22, 9, 12, 'c'], [61, 22, 9, 12, 'c'], [72, 22, 9, 12, 'c'], [83, 22, 9, 12, 'c']] },
    boxed: { description: 'Big digits in a centred card', thumb: [[14, 4, 72, 56, 'c'], [30, 10, 40, 5, 'h'], [22, 22, 12, 16, 'm'], [37, 22, 12, 16, 'm'], [52, 22, 12, 16, 'm'], [67, 22, 12, 16, 'm'], [40, 46, 20, 7, 'b']] },
  },
};

export default meta;
