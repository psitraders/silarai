import { Scale, X } from 'lucide-react';
import { ProductImage } from '../../ui/ProductImage';
import type { CompareItem } from './useCompare';
import { COMPARE_MAX } from './useCompare';

/** Floating tray with the products picked for comparison (shown while at least one is picked). */
export function CompareTray({ items, onRemove, onClear, onCompare, aboveMobileBar }: {
  items: CompareItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  aboveMobileBar: boolean;
}) {
  if (!items.length) return null;
  return (
    <div className={`fixed inset-x-0 z-20 px-3 pb-3 ${aboveMobileBar ? 'bottom-20 md:bottom-0' : 'bottom-0'}`}>
      <section aria-label="Compare products" className="sf-card sf-bar mx-auto flex max-w-3xl items-center gap-3 p-2.5 shadow-xl">
        <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto" aria-label={`${items.length} of ${COMPARE_MAX} picked`}>
          {items.map(i => (
            <li key={i.id} className="relative shrink-0">
              <ProductImage src={i.image} alt={i.title} width={96} className="h-12 w-12 rounded-[var(--sf-radius-sm)]" />
              <button type="button" onClick={() => onRemove(i.id)} aria-label={`Remove ${i.title} from compare`}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full shadow"
                style={{ background: 'var(--sf-surface)', color: 'var(--sf-text)', border: '1px solid var(--sf-border)' }}>
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onClear} className="sf-btn sf-btn-ghost sf-btn-sm shrink-0">Clear</button>
        <button type="button" onClick={onCompare} disabled={items.length < 2} className="sf-btn sf-btn-primary sf-btn-sm shrink-0 disabled:opacity-50" title={items.length < 2 ? 'Pick at least 2 products' : undefined}>
          <Scale className="h-4 w-4" aria-hidden /> Compare{items.length > 1 ? ` (${items.length})` : ''}
        </button>
      </section>
    </div>
  );
}
