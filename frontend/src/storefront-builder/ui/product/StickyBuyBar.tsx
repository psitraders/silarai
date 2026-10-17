import { Check, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../../../utils/formatCurrency';
import { optimizeImage } from '../../../utils/imageUrl';
import { useProductCtl } from '../../core/commerce/useProductController';
import { useOverlayRoot } from '../../core/shell-context';
import { useStorefront } from '../../core/storefront-context';
import { useAddToCart } from './useAddToCart';

/**
 * Sticky add-to-cart bar for product pages: slides in once the section's buy
 * buttons (or, without them, the end of the section) have scrolled out of view.
 */
export function StickyBuyBar() {
  const ctl = useProductCtl();
  const { store, site } = useStorefront();
  const overlayRoot = useOverlayRoot();
  const sentinel = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const { add, added } = useAddToCart();

  useEffect(() => {
    const el = sentinel.current;
    const win = el?.ownerDocument.defaultView;
    if (!el || !win || !('IntersectionObserver' in win)) return;
    // Watch the section's own buy buttons; fall back to this marker when there are none.
    const target = el.parentElement?.querySelector<HTMLElement>('[data-sf-buy]') ?? el;
    const io = new win.IntersectionObserver(([entry]) => setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(target);
    return () => io.disconnect();
  }, []);

  const image = ctl.images[0];
  const bar = show && !ctl.outOfStock && (
    <div className={`sf-bar fixed inset-x-0 z-30 sf-sheet-in ${site.behaviour.mobileBottomBar ? 'bottom-[68px] md:bottom-0' : 'bottom-0'}`} style={{ borderTop: '1px solid var(--sf-border)', borderBottom: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="sf-container flex items-center gap-3 py-2.5">
        {image && <img src={optimizeImage(image, 120)} alt="" className="hidden h-11 w-11 rounded-[var(--sf-radius-sm)] object-cover sm:block" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{ctl.product.title}</p>
          <p className="sf-price text-sm">{formatCurrency(ctl.unitPrice, store.currency ?? 'INR')}{ctl.variantInfo && <span className="ml-2 font-normal sf-muted">{ctl.variantInfo}</span>}</p>
        </div>
        <button type="button" onClick={() => add()} disabled={!ctl.allSelected} className="sf-btn sf-btn-primary shrink-0">
          {added ? <><Check className="h-4 w-4" aria-hidden /> Added</> : <><ShoppingBag className="h-4 w-4" aria-hidden /> Add to cart</>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div ref={sentinel} aria-hidden />
      {bar && (overlayRoot ? createPortal(bar, overlayRoot) : bar)}
    </>
  );
}
