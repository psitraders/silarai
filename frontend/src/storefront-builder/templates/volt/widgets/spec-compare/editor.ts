import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'Compare 2–4 products side by side. Specs come from “Label: value” lines in each description (e.g. “Battery: 5000 mAh”).',
  keywords: ['compare', 'specs', 'comparison', 'table', 'versus', 'electronics', 'volt'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text' },
    { key: 'products', label: 'Products to compare', type: 'products', max: 4, helper: 'Pick 2 to 4 products.' },
  ],
  presets: [{ id: 'compare', name: 'Spec compare', description: 'Products side by side', layout: 'table' }],
  layouts: {
    table: { description: 'Photos on top, spec rows below', thumb: [[6, 4, 40, 5, 'h'], [26, 12, 20, 16, 'i'], [50, 12, 20, 16, 'i'], [74, 12, 20, 16, 'i'], [6, 32, 88, 4, 'm'], [6, 40, 88, 4, 'm'], [6, 48, 88, 4, 'm']] },
  },
};

export default meta;
