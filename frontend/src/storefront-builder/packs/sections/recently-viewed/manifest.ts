import type { PackManifest } from '../../../core/types';

export interface RecentlyViewedSettings {
  eyebrow: string;
  title: string;
  limit: number;
  cardStyle: string;
}

/** Products this shopper opened recently (kept in their browser only). Hidden until there are some. */
const manifest: PackManifest<RecentlyViewedSettings> = {
  kind: 'section',
  id: 'recently-viewed',
  name: 'Recently viewed',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: '', title: 'Recently viewed', limit: 8, cardStyle: '' },
  defaultLayout: 'carousel',
  layouts: {
    carousel: { name: 'Carousel', load: () => import('./layouts/Carousel') },
    grid: { name: 'Grid', load: () => import('./layouts/Grid') },
  },
};

export default manifest;
