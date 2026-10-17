import type { PackManifest } from '../../../core/types';

export interface RelatedProductsSettings {
  eyebrow: string;
  title: string;
  limit: number;
  cardStyle: string;
}

/** "You may also like" — more products from the current product's category (product page). */
const manifest: PackManifest<RelatedProductsSettings> = {
  kind: 'section',
  id: 'related-products',
  name: 'Related products',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: '', title: 'You may also like', limit: 8, cardStyle: '' },
  defaultLayout: 'carousel',
  layouts: {
    carousel: { name: 'Carousel', load: () => import('./layouts/Carousel') },
    grid: { name: 'Grid', load: () => import('./layouts/Grid') },
  },
};

export default manifest;
