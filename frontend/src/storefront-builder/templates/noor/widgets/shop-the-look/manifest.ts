import type { PackManifest, SmartImage, SmartProducts } from '../../../../core/types';

export interface ShopTheLookSettings { eyebrow: string; heading: string; text: string; image: SmartImage }

/** A hotspot on the look photo: position in % of the photo and the product it shows. */
export interface SpotBlock { x: number; y: number; product: SmartProducts }

export const SPOT_DEFAULTS: SpotBlock = { x: 50, y: 50, product: { $products: { source: 'manual', productIds: [], limit: 1 } } };

/** Noor signature widget: a styled photo with tappable product hotspots. */
const manifest: PackManifest<ShopTheLookSettings> = {
  kind: 'section',
  id: 'shop-the-look',
  name: 'Shop the look',
  version: 1,
  tier: 'free',
  template: 'noor',
  defaults: { eyebrow: 'Shop the look', heading: 'Styled for the evening', text: '', image: { $image: '' } },
  defaultLayout: 'hotspots',
  layouts: {
    hotspots: { name: 'Photo + products', load: () => import('./layouts/Hotspots') },
    stacked: { name: 'Photo over products', load: () => import('./layouts/Stacked') },
  },
};

export default manifest;
