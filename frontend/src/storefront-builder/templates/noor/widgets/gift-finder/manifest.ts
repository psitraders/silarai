import type { PackManifest, SmartCategories } from '../../../../core/types';

export interface GiftFinderSettings { eyebrow: string; heading: string; subtitle: string; limit: number }
/** An occasion chip: a label and the category it shows (empty = all products). */
export interface OccasionBlock { label: string; category: SmartCategories }
/** A budget chip: effective price range (0 = no limit). */
export interface BudgetBlock { label: string; min: number; max: number }

export const OCCASION_DEFAULTS: OccasionBlock = { label: 'Wedding', category: { $categories: { source: 'manual', categoryIds: [], limit: 1 } } };
export const BUDGET_DEFAULTS: BudgetBlock = { label: 'Under ₹1,000', min: 0, max: 1000 };

/** Noor signature widget: pick an occasion and a budget, see matching pieces (live catalogue). */
const manifest: PackManifest<GiftFinderSettings> = {
  kind: 'section',
  id: 'gift-finder',
  name: 'Gift finder',
  version: 1,
  tier: 'free',
  template: 'noor',
  defaults: { eyebrow: 'Gift finder', heading: 'Find the perfect gift', subtitle: 'Pick the occasion and your budget.', limit: 8 },
  defaultLayout: 'chips',
  layouts: {
    chips: { name: 'Chips + products', load: () => import('./layouts/Chips') },
  },
};

export default manifest;
