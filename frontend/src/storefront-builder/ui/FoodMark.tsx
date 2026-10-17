import type { StoreProduct } from '../core/types';
import { foodMarks } from './product';

/** The marks as small inline badges (nothing when the product has no food tags). */
export function FoodMark({ product, className = '' }: { product: StoreProduct; className?: string }) {
  const { diet, eggless } = foodMarks(product);
  if (!diet && !eggless) return null;
  const color = diet === 'non-veg' ? 'var(--sf-danger)' : 'var(--sf-success)';
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {diet && (
        <span role="img" aria-label={diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian'} title={diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px]" style={{ border: `1.5px solid ${color}`, background: 'var(--sf-surface)' }}>
          <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: color }} />
        </span>
      )}
      {eggless && <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: 'var(--sf-surface)', color: 'var(--sf-success)', border: '1px solid var(--sf-border)' }}>Eggless</span>}
    </span>
  );
}
