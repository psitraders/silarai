import type { PackManifest, SmartProducts } from '../../../../core/types';

export interface TodaysBakeSettings {
  eyebrow: string;
  heading: string;
  products: SmartProducts;
  /** Daily order cut-off, "HH:MM" (24 h, shopper's time). Empty = no countdown. */
  cutoff: string;
  /** Shown after the cut-off, e.g. "Orders now go out tomorrow". */
  afterCutoff: string;
}

/** Crumb signature widget: today's specials with a "order before 6 PM" countdown. */
const manifest: PackManifest<TodaysBakeSettings> = {
  kind: 'section',
  id: 'todays-bake',
  name: 'Today’s bake',
  version: 1,
  tier: 'free',
  template: 'crumb',
  defaults: {
    eyebrow: 'Fresh today',
    heading: 'Today’s bake',
    products: { $products: { source: 'featured', limit: 4 } },
    cutoff: '18:00',
    afterCutoff: 'Today’s orders are closed — order now for tomorrow.',
  },
  defaultLayout: 'cards',
  layouts: {
    cards: { name: 'Cards', load: () => import('./layouts/Cards') },
  },
};

export default manifest;
