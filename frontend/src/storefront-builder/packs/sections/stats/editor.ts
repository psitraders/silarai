import type { PackEditorMeta } from '../../../core/types';
import { STAT_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Trust',
  description: 'Big numbers that build trust — orders, customers, years.',
  keywords: ['stats', 'counters', 'numbers', 'achievements'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
  ],
  blocks: {
    label: 'Numbers', max: 6,
    types: [{ type: 'stat', name: 'Number', defaults: { ...STAT_DEFAULTS }, fields: [{ key: 'value', label: 'Number', type: 'text', placeholder: '10k+' }, { key: 'label', label: 'Label', type: 'text' }] }],
  },
  presets: [
    {
      id: 'milestones', name: 'Milestones', description: 'Four numbers on a dark band', layout: 'counters', scheme: 'contrast',
      blocks: [
        { type: 'stat', settings: { value: '10,000+', label: 'Orders delivered' } },
        { type: 'stat', settings: { value: '4.9★', label: 'Average rating' } },
        { type: 'stat', settings: { value: '120+', label: 'Pin codes served' } },
        { type: 'stat', settings: { value: '8 yrs', label: 'Of craft' } },
      ],
    },
  ],
  layouts: {
    counters: { description: 'Big numbers in a row', thumb: [[6, 20, 18, 10, 'h'], [30, 20, 18, 10, 'h'], [54, 20, 18, 10, 'h'], [78, 20, 18, 10, 'h'], [6, 34, 18, 3, 't'], [30, 34, 18, 3, 't'], [54, 34, 18, 3, 't'], [78, 34, 18, 3, 't']] },
    cards: { description: 'Each number in a card', thumb: [[6, 14, 20, 36, 'c'], [29, 14, 20, 36, 'c'], [52, 14, 20, 36, 'c'], [75, 14, 20, 36, 'c'], [9, 24, 14, 8, 'h'], [32, 24, 14, 8, 'h'], [55, 24, 14, 8, 'h'], [78, 24, 14, 8, 'h']] },
  },
};

export default meta;
