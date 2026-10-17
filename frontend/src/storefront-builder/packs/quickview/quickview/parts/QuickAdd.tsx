import { Check, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { useProductCtl } from '../../../../core/commerce/useProductController';
import { useStorefront } from '../../../../core/storefront-context';
import { QuantityView } from '../../../../ui/product/BuyBlocks';
import { useAddToCart } from '../../../../ui/product/useAddToCart';

/** Quantity stepper + "Add · ₹total" in one row (compact popups and story bar). */
export function QuickAddRow({ showQuantity = true }: { showQuantity?: boolean }) {
  const ctl = useProductCtl();
  const { store } = useStorefront();
  const { add, added } = useAddToCart();
  if (ctl.outOfStock) return <p className="sf-btn sf-btn-secondary sf-btn-block pointer-events-none opacity-60" aria-disabled="true">Sold out</p>;
  return (
    <div className="flex items-center gap-3">
      {showQuantity && <QuantityView compact />}
      <button type="button" onClick={() => add()} disabled={!ctl.allSelected} className="sf-btn sf-btn-primary flex-1" aria-live="polite">
        {added
          ? <><Check className="h-4 w-4" aria-hidden /> Added</>
          : <><ShoppingBag className="h-4 w-4" aria-hidden /> Add · {formatCurrency(ctl.unitPrice * ctl.quantity, store.currency ?? 'INR')}</>}
      </button>
    </div>
  );
}
