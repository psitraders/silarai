import type { PackEditorMeta } from '../../../core/types';
import { QUESTION_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Content',
  description: 'Questions and answers that open on tap.',
  keywords: ['questions', 'help', 'shipping', 'returns', 'accordion'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
  ],
  blocks: {
    label: 'Questions',
    max: 30,
    types: [{
      type: 'question', name: 'Question', defaults: { ...QUESTION_DEFAULTS },
      fields: [
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer', label: 'Answer', type: 'textarea' },
      ],
    }],
  },
  presets: [
    {
      id: 'delivery', name: 'Delivery & returns', description: 'Common shopping questions', layout: 'accordion',
      blocks: [
        { type: 'question', settings: { question: 'How long does delivery take?', answer: 'Orders ship in 1–2 working days and usually arrive within 3–7 days.' } },
        { type: 'question', settings: { question: 'Do you offer cash on delivery?', answer: 'Yes, cash on delivery is available on most pin codes.' } },
        { type: 'question', settings: { question: 'Can I return an item?', answer: 'Unused items can be returned within 7 days of delivery.' } },
        { type: 'question', settings: { question: 'How can I contact you?', answer: 'Message us on WhatsApp — we usually reply within minutes.' } },
      ],
    },
  ],
  layouts: {
    accordion: { description: 'Centred list of questions', thumb: [[25, 6, 50, 5, 'h'], [15, 18, 70, 8, 'c'], [15, 29, 70, 8, 'c'], [15, 40, 70, 8, 'c'], [15, 51, 70, 8, 'c']] },
    'two-column': { description: 'Heading on the left, questions on the right', thumb: [[6, 10, 30, 6, 'h'], [6, 20, 26, 3, 't'], [42, 10, 52, 8, 'c'], [42, 21, 52, 8, 'c'], [42, 32, 52, 8, 'c'], [42, 43, 52, 8, 'c']] },
  },
};

export default meta;
