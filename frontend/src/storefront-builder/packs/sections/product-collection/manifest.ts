import type { PackManifest, SmartProducts } from '../../../core/types';

export interface ProductCollectionSettings {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: SmartProducts;
  /** Show #1 / #2 / #3 rank badges on the first three cards. */
  showRank: boolean;
  showViewAll: boolean;
  /** Optional per-section card style; empty = the store's card style. */
  cardStyle: string;
}

const manifest: PackManifest<ProductCollectionSettings> = {
  kind: 'section',
  id: 'product-collection',
  name: 'Product collection',
  version: 1,
  tier: 'free',
  defaults: {
    eyebrow: '',
    title: 'Featured products',
    subtitle: '',
    products: { $products: { source: 'featured', limit: 8 } },
    showRank: false,
    showViewAll: true,
    cardStyle: '',
  },
  defaultLayout: 'grid',
  layouts: {
    grid: { name: 'Grid', load: () => import('./layouts/Grid') },
    carousel: { name: 'Carousel', load: () => import('./layouts/Carousel') },
    'large-first': { name: 'Large first', load: () => import('./layouts/LargeFirst') },
    list: { name: 'List', load: () => import('./layouts/List') },
  },
};

export default manifest;
