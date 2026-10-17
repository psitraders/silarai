import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'A thin strip with offers or news — anywhere on the page.',
  keywords: ['announcement', 'bar', 'strip', 'offer', 'marquee', 'ticker'],
  fields: [
    { key: 'messages', label: 'Messages', type: 'list', helper: 'Static shows the first one; Rotating and Moving use all.' },
    { key: 'link', label: 'Link', type: 'link' },
    { key: 'size', label: 'Size', type: 'select', options: [{ value: 'small', label: 'Small' }, { value: 'regular', label: 'Regular' }] },
  ],
  presets: [
    { id: 'offer', name: 'Offer strip', description: 'One line on a brand band', layout: 'static', scheme: 'brand' },
    { id: 'ticker', name: 'News ticker', description: 'Moving messages', layout: 'marquee', scheme: 'contrast' },
  ],
  layouts: {
    static: { description: 'One centred message', thumb: [[0, 26, 100, 12, 'm'], [30, 30, 40, 4, 't']] },
    rotating: { description: 'Messages take turns', thumb: [[0, 26, 100, 12, 'm'], [6, 30, 4, 4, 'b'], [30, 30, 40, 4, 't'], [90, 30, 4, 4, 'b']] },
    marquee: { description: 'Messages scroll across', thumb: [[0, 26, 100, 12, 'm'], [0, 30, 30, 4, 't'], [36, 30, 30, 4, 't'], [72, 30, 28, 4, 't']] },
  },
};

export default meta;
