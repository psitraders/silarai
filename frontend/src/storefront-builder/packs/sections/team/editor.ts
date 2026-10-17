import type { PackEditorMeta } from '../../../core/types';
import { MEMBER_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Content',
  description: 'Put faces to your brand: the founder story or the whole team.',
  keywords: ['team', 'founder', 'about', 'people', 'staff', 'our story'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subtitle', label: 'Subheading', type: 'text', showIf: { key: '$layout', equals: ['cards'] } },
  ],
  blocks: {
    label: 'People',
    max: 12,
    types: [{
      type: 'member', name: 'Person', defaults: { ...MEMBER_DEFAULTS },
      fields: [
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'role', label: 'Role', type: 'text' },
        { key: 'bio', label: 'Bio / story', type: 'textarea' },
      ],
    }],
  },
  presets: [
    {
      id: 'founder', name: 'Founder story', description: 'Photo + a few words from the founder', layout: 'split',
      settings: { eyebrow: 'Meet the founder', heading: 'Made with love, by hand' },
      blocks: [{ type: 'member', settings: { name: 'Your name', role: 'Founder', bio: 'I started this store to share the things I love. Every order is packed by our small team with care — thank you for supporting a small business.' } }],
    },
    {
      id: 'team', name: 'Our team', description: 'Grid of team members', layout: 'cards',
      blocks: [
        { type: 'member', settings: { name: 'Team member', role: 'Founder' } },
        { type: 'member', settings: { name: 'Team member', role: 'Operations' } },
        { type: 'member', settings: { name: 'Team member', role: 'Customer care' } },
      ],
    },
  ],
  layouts: {
    cards: { description: 'Photo cards in a grid', thumb: [[30, 4, 40, 5, 'h'], [8, 14, 24, 24, 'i'], [38, 14, 24, 24, 'i'], [68, 14, 24, 24, 'i'], [12, 42, 16, 3, 't'], [42, 42, 16, 3, 't'], [72, 42, 16, 3, 't']] },
    split: { description: 'Founder photo beside their story', thumb: [[6, 4, 38, 56, 'i'], [52, 10, 30, 3, 'b'], [52, 17, 38, 6, 'h'], [52, 28, 40, 3, 't'], [52, 34, 36, 3, 't'], [52, 40, 30, 3, 't'], [52, 50, 16, 4, 'h']] },
  },
};

export default meta;
