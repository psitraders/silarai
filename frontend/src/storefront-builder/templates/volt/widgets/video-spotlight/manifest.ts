import type { PackManifest, SmartProducts } from '../../../../core/types';

export interface VideoSpotlightSettings {
  eyebrow: string;
  heading: string;
  text: string;
  /** The product whose video plays (an .mp4 / .webm uploaded among its images). */
  product: SmartProducts;
  buttonLabel: string;
}

/** Volt signature widget: a product's own video with its name, price and a buy button. */
const manifest: PackManifest<VideoSpotlightSettings> = {
  kind: 'section',
  id: 'video-spotlight',
  name: 'Video spotlight',
  version: 1,
  tier: 'free',
  template: 'volt',
  defaults: { eyebrow: 'See it in action', heading: '', text: '', product: { $products: { source: 'manual', productIds: [], limit: 1 } }, buttonLabel: 'View product' },
  defaultLayout: 'split',
  layouts: {
    split: { name: 'Video + details', load: () => import('./layouts/Split') },
    wide: { name: 'Wide video', load: () => import('./layouts/Wide') },
  },
};

export default manifest;
