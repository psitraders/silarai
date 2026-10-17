import type { PackEditorMeta } from '../../../core/types';
import { SLIDE_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Hero',
  description: 'Several banners that slide — offers, collections, news.',
  keywords: ['carousel', 'slider', 'banners', 'hero'],
  fields: [
    { key: 'autoplay', label: 'Move to the next slide automatically', type: 'toggle', helper: 'Pauses on hover and never runs for shoppers who prefer reduced motion.' },
    { key: 'interval', label: 'Seconds per slide', type: 'number', min: 3, max: 15, showIf: { key: 'autoplay', equals: [true] } },
    { key: 'height', label: 'Height', type: 'select', options: [{ value: 'compact', label: 'Compact' }, { value: 'regular', label: 'Regular' }, { value: 'tall', label: 'Tall' }] },
  ],
  blocks: {
    label: 'Slides',
    max: 8,
    min: 1,
    types: [{
      type: 'slide', name: 'Slide', defaults: { ...SLIDE_DEFAULTS },
      fields: [
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'eyebrow', label: 'Small heading', type: 'text' },
        { key: 'heading', label: 'Heading', type: 'text' },
        { key: 'text', label: 'Text', type: 'textarea' },
        { key: 'buttonLabel', label: 'Button text', type: 'text' },
        { key: 'buttonLink', label: 'Button link', type: 'link' },
        { key: 'align', label: 'Text position', type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] },
      ],
    }],
  },
  presets: [
    {
      id: 'offers', name: 'Offers slideshow', description: 'Three banners', layout: 'full', scheme: 'contrast',
      blocks: [
        { type: 'slide', settings: { eyebrow: 'New season', heading: 'Fresh arrivals every week' } },
        { type: 'slide', settings: { eyebrow: 'Limited time', heading: 'Up to 30% off bestsellers', buttonLabel: 'Shop the sale' } },
        { type: 'slide', settings: { eyebrow: 'Gifting', heading: 'Gifts they will remember', buttonLabel: 'Find a gift' } },
      ],
    },
  ],
  layouts: {
    full: { description: 'Edge-to-edge slides', thumb: [[0, 0, 100, 64, 'i'], [8, 26, 44, 7, 'h'], [8, 37, 20, 6, 'b'], [44, 56, 4, 3, 'b'], [50, 56, 4, 3, 'm'], [56, 56, 4, 3, 'm']] },
    contained: { description: 'Rounded slides inside the page width', thumb: [[6, 6, 88, 50, 'i'], [14, 24, 40, 7, 'h'], [14, 35, 18, 6, 'b'], [44, 58, 4, 3, 'b'], [50, 58, 4, 3, 'm'], [56, 58, 4, 3, 'm']] },
  },
};

export default meta;
