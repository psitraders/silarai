import type { PackManifest } from '../../../core/types';

export interface FeaturesSettings {
  eyebrow: string;
  heading: string;
  subtitle: string;
  align: 'left' | 'center';
}

export interface FeatureBlock { icon: string; title: string; text: string }

export const FEATURE_DEFAULTS: FeatureBlock = { icon: 'sparkles', title: 'Feature', text: 'Describe why this matters to your customers.' };

const manifest: PackManifest<FeaturesSettings> = {
  kind: 'section',
  id: 'features',
  name: 'Features',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: '', heading: 'Why shop with us', subtitle: '', align: 'center' },
  defaultLayout: 'icons',
  layouts: {
    icons: { name: 'Icon columns', load: () => import('./layouts/Icons') },
    cards: { name: 'Cards', load: () => import('./layouts/Cards') },
    list: { name: 'List', load: () => import('./layouts/List') },
    bento: { name: 'Bento', load: () => import('./layouts/Bento') },
  },
};

export default manifest;
