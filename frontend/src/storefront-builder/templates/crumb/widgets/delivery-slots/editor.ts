import type { PackEditorMeta } from '../../../../core/types';
import { SLOT_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Contact',
  description: 'Your delivery slots and areas, in a simple card. Display only — checkout is unchanged.',
  keywords: ['delivery', 'slots', 'areas', 'timing', 'pincode', 'crumb'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'areas', label: 'Areas you deliver to', type: 'textarea', placeholder: 'e.g. Koramangala, HSR Layout, Indiranagar' },
    { key: 'note', label: 'Note', type: 'text', placeholder: 'e.g. Same-day delivery for orders before 2 pm' },
  ],
  blocks: {
    label: 'Slots',
    max: 8,
    types: [{
      type: 'slot', name: 'Slot', defaults: { ...SLOT_DEFAULTS },
      fields: [
        { key: 'label', label: 'Name', type: 'text' },
        { key: 'time', label: 'Time', type: 'text' },
      ],
    }],
  },
  presets: [{
    id: 'slots', name: 'Delivery slots & areas', description: 'Slots and areas in a card', layout: 'card', scheme: 'soft',
    blocks: [{ type: 'slot', settings: { label: 'Morning', time: 'Add your times' } }, { type: 'slot', settings: { label: 'Evening', time: 'Add your times' } }],
  }],
  layouts: {
    card: { description: 'Slots and areas in one card', thumb: [[14, 8, 72, 48, 'c'], [20, 14, 30, 5, 'h'], [20, 24, 28, 8, 'm'], [52, 24, 28, 8, 'm'], [20, 38, 60, 3, 't'], [20, 44, 50, 3, 't']] },
  },
};

export default meta;
