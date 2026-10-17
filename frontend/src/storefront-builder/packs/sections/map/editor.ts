import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Contact',
  description: 'A Google map of your shop that loads when tapped.',
  keywords: ['map', 'location', 'directions', 'google maps'],
  fields: [
    { key: 'address', label: 'Address or place name', type: 'textarea', helper: 'Exactly as you would search it on Google Maps.' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'note', label: 'Note', type: 'text', placeholder: 'e.g. Parking available behind the store' },
    { key: 'height', label: 'Height', type: 'select', options: [{ value: 'short', label: 'Short' }, { value: 'regular', label: 'Regular' }, { value: 'tall', label: 'Tall' }] },
  ],
  layouts: {
    contained: { description: 'Map in the page width', thumb: [[6, 6, 30, 5, 'h'], [6, 16, 88, 42, 'i'], [46, 30, 8, 8, 'b']] },
    'full-width': { description: 'Edge-to-edge map', thumb: [[0, 4, 100, 56, 'i'], [46, 26, 8, 8, 'b']] },
  },
};

export default meta;
