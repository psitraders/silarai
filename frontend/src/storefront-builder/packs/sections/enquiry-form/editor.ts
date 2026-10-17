import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Contact',
  description: 'A message form — enquiries arrive as leads, like product inquiries.',
  keywords: ['contact form', 'enquiry', 'inquiry', 'custom order', 'message', 'lead'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'image', label: 'Image', type: 'image', showIf: { key: '$layout', equals: ['split'] } },
    { key: 'askEmail', label: 'Ask for email', type: 'toggle' },
    { key: 'messagePlaceholder', label: 'Message hint', type: 'text' },
    { key: 'buttonLabel', label: 'Button text', type: 'text' },
    { key: 'successText', label: 'Thank-you message', type: 'text' },
  ],
  presets: [
    { id: 'contact', name: 'Contact form', description: 'Centred form card', layout: 'simple', scheme: 'soft' },
    { id: 'custom-order', name: 'Custom order request', description: 'Photo + form', layout: 'split', settings: { eyebrow: 'Made for you', heading: 'Request a custom order', text: 'Tell us the occasion, size and budget — we will reply with options.', messagePlaceholder: 'Occasion, size, flavour or colour, delivery date…', buttonLabel: 'Send request' } },
  ],
  layouts: {
    simple: { description: 'Centred form card', thumb: [[30, 4, 40, 5, 'h'], [36, 11, 28, 3, 't'], [20, 18, 60, 42, 'c'], [24, 23, 25, 6, 'm'], [51, 23, 25, 6, 'm'], [24, 32, 52, 14, 'm'], [24, 50, 18, 6, 'b']] },
    split: { description: 'Photo beside the form', thumb: [[6, 4, 42, 56, 'i'], [54, 8, 30, 5, 'h'], [54, 16, 36, 3, 't'], [54, 24, 40, 6, 'm'], [54, 32, 40, 14, 'm'], [54, 50, 18, 6, 'b']] },
  },
};

export default meta;
