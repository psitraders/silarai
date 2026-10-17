import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { blocksOf } from '../../../core/blocks';
import { useStoreCoupons } from '../../../core/data/hooks';
import { useStorefront } from '../../../core/storefront-context';
import type { BlockInstance, StoreCoupon } from '../../../core/types';
import { COUPON_DEFAULTS, type CouponBlock, type CouponStripSettings } from './manifest';

/** Offer text for a store coupon, e.g. "10% off above ₹999". */
function offerText(c: StoreCoupon, currency: string): string {
  const money = (n: number) => formatCurrency(n, currency).replace(/\.00$/, '');
  const main = c.type === 'Percentage' ? `${c.value}% off`
    : c.type === 'Flat' ? `${money(c.value)} off`
    : `Buy ${c.buyQuantity ?? 1} get ${c.getQuantity ?? 1} free`;
  return c.minOrderAmount ? `${main} above ${money(c.minOrderAmount)}` : main;
}

/**
 * Coupons to show (expired ones hidden) and a copy-to-clipboard helper with feedback.
 * `store` reads the coupons marked "Show on storefront"; `manual` reads the typed blocks.
 */
export function useCoupons(blocks: BlockInstance[], source: CouponStripSettings['source']) {
  const { store } = useStorefront();
  const fromStore = source !== 'manual';
  const live = useStoreCoupons(fromStore);
  const [now] = useState(() => Date.now());
  const coupons: { id: string; settings: CouponBlock }[] = fromStore
    ? (live.data ?? []).map(c => ({ id: c.code, settings: { code: c.code, text: offerText(c, store.currency ?? 'INR'), endsAt: c.validTo ?? '' } }))
    : blocksOf(blocks, 'coupon', COUPON_DEFAULTS)
      .filter(c => c.settings.code.trim() && (!c.settings.endsAt || Number.isNaN(Date.parse(c.settings.endsAt)) || Date.parse(c.settings.endsAt) > now));
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copy = async (id: string, code: string) => {
    try { await navigator.clipboard.writeText(code); } catch { return; }
    setCopied(id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 2000);
  };
  const emptyHint = fromStore
    ? 'No coupons are listed yet. Under Coupons, turn on “Show on storefront” for the codes you want here.'
    : 'Add coupon codes to this section (create them under Coupons first).';
  return { coupons, copied, copy, emptyHint, isLoading: fromStore && live.isLoading };
}
