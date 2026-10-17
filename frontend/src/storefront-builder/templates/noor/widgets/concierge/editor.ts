import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'Invite shoppers to book a WhatsApp video call to see pieces live. Uses your store’s WhatsApp number.',
  keywords: ['concierge', 'video call', 'whatsapp', 'personal shopping', 'appointment', 'noor'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'buttonLabel', label: 'Button label', type: 'text' },
    { key: 'message', label: 'WhatsApp message', type: 'textarea', helper: 'Pre-filled when the shopper taps the button.' },
    { key: 'hours', label: 'Call hours', type: 'text', placeholder: 'Mon – Sat, 11 am – 7 pm' },
    { key: 'image', label: 'Photo', type: 'image', showIf: { key: '$layout', equals: ['card'] } },
  ],
  presets: [
    { id: 'concierge', name: 'Video call concierge', description: 'Card with a photo and a WhatsApp button', layout: 'card', scheme: 'soft' },
    { id: 'concierge-banner', name: 'Concierge banner', description: 'One line with a WhatsApp button', layout: 'banner', scheme: 'contrast' },
  ],
  layouts: {
    card: { description: 'Photo beside the invitation', thumb: [[6, 8, 42, 48, 'i'], [54, 16, 30, 4, 'm'], [54, 23, 38, 6, 'h'], [54, 33, 36, 3, 't'], [54, 44, 22, 7, 'b']] },
    banner: { description: 'Slim band with a button', thumb: [[0, 18, 100, 28, 'm'], [8, 26, 44, 5, 'h'], [8, 34, 34, 3, 't'], [70, 27, 22, 9, 'b']] },
  },
};

export default meta;
