import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'Shows how much more the shopper needs for free delivery. Display only — it doesn’t change delivery charges.',
  keywords: ['free delivery', 'shipping', 'progress', 'cart', 'threshold', 'mandi'],
  fields: [
    { key: 'threshold', label: 'Free delivery from (₹)', type: 'number', min: 0, helper: '0 = use the amount set under Style → Store behaviour → Cart.' },
    { key: 'progressText', label: 'Text while below', type: 'text', helper: '{amount} becomes the amount still needed.' },
    { key: 'doneText', label: 'Text when reached', type: 'text' },
  ],
  presets: [{ id: 'bar', name: 'Free-delivery progress', description: 'Slim bar that fills as the cart grows', layout: 'bar', scheme: 'soft' }],
  layouts: {
    bar: { description: 'Text with a progress bar', thumb: [[0, 20, 100, 24, 'm'], [20, 25, 60, 4, 't'], [20, 33, 60, 4, 'b']] },
  },
};

export default meta;
