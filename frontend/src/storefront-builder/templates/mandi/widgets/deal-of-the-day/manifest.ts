import type { PackManifest, SmartProducts } from '../../../../core/types';

export interface DealOfTheDaySettings {
  eyebrow: string;
  heading: string;
  /** Fixed end time; empty = the deal resets at midnight every day. */
  endsAt: string;
  products: SmartProducts;
  /** Hide the section once a fixed end time has passed. */
  hideWhenDone: boolean;
}

/** Mandi signature widget: today's deals with a live countdown (prices stay live from the catalogue). */
const manifest: PackManifest<DealOfTheDaySettings> = {
  kind: 'section',
  id: 'deal-of-the-day',
  name: 'Deal of the day',
  version: 1,
  tier: 'free',
  template: 'mandi',
  defaults: {
    eyebrow: 'Today only',
    heading: 'Deal of the day',
    endsAt: '',
    products: { $products: { source: 'sale', limit: 4 } },
    hideWhenDone: true,
  },
  defaultLayout: 'spotlight',
  layouts: {
    spotlight: { name: 'Spotlight', load: () => import('./layouts/Spotlight') },
    strip: { name: 'Strip', load: () => import('./layouts/Strip') },
  },
};

export default manifest;
