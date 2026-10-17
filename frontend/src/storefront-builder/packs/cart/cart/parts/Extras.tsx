/* Rendered inside the cart drawer's white panel (legacy CartDrawer styling), so these
   use its neutral slate look and the brand colour rather than scheme tokens. */
import { Plus, Truck } from 'lucide-react';
import { useCart } from '../../../../../context/CartContext';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { useResolvedProducts } from '../../../../core/data/hooks';
import { useShell } from '../../../../core/shell-context';
import { useStorefront } from '../../../../core/storefront-context';
import { displayPrice, isOutOfStock, needsOptions } from '../../../../ui/product';

/** "Add ₹X more for free delivery" progress bar (display only — charges are unchanged). */
export function FreeDelivery({ target }: { target: number }) {
  const { totalAmount } = useCart();
  const { store, brandColor } = useStorefront();
  const left = Math.max(0, target - totalAmount);
  const pct = Math.min(100, Math.round((totalAmount / target) * 100));
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
        <Truck className="h-4 w-4 shrink-0" style={{ color: brandColor }} aria-hidden />
        {left > 0 ? <>Add {formatCurrency(left, store.currency ?? 'INR')} more for free delivery</> : <>You've unlocked free delivery!</>}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Free delivery progress">
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: brandColor }} />
      </div>
    </div>
  );
}

/** A short row of featured products that are not in the cart yet. */
export function Upsell() {
  const { items } = useCart();
  const shell = useShell();
  const { store, brandColor } = useStorefront();
  const { items: featured } = useResolvedProducts({ $products: { source: 'featured', limit: 8 } });
  const picks = featured.filter(p => !items.some(i => i.productId === p.id) && !isOutOfStock(p)).slice(0, 6);
  if (!picks.length) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">You may also like</p>
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {picks.map(p => (
          <li key={p.id} className="w-28 shrink-0">
            <button type="button" onClick={() => shell.openProduct(p)} className="block w-full text-left">
              {p.primaryImage ? <img src={optimizeImage(p.primaryImage, 200)} alt="" loading="lazy" className="aspect-square w-full rounded-lg object-cover" /> : <span className="block aspect-square w-full rounded-lg bg-slate-100" />}
              <span className="mt-1 line-clamp-1 text-xs font-semibold text-slate-800">{p.title}</span>
            </button>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold" style={{ color: brandColor }}>{formatCurrency(displayPrice(p).amount, store.currency ?? 'INR')}</span>
              <button
                type="button"
                onClick={() => (needsOptions(p) ? shell.openProduct(p) : shell.addToCart(p))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white"
                style={{ background: brandColor }}
                aria-label={needsOptions(p) ? `Choose options for ${p.title}` : `Add ${p.title} to cart`}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
