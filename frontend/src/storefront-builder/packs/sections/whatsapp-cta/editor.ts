import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'Invite shoppers to chat with you on WhatsApp. Hidden when no number is set.',
  fields: [
    { key: 'badge', label: 'Badge', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Text', type: 'textarea' },
    { key: 'buttonLabel', label: 'Button text', type: 'text' },
    { key: 'message', label: 'Pre-filled WhatsApp message', type: 'text' },
    { key: 'points', label: 'Points', type: 'list', helper: 'Short reassurance points shown with ticks.' },
  ],
  keywords: ['whatsapp', 'chat', 'contact', 'help'],
  presets: [
    { id: 'help', name: 'Need help choosing?', description: 'Band with button', layout: 'banner' },
    { id: 'custom-orders', name: 'Custom orders', description: 'Centred card', layout: 'card', scheme: 'soft', settings: { badge: 'Made for you', heading: 'Want something custom?', body: 'Tell us what you have in mind and we will make it for you.', buttonLabel: 'Ask on WhatsApp', message: 'Hi! I would like to place a custom order.' } },
  ],
  layouts: {
    banner: { description: 'Gradient band with button', thumb: [[4, 10, 92, 44, 'm'], [10, 18, 16, 4, 'b'], [10, 26, 44, 6, 'h'], [10, 36, 36, 3, 't'], [70, 26, 20, 8, 'b']] },
    card: { description: 'Centred card with ticks', thumb: [[22, 6, 56, 52, 'c'], [40, 12, 20, 4, 'b'], [30, 20, 40, 6, 'h'], [30, 30, 40, 3, 't'], [38, 42, 24, 7, 'b']] },
  },
};

export default meta;
