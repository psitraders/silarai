import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Content',
  description: 'Headings, paragraphs, lists and links — for About, policies and stories.',
  keywords: ['text', 'about', 'story', 'policy', 'paragraph'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'content', label: 'Text', type: 'richtext' },
    { key: 'align', label: 'Alignment', type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] },
  ],
  presets: [
    { id: 'story', name: 'Our story', description: 'A short About text', layout: 'narrow', settings: { eyebrow: 'About us', heading: 'Our story', content: { $richtext: '<p>Tell shoppers who you are, what you make and why you started. Keep it short and personal.</p>' } } },
    { id: 'policy', name: 'Policy text', description: 'Shipping, returns or terms', layout: 'wide', settings: { heading: 'Shipping & returns', content: { $richtext: '<h3>Shipping</h3><p>Orders ship within 2–3 working days.</p><h3>Returns</h3><p>Return unused items within 7 days of delivery.</p>' } } },
  ],
  layouts: {
    narrow: { description: 'Comfortable reading width', thumb: [[25, 10, 40, 6, 'h'], [25, 22, 50, 3, 't'], [25, 28, 50, 3, 't'], [25, 34, 46, 3, 't'], [25, 40, 50, 3, 't'], [25, 46, 30, 3, 't']] },
    wide: { description: 'Full content width', thumb: [[6, 10, 40, 6, 'h'], [6, 22, 88, 3, 't'], [6, 28, 88, 3, 't'], [6, 34, 80, 3, 't'], [6, 40, 88, 3, 't'], [6, 46, 50, 3, 't']] },
    'two-column': { description: 'Heading on the left, text on the right', thumb: [[6, 12, 34, 6, 'h'], [6, 22, 26, 3, 'm'], [48, 12, 46, 3, 't'], [48, 18, 46, 3, 't'], [48, 24, 40, 3, 't'], [48, 30, 46, 3, 't'], [48, 36, 30, 3, 't']] },
  },
};

export default meta;
