import { useEffect, useRef, useState } from 'react';
import { useProductCtl, useProductSurface } from '../../core/commerce/useProductController';

/** Add to cart with the "Added" confirmation; closes a popup so the cart drawer is visible. */
export function useAddToCart() {
  const ctl = useProductCtl();
  const surface = useProductSurface();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const add = (qty?: number) => {
    if (!ctl.addToCart(qty)) return;
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2500);
    if (surface.kind === 'popup') surface.close?.();
  };
  return { add, added };
}
