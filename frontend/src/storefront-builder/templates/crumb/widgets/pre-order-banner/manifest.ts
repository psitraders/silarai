import type { PackManifest, SmartLink } from '../../../../core/types';

export interface PreOrderSettings {
  eyebrow: string;
  heading: string;
  text: string;
  /** Last day / time to pre-order. Empty = no date shown. */
  orderBy: string;
  buttonLabel: string;
  buttonLink: SmartLink;
  /** Hide once the order-by date has passed. */
  hideAfter: boolean;
}

/** Crumb signature widget: a pre-order call-out with an order-by date (festive boxes, cakes). */
const manifest: PackManifest<PreOrderSettings> = {
  kind: 'section',
  id: 'pre-order-banner',
  name: 'Pre-order banner',
  version: 1,
  tier: 'free',
  template: 'crumb',
  defaults: {
    eyebrow: 'Pre-orders open',
    heading: 'Festive hampers, made to order',
    text: 'Order ahead so we can bake yours fresh.',
    orderBy: '',
    buttonLabel: 'Pre-order now',
    buttonLink: { $link: '/products' },
    hideAfter: true,
  },
  defaultLayout: 'banner',
  layouts: {
    banner: { name: 'Banner', load: () => import('./layouts/Banner') },
  },
};

export default manifest;
