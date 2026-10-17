import type { PackManifest, SmartRichText } from '../../../core/types';

export interface CustomHtmlSettings { html: SmartRichText; width: 'narrow' | 'wide' }

const manifest: PackManifest<CustomHtmlSettings> = {
  kind: 'section',
  id: 'custom-html',
  name: 'Custom HTML',
  version: 1,
  tier: 'free',
  defaults: { html: { $richtext: '' }, width: 'wide' },
  defaultLayout: 'default',
  layouts: {
    default: { name: 'Default', load: () => import('./layouts/Default') },
  },
};

export default manifest;
