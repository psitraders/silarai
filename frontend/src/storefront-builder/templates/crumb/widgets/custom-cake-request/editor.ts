import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Contact',
  description: 'A custom cake request form (occasion, date, size, flavour). Requests arrive as leads.',
  keywords: ['custom cake', 'order form', 'request', 'celebration', 'bakery', 'crumb'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'image', label: 'Photo', type: 'image' },
    { key: 'occasions', label: 'Occasion choices', type: 'list' },
    { key: 'sizes', label: 'Size choices', type: 'list' },
    { key: 'askFlavour', label: 'Ask for a flavour', type: 'toggle' },
    { key: 'buttonLabel', label: 'Button label', type: 'text' },
    { key: 'successText', label: 'Thank-you message', type: 'text' },
  ],
  presets: [{ id: 'cake', name: 'Custom cake request', description: 'Photo beside a request form', layout: 'split', scheme: 'soft' }],
  layouts: {
    split: { description: 'Photo beside the request form', thumb: [[6, 6, 40, 52, 'i'], [52, 8, 30, 5, 'h'], [52, 17, 42, 6, 'c'], [52, 26, 20, 6, 'c'], [74, 26, 20, 6, 'c'], [52, 35, 42, 10, 'c'], [52, 49, 24, 7, 'b']] },
  },
};

export default meta;
