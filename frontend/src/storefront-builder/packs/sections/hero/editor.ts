import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Hero',
  description: 'Big opening banner with your headline and main button.',
  keywords: ['banner', 'header image', 'welcome', 'cover'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text', group: 'Content' },
    { key: 'heading', label: 'Heading', type: 'text', helper: 'Leave empty to use your store name.', group: 'Content' },
    { key: 'subheading', label: 'Text', type: 'textarea', helper: 'Leave empty to use your store description.', group: 'Content' },
    { key: 'image', label: 'Image', type: 'image', group: 'Images' },
    { key: 'image2', label: 'Second image', type: 'image', helper: 'Used by the Collage layout.', group: 'Images' },
    { key: 'image3', label: 'Third image', type: 'image', helper: 'Used by the Collage layout.', group: 'Images' },
    { key: 'primaryLabel', label: 'Button text', type: 'text', group: 'Buttons' },
    { key: 'primaryLink', label: 'Button link', type: 'link', group: 'Buttons' },
    { key: 'secondaryLabel', label: 'Second button text', type: 'text', group: 'Buttons' },
    { key: 'secondaryLink', label: 'Second button link', type: 'link', group: 'Buttons' },
    { key: 'showWhatsApp', label: 'Show "Chat with us" button', type: 'toggle', group: 'Buttons' },
    { key: 'showHighlights', label: 'Show highlight chips', type: 'toggle', group: 'Style' },
    {
      key: 'height', label: 'Height', type: 'select', group: 'Style',
      options: [{ value: 'compact', label: 'Compact' }, { value: 'regular', label: 'Regular' }, { value: 'tall', label: 'Tall' }],
    },
  ],
  presets: [
    { id: 'welcome', name: 'Store welcome', description: 'Your name, story and a shop button', layout: 'centered', scheme: 'brand' },
    {
      id: 'festive-sale', name: 'Festive sale', description: 'Big offer headline', layout: 'bold-text', scheme: 'contrast',
      settings: { eyebrow: 'Limited time', heading: 'Festive sale — up to 40% off', subheading: 'Handpicked favourites at their best prices of the season.', primaryLabel: 'Shop the sale', showHighlights: false },
    },
    {
      id: 'new-collection', name: 'New collection', description: 'Photo beside the text', layout: 'split-right', scheme: 'soft',
      settings: { eyebrow: 'Just landed', heading: 'The new collection is here', primaryLabel: 'Explore now', showHighlights: false },
    },
  ],
  layouts: {
    centered: { description: 'Gradient background, centred text', thumb: [[0, 0, 100, 64, 'm'], [25, 16, 50, 7, 'h'], [20, 27, 60, 3, 't'], [30, 32, 40, 3, 't'], [38, 42, 24, 7, 'b']] },
    'full-bleed': { description: 'Photo behind the text', thumb: [[0, 0, 100, 64, 'i'], [8, 34, 50, 7, 'h'], [8, 44, 40, 3, 't'], [8, 52, 22, 6, 'b']] },
    'split-right': { description: 'Text left, photo right', thumb: [[6, 18, 40, 7, 'h'], [6, 29, 38, 3, 't'], [6, 34, 30, 3, 't'], [6, 43, 20, 6, 'b'], [54, 6, 42, 52, 'i']] },
    'split-left': { description: 'Photo left, text right', thumb: [[4, 6, 42, 52, 'i'], [54, 18, 40, 7, 'h'], [54, 29, 38, 3, 't'], [54, 34, 30, 3, 't'], [54, 43, 20, 6, 'b']] },
    'bold-text': { description: 'Huge headline, no image', thumb: [[8, 12, 84, 12, 'h'], [8, 27, 70, 12, 'h'], [8, 44, 40, 3, 't'], [8, 51, 22, 6, 'b']] },
    collage: { description: 'Text with three images', thumb: [[6, 20, 36, 7, 'h'], [6, 31, 34, 3, 't'], [6, 40, 20, 6, 'b'], [50, 6, 24, 52, 'i'], [77, 6, 19, 24, 'i'], [77, 34, 19, 24, 'i']] },
  },
};

export default meta;
