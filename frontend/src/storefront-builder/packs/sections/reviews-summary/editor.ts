import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Trust',
  description: 'Your average rating and latest reviews from every product — live from approved reviews.',
  keywords: ['reviews', 'rating', 'stars', 'social proof', 'testimonials', 'customers'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
    { key: 'limit', label: 'Reviews to show', type: 'number', min: 0, max: 12, showIf: { key: '$layout', equals: ['summary', 'carousel'] } },
    {
      key: 'minRating', label: 'Show reviews with at least', type: 'select',
      options: [5, 4, 3, 2, 1].map(n => ({ value: String(n), label: n === 1 ? 'Any rating' : `${n} stars` })),
      helper: 'The average and total always include every approved review.',
      showIf: { key: '$layout', equals: ['summary', 'carousel'] },
    },
    { key: 'showDistribution', label: 'Show star breakdown', type: 'toggle', showIf: { key: '$layout', equals: ['summary'] } },
    { key: 'showProduct', label: 'Show the product reviewed', type: 'toggle', showIf: { key: '$layout', equals: ['summary', 'carousel'] } },
  ],
  presets: [
    { id: 'summary', name: 'Rating + latest reviews', description: 'Average, star breakdown and review cards', layout: 'summary', scheme: 'soft' },
    { id: 'carousel', name: 'Review carousel', description: 'Swipeable row of recent reviews', layout: 'carousel', settings: { eyebrow: 'Happy customers', heading: 'What shoppers say' } },
    { id: 'badge', name: 'Rating badge', description: 'One line: average rating and review count', layout: 'badge', settings: { eyebrow: '', heading: '' } },
  ],
  layouts: {
    summary: { description: 'Average and star breakdown beside review cards', thumb: [[6, 8, 26, 10, 'h'], [6, 22, 26, 3, 'm'], [6, 28, 22, 3, 'm'], [6, 34, 18, 3, 'm'], [38, 8, 27, 24, 'c'], [68, 8, 27, 24, 'c'], [38, 36, 27, 24, 'c'], [68, 36, 27, 24, 'c']] },
    carousel: { description: 'Review cards in a swipeable row', thumb: [[6, 6, 40, 5, 'h'], [6, 18, 28, 38, 'c'], [37, 18, 28, 38, 'c'], [68, 18, 28, 38, 'c']] },
    badge: { description: 'Slim band: ★ 4.8 from 120 reviews', thumb: [[0, 24, 100, 16, 'm'], [30, 29, 10, 6, 'h'], [43, 30, 28, 4, 't']] },
  },
};

export default meta;
