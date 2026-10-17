import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Media',
  description: 'A YouTube or Vimeo video that loads only when tapped.',
  keywords: ['youtube', 'vimeo', 'reel', 'film', 'how it is made'],
  fields: [
    { key: 'url', label: 'Video link', type: 'text', placeholder: 'https://www.youtube.com/watch?v=…', helper: 'YouTube or Vimeo. The video loads only when a shopper taps play.' },
    { key: 'poster', label: 'Cover image', type: 'image', helper: 'Optional. YouTube videos use their own thumbnail otherwise.' },
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'buttonLabel', label: 'Button text', type: 'text' },
    { key: 'buttonLink', label: 'Button link', type: 'link' },
  ],
  presets: [
    { id: 'how-made', name: 'How it is made', description: 'Video beside a short story', layout: 'with-text', settings: { eyebrow: 'Behind the scenes', heading: 'How we make it', text: 'A look inside our workshop.' } },
    { id: 'feature', name: 'Brand film', description: 'Full-width video', layout: 'full-width', scheme: 'contrast' },
  ],
  layouts: {
    inline: { description: 'Video in the page width', thumb: [[30, 4, 40, 5, 'h'], [12, 13, 76, 46, 'i'], [45, 30, 10, 10, 'b']] },
    'full-width': { description: 'Edge-to-edge video', thumb: [[0, 4, 100, 56, 'i'], [45, 27, 10, 10, 'b']] },
    'with-text': { description: 'Video beside a heading and text', thumb: [[6, 10, 52, 40, 'i'], [28, 25, 8, 8, 'b'], [64, 18, 30, 6, 'h'], [64, 28, 30, 3, 't'], [64, 34, 24, 3, 't'], [64, 42, 16, 6, 'b']] },
  },
};

export default meta;
