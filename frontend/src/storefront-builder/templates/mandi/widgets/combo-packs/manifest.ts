import type { PackManifest, SmartProducts } from '../../../../core/types';

export interface ComboPacksSettings { eyebrow: string; heading: string; subtitle: string }
/** A combo: products bought together. The total is the sum of their live prices (no stored price). */
export interface ComboBlock { title: string; note: string; products: SmartProducts }

export const COMBO_DEFAULTS: ComboBlock = { title: 'Breakfast combo', note: '', products: { $products: { source: 'manual', productIds: [], limit: 6 } } };

/** Mandi signature widget: ready-made bundles with an "Add all to cart" button. */
const manifest: PackManifest<ComboPacksSettings> = {
  kind: 'section',
  id: 'combo-packs',
  name: 'Combo packs',
  version: 1,
  tier: 'free',
  template: 'mandi',
  defaults: { eyebrow: 'Save time', heading: 'Combo packs', subtitle: 'Everyday essentials, added in one tap.' },
  defaultLayout: 'cards',
  layouts: {
    cards: { name: 'Combo cards', load: () => import('./layouts/Cards') },
  },
};

export default manifest;
