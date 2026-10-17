import type { PackManifest, SmartProducts } from '../../../core/types';

export interface ProductSpotlightSettings {
  product: SmartProducts;
  eyebrow: string;
  /** Empty = the product name. */
  heading: string;
  /** Empty = the product description. */
  text: string;
  buttonLabel: string;
}

const manifest: PackManifest<ProductSpotlightSettings> = {
  kind: 'section',
  id: 'product-spotlight',
  name: 'Product spotlight',
  version: 1,
  tier: 'free',
  defaults: {
    product: { $products: { source: 'featured', limit: 1 } },
    eyebrow: 'Bestseller',
    heading: '',
    text: '',
    buttonLabel: 'Add to cart',
  },
  defaultLayout: 'image-left',
  layouts: {
    'image-left': { name: 'Image left', load: () => import('./layouts/ImageLeft') },
    'image-right': { name: 'Image right', load: () => import('./layouts/ImageRight') },
  },
};

export default manifest;
