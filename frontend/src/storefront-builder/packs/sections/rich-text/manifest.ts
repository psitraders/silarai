import type { PackManifest, SmartRichText } from '../../../core/types';

export interface RichTextSettings {
  eyebrow: string;
  heading: string;
  content: SmartRichText;
  align: 'left' | 'center';
}

const manifest: PackManifest<RichTextSettings> = {
  kind: 'section',
  id: 'rich-text',
  name: 'Rich text',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: '', heading: '', content: { $richtext: '' }, align: 'left' },
  defaultLayout: 'narrow',
  layouts: {
    narrow: { name: 'Narrow', load: () => import('./layouts/Narrow') },
    wide: { name: 'Wide', load: () => import('./layouts/Wide') },
    'two-column': { name: 'Two columns', load: () => import('./layouts/TwoColumn') },
  },
};

export default manifest;
