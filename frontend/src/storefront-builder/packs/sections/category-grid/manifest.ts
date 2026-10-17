import type { PackManifest, SmartCategories } from '../../../core/types';

export interface CategoryGridSettings {
  eyebrow: string;
  title: string;
  categories: SmartCategories;
  /** Show an "All" tile linking to all products. */
  showAll: boolean;
}

const manifest: PackManifest<CategoryGridSettings> = {
  kind: 'section',
  id: 'category-grid',
  name: 'Category grid',
  version: 1,
  tier: 'free',
  defaults: {
    eyebrow: '',
    title: 'Shop by category',
    categories: { $categories: { source: 'all', limit: 24 } },
    showAll: true,
  },
  defaultLayout: 'icon-rail',
  layouts: {
    'icon-rail': { name: 'Icon rail', load: () => import('./layouts/IconRail') },
    tiles: { name: 'Tiles', load: () => import('./layouts/Tiles') },
    circles: { name: 'Circles', load: () => import('./layouts/Circles') },
    'banner-cards': { name: 'Banner cards', load: () => import('./layouts/BannerCards') },
  },
};

export default manifest;
