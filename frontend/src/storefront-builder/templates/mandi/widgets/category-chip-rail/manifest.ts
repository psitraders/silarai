import type { PackManifest, SmartCategories } from '../../../../core/types';

export interface CategoryChipRailSettings { heading: string; categories: SmartCategories; showAll: boolean }

/** Mandi signature widget: a swipeable row of category chips linking to each category. */
const manifest: PackManifest<CategoryChipRailSettings> = {
  kind: 'section',
  id: 'category-chip-rail',
  name: 'Category chip rail',
  version: 1,
  tier: 'free',
  template: 'mandi',
  defaults: { heading: '', categories: { $categories: { source: 'all', limit: 24 } }, showAll: true },
  defaultLayout: 'chips',
  layouts: {
    chips: { name: 'Text chips', load: () => import('./layouts/Chips') },
    'photo-chips': { name: 'Photo chips', load: () => import('./layouts/PhotoChips') },
  },
};

export default manifest;
