import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Utility',
  description: 'Your own HTML. Scripts, styles and embeds are removed for safety.',
  keywords: ['html', 'code', 'custom'],
  fields: [
    { key: 'html', label: 'HTML', type: 'html', helper: 'Cleaned on save: scripts, inline styles, iframes and event handlers are removed.' },
    { key: 'width', label: 'Width', type: 'select', options: [{ value: 'narrow', label: 'Reading width' }, { value: 'wide', label: 'Full width' }] },
  ],
  layouts: {
    default: { description: 'Your HTML inside the page width', thumb: [[10, 16, 30, 4, 'm'], [10, 24, 80, 3, 't'], [10, 30, 70, 3, 't'], [10, 36, 75, 3, 't']] },
  },
};

export default meta;
