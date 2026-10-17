import type { PackEditorMeta } from '../../../../core/types';
import { CRAFT_STEP_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Content',
  description: 'How your pieces are made, step by step — builds trust for handmade and premium products.',
  keywords: ['craft', 'process', 'handmade', 'making', 'story', 'artisan', 'noor'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
  ],
  blocks: {
    label: 'Steps',
    max: 6,
    types: [{
      type: 'step', name: 'Step', defaults: { ...CRAFT_STEP_DEFAULTS },
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'text', label: 'Text', type: 'textarea' },
        { key: 'image', label: 'Photo', type: 'image', helper: 'Optional.' },
      ],
    }],
  },
  presets: [
    {
      id: 'making', name: 'The making', description: 'Four numbered steps', layout: 'steps', scheme: 'soft',
      blocks: [
        { type: 'step', settings: { title: 'Design', text: 'Every piece starts as a hand sketch.' } },
        { type: 'step', settings: { title: 'Casting', text: 'Metal is cast and shaped by our karigars.' } },
        { type: 'step', settings: { title: 'Setting', text: 'Stones are set one by one, by hand.' } },
        { type: 'step', settings: { title: 'Finishing', text: 'Polished, checked and packed in our gift box.' } },
      ],
    },
  ],
  layouts: {
    steps: { description: 'Numbered steps in a row (a list on phones)', thumb: [[6, 6, 40, 5, 'h'], [6, 20, 20, 20, 'i'], [29, 20, 20, 20, 'i'], [52, 20, 20, 20, 'i'], [75, 20, 20, 20, 'i'], [6, 44, 16, 3, 't'], [29, 44, 16, 3, 't'], [52, 44, 16, 3, 't'], [75, 44, 16, 3, 't']] },
    alternating: { description: 'Photo and text rows, alternating sides', thumb: [[6, 4, 40, 24, 'i'], [52, 10, 30, 4, 'h'], [52, 17, 36, 3, 't'], [54, 34, 40, 24, 'i'], [8, 40, 30, 4, 'h'], [8, 47, 36, 3, 't']] },
  },
};

export default meta;
