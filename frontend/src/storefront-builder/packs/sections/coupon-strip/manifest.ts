import type { PackManifest } from '../../../core/types';

export interface CouponStripSettings {
  eyebrow: string;
  heading: string;
  /** `store` = coupons marked "Show on storefront" under Coupons (live); `manual` = the codes typed as blocks. */
  source: 'store' | 'manual';
}
export interface CouponBlock { code: string; text: string; endsAt: string }

export const COUPON_DEFAULTS: CouponBlock = { code: 'WELCOME10', text: '10% off your first order', endsAt: '' };

/**
 * Coupon codes shoppers can copy — live from the store's coupons (v2 default) or typed by
 * the merchant. The cart validates codes at checkout as before.
 */
const manifest: PackManifest<CouponStripSettings> = {
  kind: 'section',
  id: 'coupon-strip',
  name: 'Coupon strip',
  version: 2,
  tier: 'free',
  defaults: { eyebrow: '', heading: 'Offers for you', source: 'store' },
  // v1 strips only had typed codes: keep them on "manual".
  upgrade: (settings, from) => (from < 2 ? { source: 'manual', ...settings } : settings),
  defaultLayout: 'strip',
  layouts: {
    strip: { name: 'Strip', load: () => import('./layouts/Strip') },
    tickets: { name: 'Ticket cards', load: () => import('./layouts/Tickets') },
  },
};

export default manifest;
