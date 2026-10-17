import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Utility',
  description: 'Empty space, a line or a decorative wave between sections.',
  keywords: ['spacer', 'space', 'line', 'separator', 'wave'],
  fields: [
    { key: 'size', label: 'Height', type: 'select', options: [{ value: 'xs', label: 'Extra small' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra large' }] },
  ],
  layouts: {
    space: { description: 'Just empty space', thumb: [[0, 20, 100, 24, 'm']] },
    line: { description: 'A thin line', thumb: [[10, 31, 80, 2, 'h']] },
    dots: { description: 'Three centred dots', thumb: [[40, 29, 5, 5, 'h'], [48, 29, 5, 5, 'h'], [56, 29, 5, 5, 'h']] },
    wave: { description: 'A soft wave', thumb: [[0, 24, 100, 16, 'm']] },
  },
};

export default meta;
