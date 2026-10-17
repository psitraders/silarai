import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'Email signup. Subscribers appear under Leads, tagged “newsletter”.',
  keywords: ['newsletter', 'email', 'subscribe', 'signup', 'list', 'updates'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'buttonLabel', label: 'Button label', type: 'text' },
    { key: 'askName', label: 'Ask for a name too', type: 'toggle' },
    { key: 'note', label: 'Small print', type: 'text' },
    { key: 'successText', label: 'Thank-you message', type: 'text' },
  ],
  presets: [
    { id: 'band', name: 'Newsletter band', description: 'Heading and an email field in one band', layout: 'band', scheme: 'brand' },
    { id: 'card', name: 'Newsletter card', description: 'Centred card with name and email', layout: 'card', scheme: 'soft', settings: { askName: true } },
  ],
  layouts: {
    band: { description: 'Text on the left, email field on the right', thumb: [[0, 16, 100, 32, 'm'], [8, 24, 36, 5, 'h'], [8, 32, 30, 3, 't'], [54, 26, 26, 8, 'c'], [82, 26, 12, 8, 'b']] },
    card: { description: 'Centred card with the form', thumb: [[22, 8, 56, 48, 'c'], [32, 14, 36, 5, 'h'], [30, 22, 40, 3, 't'], [30, 30, 40, 7, 'c'], [30, 40, 40, 7, 'b']] },
  },
};

export default meta;
