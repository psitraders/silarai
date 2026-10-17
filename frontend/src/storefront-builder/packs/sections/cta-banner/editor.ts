import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'A bold band that sends shoppers somewhere — a sale, a category, a page.',
  keywords: ['banner', 'offer', 'promo', 'sale', 'button'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'image', label: 'Image', type: 'image', helper: 'Used by the Image and Split layouts.' },
    { key: 'buttonLabel', label: 'Button text', type: 'text' },
    { key: 'buttonLink', label: 'Button link', type: 'link' },
    { key: 'secondaryLabel', label: 'Second button text', type: 'text' },
    { key: 'secondaryLink', label: 'Second button link', type: 'link' },
  ],
  presets: [
    { id: 'free-delivery', name: 'Free delivery', description: 'Solid brand band', layout: 'solid', scheme: 'brand' },
    { id: 'festive', name: 'Festive offer', description: 'Gradient band', layout: 'gradient', scheme: 'contrast', settings: { eyebrow: 'Festive offer', heading: 'Flat 20% off this week', text: 'Use code FESTIVE20 at checkout.', buttonLabel: 'Shop the offer' } },
    { id: 'new-in', name: 'Category spotlight', description: 'Photo with text', layout: 'split', scheme: 'soft', settings: { eyebrow: 'New in', heading: 'Discover our latest collection', text: '', buttonLabel: 'Explore' } },
  ],
  layouts: {
    solid: { description: 'Centred text on a colour band', thumb: [[0, 8, 100, 48, 'm'], [25, 18, 50, 6, 'h'], [30, 28, 40, 3, 't'], [40, 37, 20, 7, 'b']] },
    gradient: { description: 'Rounded gradient card with buttons on the right', thumb: [[4, 10, 92, 44, 'm'], [10, 20, 44, 6, 'h'], [10, 30, 36, 3, 't'], [66, 27, 22, 8, 'b']] },
    image: { description: 'Text over a photo', thumb: [[0, 4, 100, 56, 'i'], [25, 18, 50, 6, 'h'], [30, 28, 40, 3, 't'], [40, 37, 20, 7, 'b']] },
    split: { description: 'Photo beside the text, in a card', thumb: [[4, 8, 92, 48, 'c'], [4, 8, 44, 48, 'i'], [54, 20, 36, 6, 'h'], [54, 30, 30, 3, 't'], [54, 39, 18, 6, 'b']] },
  },
};

export default meta;
