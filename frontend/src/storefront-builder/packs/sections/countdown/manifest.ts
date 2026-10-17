import type { PackManifest, SmartLink } from '../../../core/types';

export interface CountdownSettings {
  eyebrow: string;
  heading: string;
  text: string;
  /** Local date-time, e.g. 2026-11-01T23:59. */
  endsAt: string;
  buttonLabel: string;
  buttonLink: SmartLink;
  /** Hide the whole section for shoppers once the timer reaches zero. */
  hideWhenDone: boolean;
}

const manifest: PackManifest<CountdownSettings> = {
  kind: 'section',
  id: 'countdown',
  name: 'Offer countdown',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: 'Limited time', heading: 'Festive sale ends in', text: '', endsAt: '', buttonLabel: 'Shop the sale', buttonLink: { $link: '/products' }, hideWhenDone: true },
  defaultLayout: 'banner',
  layouts: {
    banner: { name: 'Banner', load: () => import('./layouts/Banner') },
    boxed: { name: 'Boxed', load: () => import('./layouts/Boxed') },
  },
};

export default manifest;
