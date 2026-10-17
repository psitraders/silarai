import type { PackManifest, SmartImage, SmartProducts } from '../../../../core/types';

export interface InstagramGridSettings { eyebrow: string; heading: string; showHandle: boolean }
/** A post the merchant uploads (no Instagram API), optionally linked to the product in it. */
export interface PostBlock { image: SmartImage; caption: string; product: SmartProducts }

export const POST_DEFAULTS: PostBlock = { image: { $image: '' }, caption: '', product: { $products: { source: 'manual', productIds: [], limit: 1 } } };

/** Bloom signature widget: a shoppable grid of social posts. */
const manifest: PackManifest<InstagramGridSettings> = {
  kind: 'section',
  id: 'instagram-grid',
  name: 'Shoppable Instagram grid',
  version: 1,
  tier: 'free',
  template: 'bloom',
  defaults: { eyebrow: 'As seen on Instagram', heading: 'Styled by you', showHandle: true },
  defaultLayout: 'grid',
  layouts: {
    grid: { name: 'Square grid', load: () => import('./layouts/Grid') },
  },
};

export default manifest;
