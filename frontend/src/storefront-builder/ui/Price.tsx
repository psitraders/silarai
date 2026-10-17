import { formatCurrency } from '../../utils/formatCurrency';
import { useStorefront } from '../core/storefront-context';
import { useStyleOptions } from '../core/theme/useStyleOptions';
import type { StoreProduct } from '../core/types';
import { displayPrice } from './product';

/**
 * Product price with optional "from" prefix and compare-at price.
 * Follows the "Prices" style options: strike-through or strike + saving pill, tax note.
 */
export function Price({ product, size = 'md', className = '' }: { product: StoreProduct; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const { store } = useStorefront();
  const style = useStyleOptions();
  const currency = store.currency ?? 'INR';
  const { amount, compareAt, from } = displayPrice(product);
  const main = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <span className={`inline-flex flex-col gap-0.5 ${className}`}>
      <span className="inline-flex flex-wrap items-baseline gap-2">
        <span className={`sf-price ${main}`}>
          {from && <span className="mr-1 text-xs font-semibold opacity-75">from</span>}
          {formatCurrency(amount, currency)}
        </span>
        {compareAt != null && (
          <span className="text-xs sf-muted line-through tabular-nums">
            <span className="sr-only">Was </span>{formatCurrency(compareAt, currency)}
          </span>
        )}
        {compareAt != null && style.priceCompare === 'strike-pill' && (
          <span className="sf-badge">Save {formatCurrency(compareAt - amount, currency)}</span>
        )}
      </span>
      {style.taxNote && size !== 'sm' && <span className="text-[11px] sf-muted">Incl. of all taxes</span>}
    </span>
  );
}
