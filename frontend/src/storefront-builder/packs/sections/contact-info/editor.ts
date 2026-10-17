import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Contact',
  description: 'Address, phone, email, WhatsApp and opening hours.',
  keywords: ['contact', 'address', 'hours', 'phone', 'email', 'visit us'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 98765 43210' },
    { key: 'email', label: 'Email', type: 'text', placeholder: 'hello@yourstore.in' },
    { key: 'hours', label: 'Opening hours', type: 'list', helper: 'One line per row, e.g. "Mon – Sat: 10 am – 8 pm".' },
    { key: 'showWhatsApp', label: 'Show WhatsApp button', type: 'toggle' },
    { key: 'showDirections', label: 'Show "Get directions" button', type: 'toggle' },
    { key: 'image', label: 'Image', type: 'image', helper: 'Used by the Split layout.' },
  ],
  presets: [
    { id: 'contact', name: 'Contact card', description: 'All details in one card', layout: 'card' },
    { id: 'visit', name: 'Visit our store', description: 'Photo with address and hours', layout: 'split', scheme: 'soft', settings: { eyebrow: 'Visit us', heading: 'Come say hello' } },
  ],
  layouts: {
    card: { description: 'Details in a centred card', thumb: [[18, 6, 64, 52, 'c'], [30, 12, 40, 5, 'h'], [26, 24, 6, 6, 'b'], [35, 25, 36, 3, 't'], [26, 34, 6, 6, 'b'], [35, 35, 30, 3, 't'], [26, 44, 6, 6, 'b'], [35, 45, 34, 3, 't']] },
    split: { description: 'Photo beside the details', thumb: [[6, 6, 42, 52, 'i'], [56, 12, 30, 5, 'h'], [56, 22, 6, 6, 'b'], [65, 23, 28, 3, 't'], [56, 32, 6, 6, 'b'], [65, 33, 24, 3, 't'], [56, 42, 6, 6, 'b'], [65, 43, 26, 3, 't']] },
    columns: { description: 'Contact, hours and address side by side', thumb: [[6, 8, 40, 5, 'h'], [6, 22, 26, 3, 'h'], [6, 28, 26, 3, 't'], [37, 22, 26, 3, 'h'], [37, 28, 26, 3, 't'], [68, 22, 26, 3, 'h'], [68, 28, 26, 3, 't']] },
  },
};

export default meta;
