import type { PackManifest, SmartCategories, SmartImage } from '../../../../core/types';

export interface ShopByOccasionSettings { eyebrow: string; heading: string }
/** An occasion tile linking to a category; the category photo is used when no photo is uploaded. */
export interface OccasionTileBlock { label: string; image: SmartImage; category: SmartCategories }

export const OCCASION_TILE_DEFAULTS: OccasionTileBlock = { label: 'Wedding', image: { $image: '' }, category: { $categories: { source: 'manual', categoryIds: [], limit: 1 } } };

/** Bloom signature widget: Wedding · Festive · Office · Casual tiles. */
const manifest: PackManifest<ShopByOccasionSettings> = {
  kind: 'section',
  id: 'shop-by-occasion',
  name: 'Shop by occasion',
  version: 1,
  tier: 'free',
  template: 'bloom',
  defaults: { eyebrow: '', heading: 'Shop by occasion' },
  defaultLayout: 'tiles',
  layouts: {
    tiles: { name: 'Photo tiles', load: () => import('./layouts/Tiles') },
    arches: { name: 'Arches', load: () => import('./layouts/Arches') },
  },
};

export default manifest;
