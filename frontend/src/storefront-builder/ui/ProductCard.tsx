import { Check, Scale } from 'lucide-react';
import { Suspense } from 'react';
import { resolvePack } from '../core/renderer/lazyLayout';
import { useShell } from '../core/shell-context';
import { useStorefront } from '../core/storefront-context';
import type { CardProps, RenderContext, StoreProduct } from '../core/types';

/**
 * Draws a product with the store's chosen card style (a `card` pack), or a
 * per-section override. Product sections use this, so they never depend on a
 * specific card pack (design.md §13 rule 2).
 */
export function ProductCard({ product, index, context, cardStyle }: {
  product: StoreProduct;
  index: number;
  context: RenderContext;
  /** Optional per-section override of the store's card style. */
  cardStyle?: string;
}) {
  const { site } = useStorefront();
  // One `card` pack with a layout per style; unknown styles fall back to its default.
  const pack = resolvePack<unknown, CardProps>('card', 'card', cardStyle || site.behaviour.cardStyle);
  if (!pack) return null;
  const card = (
    <Suspense fallback={<CardSkeleton />}>
      <pack.Component product={product} index={index} context={context} />
    </Suspense>
  );
  if (!site.behaviour.compare) return card;
  return <div className="flex h-full flex-col gap-1.5"><div className="flex-1">{card}</div><CompareToggle product={product} /></div>;
}

/** "Compare" toggle under every card when product compare is on (store behaviour). */
function CompareToggle({ product }: { product: StoreProduct }) {
  const { compare } = useShell();
  const picked = compare.ids.includes(product.id);
  const full = !picked && compare.ids.length >= compare.max;
  return (
    <button
      type="button"
      onClick={() => compare.toggle(product)}
      disabled={full}
      aria-pressed={picked}
      title={full ? `You can compare up to ${compare.max} products` : undefined}
      className="inline-flex min-h-9 items-center gap-1.5 self-start rounded-[var(--sf-btn-radius)] px-2 text-xs font-semibold disabled:opacity-50"
      style={{ color: picked ? 'var(--sf-link)' : 'var(--sf-muted)' }}
    >
      {picked ? <Check className="h-4 w-4" aria-hidden /> : <Scale className="h-4 w-4" aria-hidden />}
      {picked ? 'Comparing' : 'Compare'}
      <span className="sr-only"> {product.title}</span>
    </button>
  );
}

export function CardSkeleton() {
  return (
    <div className="sf-card" aria-hidden>
      <div className="sf-skeleton aspect-[4/5]" />
      <div className="space-y-2 p-3">
        <div className="sf-skeleton h-3 w-1/3 rounded-full" />
        <div className="sf-skeleton h-4 w-full rounded-full" />
        <div className="sf-skeleton h-4 w-1/2 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}
