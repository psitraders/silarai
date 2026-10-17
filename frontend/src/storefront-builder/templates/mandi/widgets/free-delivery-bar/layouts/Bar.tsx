import { Truck } from 'lucide-react';
import { useCart } from '../../../../../../context/CartContext';
import { formatCurrency } from '../../../../../../utils/formatCurrency';
import { useStorefront } from '../../../../../core/storefront-context';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import type { FreeDeliveryBarSettings } from '../manifest';

/** Text and a bar that fills as the cart total grows toward free delivery. */
export default function Bar({ settings, context }: LayoutProps<FreeDeliveryBarSettings>) {
  const { store, site } = useStorefront();
  const { totalAmount } = useCart();
  const target = Number(settings.threshold) > 0 ? Number(settings.threshold) : site.behaviour.cart?.freeDeliveryAt ?? 0;
  if (!target) return <EditorHint context={context} text="Set the free-delivery amount here or under Style → Store behaviour → Cart." />;
  const money = (n: number) => formatCurrency(n, store.currency ?? 'INR').replace(/\.00$/, '');
  const missing = Math.max(0, target - totalAmount);
  const pct = Math.min(100, Math.round((totalAmount / target) * 100));
  const text = missing > 0 ? (settings.progressText || 'Add {amount} more for free delivery').replace('{amount}', money(missing)) : settings.doneText;
  return (
    <div className="sf-container py-4">
      <div className="mx-auto flex max-w-2xl flex-col gap-2">
        <p className="flex items-center justify-center gap-2 text-center text-sm font-semibold" aria-live="polite">
          <Truck className="h-4 w-4 shrink-0 sf-link" aria-hidden /> {text}
        </p>
        <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--sf-border)' }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progress to free delivery">
          <div className="h-full rounded-full transition-transform duration-300 motion-reduce:transition-none" style={{ width: '100%', transform: `translateX(-${100 - pct}%)`, background: 'var(--sf-button)' }} />
        </div>
      </div>
    </div>
  );
}
