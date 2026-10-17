import type { PackEditorMeta } from '../../../core/types';
import { QUOTE_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Trust',
  description: 'What your customers say, with star ratings.',
  keywords: ['reviews', 'quotes', 'customers', 'social proof'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
  ],
  blocks: {
    label: 'Quotes',
    max: 20,
    types: [{
      type: 'quote', name: 'Quote', defaults: { ...QUOTE_DEFAULTS },
      fields: [
        { key: 'quote', label: 'Quote', type: 'textarea' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'detail', label: 'Detail', type: 'text', placeholder: 'e.g. Bengaluru · Verified buyer' },
        { key: 'rating', label: 'Stars', type: 'number', min: 0, max: 5 },
        { key: 'image', label: 'Photo', type: 'image' },
      ],
    }],
  },
  presets: [
    {
      id: 'reviews', name: 'Customer love', description: 'Three quote cards', layout: 'cards', scheme: 'soft',
      blocks: [
        { type: 'quote', settings: { quote: 'The quality is even better than the photos. Packed beautifully too!', name: 'Ananya', detail: 'Pune', rating: 5 } },
        { type: 'quote', settings: { quote: 'Ordered on WhatsApp, delivered in two days. So easy.', name: 'Rahul', detail: 'Delhi', rating: 5 } },
        { type: 'quote', settings: { quote: 'My go-to shop for gifts now. Everyone loves them.', name: 'Meera', detail: 'Chennai', rating: 5 } },
      ],
    },
  ],
  layouts: {
    cards: { description: 'Quote cards in a grid', thumb: [[30, 6, 40, 5, 'h'], [6, 18, 28, 40, 'c'], [36, 18, 28, 40, 'c'], [66, 18, 28, 40, 'c'], [10, 24, 16, 3, 'b'], [40, 24, 16, 3, 'b'], [70, 24, 16, 3, 'b']] },
    carousel: { description: 'Swipeable quotes', thumb: [[6, 6, 40, 5, 'h'], [6, 18, 38, 40, 'c'], [48, 18, 38, 40, 'c'], [90, 18, 10, 40, 'c']] },
    'big-quote': { description: 'One large quote at a time', thumb: [[45, 8, 10, 8, 'b'], [12, 22, 76, 6, 'h'], [20, 31, 60, 6, 'h'], [38, 44, 24, 3, 't'], [44, 52, 4, 4, 'm'], [50, 52, 4, 4, 'm']] },
  },
};

export default meta;
