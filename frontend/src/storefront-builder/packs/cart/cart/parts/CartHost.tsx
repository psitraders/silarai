import { CartDrawer, type CartPlacement } from '../../../../../components/storefront/CartDrawer';
import { useStorefront } from '../../../../core/storefront-context';
import type { CartProps } from '../../../../core/types';
import { FreeDelivery, Upsell } from './Extras';

/** The existing cart + checkout (coupons, COD OTP, B2B tiers) in the chosen placement. */
export function CartHost({ open, onClose, placement }: CartProps & { placement: CartPlacement }) {
  const { store, slug, isCustomDomain, brandColor, site } = useStorefront();
  const options = site.behaviour.cart;
  return (
    <CartDrawer
      open={open}
      onClose={onClose}
      slug={slug}
      isCustomDomain={isCustomDomain}
      placement={placement}
      showCoupon={options?.coupon !== false}
      top={options?.freeDeliveryAt ? <FreeDelivery target={options.freeDeliveryAt} /> : undefined}
      beforeTotals={options?.upsell ? <Upsell /> : undefined}
      store={{
        name: store.name,
        logoUrl: store.logoUrl,
        currency: store.currency,
        themeColor: brandColor,
        razorpayEnabled: store.razorpayEnabled,
        whatsAppNumber: store.whatsAppNumber,
        whatsAppCtaLabel: store.whatsAppCtaLabel,
        b2bEnabled: store.b2bEnabled,
      }}
    />
  );
}
