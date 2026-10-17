import { Check, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { useResolvedProducts } from '../../../../core/data/hooks';
import { useShell } from '../../../../core/shell-context';
import { useStorefront } from '../../../../core/storefront-context';
import type { RenderContext } from '../../../../core/types';
import { ProductImage } from '../../../../ui/ProductImage';
import { displayPrice, isOutOfStock, needsOptions } from '../../../../ui/product';
import type { ComboBlock } from './manifest';

/**
 * One combo: its items, the sum of their live prices and "Add all to cart". Items that need
 * options or are sold out can't be added in one tap, so the button explains instead.
 */
export function ComboCard({ combo, context }: { combo: ComboBlock; context: RenderContext }) {
  const { store } = useStorefront();
  const { addToCart, openProduct } = useShell();
  const { items, isLoading } = useResolvedProducts(combo.products);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (isLoading) return <div className="sf-card sf-skeleton h-56" aria-hidden />;
  if (!items.length) {
    return context.mode === 'live' ? null : <div className="sf-card p-5 text-sm sf-muted">Pick the products in “{combo.title || 'this combo'}”.</div>;
  }

  const currency = store.currency ?? 'INR';
  const total = items.reduce((sum, p) => sum + displayPrice(p).amount, 0);
  const blocked = items.find(p => needsOptions(p) || isOutOfStock(p));
  const addAll = () => {
    for (const p of items) addToCart(p, 1);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2500);
  };

  return (
    <article className="sf-card flex h-full flex-col gap-4 p-5">
      <div>
        <h3 className="sf-h3">{combo.title}</h3>
        {combo.note && <p className="mt-0.5 text-sm sf-muted">{combo.note}</p>}
      </div>
      <ul className="space-y-2">
        {items.map(p => (
          <li key={p.id} className="flex items-center gap-3">
            <button type="button" onClick={() => openProduct(p)} className="shrink-0" aria-label={`View ${p.title}`}>
              <ProductImage src={p.primaryImage} alt="" width={120} className="h-12 w-12 rounded-[var(--sf-radius-sm)]" />
            </button>
            <span className="min-w-0 flex-1 truncate text-sm">{p.title}</span>
            <span className="shrink-0 text-sm font-semibold tabular-nums">{formatCurrency(displayPrice(p).amount, currency)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between gap-3 pt-3" style={{ borderTop: '1px solid var(--sf-border)' }}>
        <p className="text-sm">Total <span className="sf-price text-base font-bold tabular-nums">{formatCurrency(total, currency)}</span></p>
        {blocked ? (
          <button type="button" className="sf-btn sf-btn-secondary sf-btn-sm" onClick={() => openProduct(blocked)}>
            {isOutOfStock(blocked) ? 'An item is sold out' : 'Choose options'}
          </button>
        ) : (
          <button type="button" className="sf-btn sf-btn-primary sf-btn-sm" onClick={addAll}>
            {added ? <><Check className="h-4 w-4" aria-hidden /> Added</> : <><ShoppingBag className="h-4 w-4" aria-hidden /> Add all</>}
          </button>
        )}
      </div>
      <span className="sr-only" aria-live="polite">{added ? `${combo.title} added to cart` : ''}</span>
    </article>
  );
}
