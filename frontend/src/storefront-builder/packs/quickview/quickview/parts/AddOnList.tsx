import { Plus } from 'lucide-react';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { useProductCtl } from '../../../../core/commerce/useProductController';
import { useRelatedProducts } from '../../../../core/data/hooks';
import { useShell } from '../../../../core/shell-context';
import { useStorefront } from '../../../../core/storefront-context';
import { displayPrice, isOutOfStock, needsOptions } from '../../../../ui/product';

/** "Add-ons" — a few same-category products with a one-tap add (menu-item popup). */
export function AddOnList({ heading }: { heading: string }) {
  const { product } = useProductCtl();
  const shell = useShell();
  const { store } = useStorefront();
  const { items } = useRelatedProducts(product, 4);
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-bold">{heading || 'Add-ons'}</p>
      <ul className="space-y-2">
        {items.map(p => (
          <li key={p.id} className="flex items-center gap-3 rounded-[var(--sf-radius-md)] p-2" style={{ border: '1px solid var(--sf-border)' }}>
            {p.primaryImage ? <img src={optimizeImage(p.primaryImage, 120)} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-[var(--sf-radius-sm)] object-cover" /> : <span className="sf-placeholder h-12 w-12 shrink-0 rounded-[var(--sf-radius-sm)]" aria-hidden />}
            <span className="min-w-0 flex-1">
              <span className="line-clamp-1 text-sm font-semibold">{p.title}</span>
              <span className="sf-price text-xs">{formatCurrency(displayPrice(p).amount, store.currency ?? 'INR')}</span>
            </span>
            <button
              type="button"
              disabled={isOutOfStock(p)}
              onClick={() => (needsOptions(p) ? shell.openProduct(p) : shell.addToCart(p))}
              className="sf-btn sf-btn-secondary sf-btn-sm shrink-0"
              aria-label={needsOptions(p) ? `Choose options for ${p.title}` : `Add ${p.title} to cart`}
            >
              <Plus className="h-4 w-4" aria-hidden /> {needsOptions(p) ? 'Options' : 'Add'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
