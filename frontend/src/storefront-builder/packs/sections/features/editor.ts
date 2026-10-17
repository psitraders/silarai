import type { PackEditorMeta } from '../../../core/types';
import { FEATURE_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Content',
  description: 'Icons with short titles — why shoppers should choose you.',
  keywords: ['benefits', 'usp', 'why us', 'icons', 'services'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
    { key: 'align', label: 'Heading alignment', type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] },
  ],
  blocks: {
    label: 'Features',
    max: 12,
    types: [{
      type: 'feature',
      name: 'Feature',
      defaults: { ...FEATURE_DEFAULTS },
      fields: [
        { key: 'icon', label: 'Icon', type: 'icon' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'text', label: 'Text', type: 'textarea' },
      ],
    }],
  },
  presets: [
    {
      id: 'why-us', name: 'Why shop with us', description: 'Three icon columns', layout: 'icons',
      blocks: [
        { type: 'feature', settings: { icon: 'hand', title: 'Handmade', text: 'Every piece is made by skilled artisans.' } },
        { type: 'feature', settings: { icon: 'truck', title: 'Fast delivery', text: 'Shipped within 48 hours, tracked to your door.' } },
        { type: 'feature', settings: { icon: 'returns', title: 'Easy returns', text: 'Not right? Return it within 7 days.' } },
      ],
    },
    {
      id: 'services', name: 'Our promise', description: 'Four cards', layout: 'cards', scheme: 'soft',
      blocks: [
        { type: 'feature', settings: { icon: 'verified', title: 'Quality checked', text: 'Inspected before it ships.' } },
        { type: 'feature', settings: { icon: 'cod', title: 'Cash on delivery', text: 'Pay when it arrives.' } },
        { type: 'feature', settings: { icon: 'chat', title: 'WhatsApp support', text: 'Real people, quick replies.' } },
        { type: 'feature', settings: { icon: 'gift', title: 'Gift wrapping', text: 'Ready to give, free.' } },
      ],
    },
  ],
  layouts: {
    icons: { description: 'Centred icons in columns', thumb: [[30, 6, 40, 5, 'h'], [12, 20, 10, 10, 'b'], [45, 20, 10, 10, 'b'], [78, 20, 10, 10, 'b'], [6, 35, 22, 4, 'h'], [39, 35, 22, 4, 'h'], [72, 35, 22, 4, 'h'], [6, 42, 22, 3, 't'], [39, 42, 22, 3, 't'], [72, 42, 22, 3, 't']] },
    cards: { description: 'Each feature in a card', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 20, 42, 'c'], [29, 16, 20, 42, 'c'], [52, 16, 20, 42, 'c'], [75, 16, 20, 42, 'c'], [10, 22, 7, 7, 'b'], [33, 22, 7, 7, 'b'], [56, 22, 7, 7, 'b'], [79, 22, 7, 7, 'b']] },
    list: { description: 'Icon beside each feature, two columns', thumb: [[6, 6, 40, 5, 'h'], [6, 18, 7, 7, 'b'], [16, 19, 28, 3, 'h'], [16, 24, 28, 3, 't'], [52, 18, 7, 7, 'b'], [62, 19, 28, 3, 'h'], [62, 24, 28, 3, 't'], [6, 36, 7, 7, 'b'], [16, 37, 28, 3, 'h'], [16, 42, 28, 3, 't'], [52, 36, 7, 7, 'b'], [62, 37, 28, 3, 'h'], [62, 42, 28, 3, 't']] },
    bento: { description: 'Mixed-size tiles', thumb: [[6, 6, 44, 26, 'm'], [53, 6, 41, 26, 'c'], [6, 35, 28, 23, 'c'], [37, 35, 57, 23, 'm']] },
  },
};

export default meta;
