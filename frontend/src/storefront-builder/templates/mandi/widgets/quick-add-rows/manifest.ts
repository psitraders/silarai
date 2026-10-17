import type { PackManifest, SmartCategories } from '../../../../core/types';

export interface QuickAddRowsSettings {
  eyebrow: string;
  heading: string;
  /** One row per category. */
  categories: SmartCategories;
  perCategory: number;
  showViewAll: boolean;
}

/** Mandi signature widget: products by category with +/− quick add (no need to open them). */
const manifest: PackManifest<QuickAddRowsSettings> = {
  kind: 'section',
  id: 'quick-add-rows',
  name: 'Quick-add rows',
  version: 1,
  tier: 'free',
  template: 'mandi',
  defaults: {
    eyebrow: '',
    heading: 'Shop your daily needs',
    categories: { $categories: { source: 'all', limit: 4 } },
    perCategory: 6,
    showViewAll: true,
  },
  defaultLayout: 'rows',
  layouts: {
    rows: { name: 'Rows with +/−', load: () => import('./layouts/Rows') },
    carousel: { name: 'Swipeable rows', load: () => import('./layouts/Carousel') },
  },
};

export default manifest;
