import type { PackEditorMeta } from '../../../../core/types';
import { BUDGET_DEFAULTS, OCCASION_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'Shoppers pick an occasion and a budget and see matching products, live from your catalogue.',
  keywords: ['gift', 'finder', 'occasion', 'budget', 'price', 'quiz', 'noor'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
    { key: 'limit', label: 'Products to show', type: 'number', min: 4, max: 24 },
  ],
  blocks: {
    label: 'Occasions and budgets',
    max: 12,
    types: [
      {
        type: 'occasion', name: 'Occasion', defaults: { ...OCCASION_DEFAULTS },
        fields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'category', label: 'Category', type: 'categories', helper: 'The first category is used. Pick “All” to show everything.' },
        ],
      },
      {
        type: 'budget', name: 'Budget', defaults: { ...BUDGET_DEFAULTS },
        fields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'min', label: 'From (₹)', type: 'number', min: 0, helper: '0 = no lower limit.' },
          { key: 'max', label: 'Up to (₹)', type: 'number', min: 0, helper: '0 = no upper limit.' },
        ],
      },
    ],
  },
  presets: [
    {
      id: 'gifts', name: 'Gift finder', description: 'Occasion and budget chips with products', layout: 'chips', scheme: 'soft',
      blocks: [
        { type: 'occasion', settings: { label: 'Wedding' } },
        { type: 'occasion', settings: { label: 'Festive' } },
        { type: 'occasion', settings: { label: 'Everyday' } },
        { type: 'budget', settings: { label: 'Under ₹1,000', min: 0, max: 1000 } },
        { type: 'budget', settings: { label: '₹1,000 – ₹3,000', min: 1000, max: 3000 } },
        { type: 'budget', settings: { label: 'Above ₹3,000', min: 3000, max: 0 } },
      ],
    },
  ],
  layouts: {
    chips: { description: 'Two rows of chips, products below', thumb: [[6, 4, 40, 5, 'h'], [6, 13, 14, 5, 'b'], [22, 13, 14, 5, 'm'], [38, 13, 14, 5, 'm'], [6, 21, 16, 5, 'm'], [24, 21, 16, 5, 'b'], [6, 30, 20, 28, 'c'], [29, 30, 20, 28, 'c'], [52, 30, 20, 28, 'c'], [75, 30, 20, 28, 'c']] },
  },
};

export default meta;
