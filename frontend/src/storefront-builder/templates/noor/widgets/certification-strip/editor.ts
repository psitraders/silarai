import type { PackEditorMeta } from '../../../../core/types';
import { CERTIFICATION_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Trust',
  description: 'Hallmark, certificate and guarantee badges. List only certifications you actually hold.',
  keywords: ['hallmark', 'certified', 'certificate', 'bis', 'guarantee', 'authentic', 'noor'],
  fields: [{ key: 'heading', label: 'Heading', type: 'text', helper: 'Optional.' }],
  blocks: {
    label: 'Badges',
    max: 6,
    types: [{
      type: 'badge', name: 'Badge', defaults: { ...CERTIFICATION_DEFAULTS },
      fields: [
        { key: 'icon', label: 'Icon', type: 'icon' },
        { key: 'title', label: 'Title', type: 'text', placeholder: 'BIS hallmarked' },
        { key: 'detail', label: 'Detail', type: 'text', placeholder: 'On every gold piece' },
      ],
    }],
  },
  presets: [
    {
      id: 'assurance', name: 'Our promise', description: 'Quality and guarantee badges', layout: 'strip', scheme: 'soft',
      blocks: [
        { type: 'badge', settings: { icon: 'gem', title: 'Quality checked', detail: 'Every piece inspected by hand' } },
        { type: 'badge', settings: { icon: 'verified', title: 'Certificate on request', detail: 'Ask us before you order' } },
        { type: 'badge', settings: { icon: 'returns', title: 'Easy exchange', detail: 'Within 7 days' } },
        { type: 'badge', settings: { icon: 'gift', title: 'Gift-ready box', detail: 'Free on every order' } },
      ],
    },
  ],
  layouts: {
    strip: { description: 'Icons and short lines in one band', thumb: [[0, 22, 100, 20, 'm'], [8, 28, 6, 6, 'i'], [16, 29, 14, 4, 't'], [36, 28, 6, 6, 'i'], [44, 29, 14, 4, 't'], [64, 28, 6, 6, 'i'], [72, 29, 14, 4, 't']] },
    cards: { description: 'One card per badge', thumb: [[6, 16, 20, 32, 'c'], [29, 16, 20, 32, 'c'], [52, 16, 20, 32, 'c'], [75, 16, 20, 32, 'c']] },
  },
};

export default meta;
