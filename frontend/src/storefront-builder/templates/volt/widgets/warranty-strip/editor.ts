import type { PackEditorMeta } from '../../../../core/types';
import { ASSURANCE_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Trust',
  description: 'Warranty, payment options (e.g. EMI) and support in one strip. Only list what you actually offer.',
  keywords: ['warranty', 'emi', 'payment', 'support', 'guarantee', 'electronics', 'volt'],
  fields: [{ key: 'heading', label: 'Heading', type: 'text', helper: 'Optional.' }],
  blocks: {
    label: 'Items',
    max: 6,
    types: [{
      type: 'item', name: 'Item', defaults: { ...ASSURANCE_DEFAULTS },
      fields: [
        { key: 'icon', label: 'Icon', type: 'icon' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'detail', label: 'Detail', type: 'text' },
      ],
    }],
  },
  presets: [{
    id: 'assurance', name: 'Warranty & payment strip', description: 'Warranty, payments and support', layout: 'strip', scheme: 'contrast',
    blocks: [
      { type: 'item', settings: { icon: 'shield', title: 'Warranty', detail: 'As per the brand' } },
      { type: 'item', settings: { icon: 'card', title: 'Secure payments', detail: 'UPI, cards and more' } },
      { type: 'item', settings: { icon: 'verified', title: 'Genuine products', detail: 'Sealed and original' } },
      { type: 'item', settings: { icon: 'support', title: 'Support', detail: 'Help on WhatsApp' } },
    ],
  }],
  layouts: {
    strip: { description: 'Icons and short lines in one band', thumb: [[0, 22, 100, 20, 'm'], [6, 28, 6, 6, 'i'], [14, 29, 12, 4, 't'], [30, 28, 6, 6, 'i'], [38, 29, 12, 4, 't'], [54, 28, 6, 6, 'i'], [62, 29, 12, 4, 't'], [78, 28, 6, 6, 'i'], [86, 29, 10, 4, 't']] },
  },
};

export default meta;
