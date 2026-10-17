import type { PackEditorMeta } from '../../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Media',
  description: 'Compare two photos with a slider — for real results only.',
  keywords: ['before', 'after', 'compare', 'results', 'beauty', 'transformation', 'bloom'],
  fields: [
    { key: 'before', label: 'Before photo', type: 'image' },
    { key: 'after', label: 'After photo', type: 'image', helper: 'Use the same framing as the before photo.' },
    { key: 'beforeLabel', label: 'Before label', type: 'text' },
    { key: 'afterLabel', label: 'After label', type: 'text' },
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'buttonLabel', label: 'Button label', type: 'text' },
    { key: 'buttonLink', label: 'Button link', type: 'link' },
  ],
  presets: [
    { id: 'slider', name: 'Before / after slider', description: 'Drag to compare two photos', layout: 'slider', scheme: 'soft' },
    { id: 'pair', name: 'Before / after pair', description: 'Two photos side by side', layout: 'side-by-side' },
  ],
  layouts: {
    slider: { description: 'One photo with a draggable divider', thumb: [[6, 6, 50, 52, 'i'], [30, 6, 2, 52, 'b'], [62, 18, 30, 5, 'h'], [62, 27, 28, 3, 't']] },
    'side-by-side': { description: 'Two photos with labels', thumb: [[6, 6, 40, 5, 'h'], [6, 16, 43, 40, 'i'], [51, 16, 43, 40, 'i']] },
  },
};

export default meta;
