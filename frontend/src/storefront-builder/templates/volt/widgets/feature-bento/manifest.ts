import type { PackManifest, SmartImage } from '../../../../core/types';

export interface FeatureBentoSettings { eyebrow: string; heading: string; subtitle: string }
/** A bento tile: icon or photo, text, and how much room it takes. */
export interface BentoTileBlock { icon: string; title: string; text: string; image: SmartImage; size: 'small' | 'wide' | 'tall' | 'large' }

export const BENTO_TILE_DEFAULTS: BentoTileBlock = { icon: 'zap', title: 'Fast charging', text: 'Describe the feature in a line.', image: { $image: '' }, size: 'small' };

/** Volt signature widget: a bento grid of features (mixed tile sizes, icons or photos). */
const manifest: PackManifest<FeatureBentoSettings> = {
  kind: 'section',
  id: 'feature-bento',
  name: 'Feature bento',
  version: 1,
  tier: 'free',
  template: 'volt',
  defaults: { eyebrow: 'Why it’s different', heading: 'Built to do more', subtitle: '' },
  defaultLayout: 'bento',
  layouts: {
    bento: { name: 'Bento grid', load: () => import('./layouts/Bento') },
  },
};

export default manifest;
