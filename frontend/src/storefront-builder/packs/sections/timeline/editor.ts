import type { PackEditorMeta } from '../../../core/types';
import { STEP_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Content',
  description: 'Your story, process or milestones as a series of steps.',
  keywords: ['story', 'history', 'process', 'how it works', 'steps', 'journey', 'milestones'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
  ],
  blocks: {
    label: 'Steps',
    max: 12,
    types: [{
      type: 'step', name: 'Step', defaults: { ...STEP_DEFAULTS },
      fields: [
        { key: 'label', label: 'Label (year, date or step)', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'text', label: 'Text', type: 'textarea' },
        { key: 'image', label: 'Image', type: 'image' },
      ],
    }],
  },
  presets: [
    {
      id: 'story', name: 'Our story', description: 'Milestones down the page', layout: 'vertical',
      blocks: [
        { type: 'step', settings: { label: '2019', title: 'It started at home', text: 'A small kitchen, a big idea and our first ten customers.' } },
        { type: 'step', settings: { label: '2021', title: 'Our first workshop', text: 'More hands, more products — the same care.' } },
        { type: 'step', settings: { label: 'Today', title: 'Loved across India', text: 'Thousands of happy customers, and still growing.' } },
      ],
    },
    {
      id: 'how-it-works', name: 'How it works', description: 'Numbered steps in a row', layout: 'horizontal', scheme: 'soft',
      settings: { eyebrow: 'Simple', heading: 'How it works' },
      blocks: [
        { type: 'step', settings: { label: '', title: 'Pick your favourites', text: 'Browse and add products to your cart.' } },
        { type: 'step', settings: { label: '', title: 'Pay your way', text: 'UPI, cards or cash on delivery.' } },
        { type: 'step', settings: { label: '', title: 'Fast delivery', text: 'Packed with care and shipped quickly.' } },
        { type: 'step', settings: { label: '', title: 'Enjoy', text: 'Questions? We are a WhatsApp message away.' } },
      ],
    },
  ],
  layouts: {
    vertical: { description: 'A line down the page, steps alternate sides', thumb: [[49, 4, 2, 56, 'm'], [47, 8, 6, 6, 'b'], [14, 8, 30, 4, 'h'], [14, 15, 26, 3, 't'], [47, 30, 6, 6, 'b'], [56, 30, 30, 4, 'h'], [56, 37, 26, 3, 't'], [47, 50, 6, 6, 'b'], [14, 50, 30, 4, 'h']] },
    horizontal: { description: 'Numbered steps side by side', thumb: [[6, 8, 40, 5, 'h'], [6, 22, 7, 7, 'b'], [15, 25, 14, 1, 'm'], [31, 22, 7, 7, 'b'], [40, 25, 14, 1, 'm'], [56, 22, 7, 7, 'b'], [65, 25, 14, 1, 'm'], [81, 22, 7, 7, 'b'], [6, 34, 20, 4, 'h'], [31, 34, 20, 4, 'h'], [56, 34, 20, 4, 'h'], [81, 34, 14, 4, 'h'], [6, 41, 20, 3, 't'], [31, 41, 20, 3, 't'], [56, 41, 20, 3, 't'], [81, 41, 14, 3, 't']] },
  },
};

export default meta;
