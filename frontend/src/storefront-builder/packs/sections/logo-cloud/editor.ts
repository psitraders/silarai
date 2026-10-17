import type { PackEditorMeta } from '../../../core/types';
import { LOGO_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Trust',
  description: 'Brands you stock, partners, or "as seen in" press logos.',
  keywords: ['brands', 'press', 'as seen in', 'partners'],
  fields: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'grayscale', label: 'Show logos in grey', type: 'toggle' },
  ],
  blocks: {
    label: 'Logos', max: 16,
    types: [{
      type: 'logo', name: 'Logo', defaults: { ...LOGO_DEFAULTS },
      fields: [{ key: 'image', label: 'Logo', type: 'image' }, { key: 'name', label: 'Name', type: 'text', helper: 'Shown when there is no logo, and read by screen readers.' }, { key: 'link', label: 'Link', type: 'link' }],
    }],
  },
  presets: [
    { id: 'press', name: 'As seen in', description: 'Row of press logos', layout: 'row', blocks: [{ type: 'logo', settings: { name: 'Vogue' } }, { type: 'logo', settings: { name: 'Elle' } }, { type: 'logo', settings: { name: 'Femina' } }, { type: 'logo', settings: { name: 'The Hindu' } }] },
  ],
  layouts: {
    row: { description: 'Logos in a centred row', thumb: [[35, 12, 30, 4, 'h'], [6, 28, 16, 10, 'm'], [25, 28, 16, 10, 'm'], [44, 28, 16, 10, 'm'], [63, 28, 16, 10, 'm'], [82, 28, 14, 10, 'm']] },
    marquee: { description: 'Logos scroll slowly (stops for reduced motion)', thumb: [[0, 26, 100, 14, 'm'], [4, 28, 14, 10, 'c'], [22, 28, 14, 10, 'c'], [40, 28, 14, 10, 'c'], [58, 28, 14, 10, 'c'], [76, 28, 14, 10, 'c']] },
  },
};

export default meta;
