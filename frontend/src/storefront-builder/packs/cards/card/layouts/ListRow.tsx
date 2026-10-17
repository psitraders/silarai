import { Minus, Plus } from 'lucide-react';
import { useCart } from '../../../../../context/CartContext';
import type { CardProps } from '../../../../core/types';
import { FoodMark } from '../../../../ui/FoodMark';
import { Price } from '../../../../ui/Price';
import { ProductImage } from '../../../../ui/ProductImage';
import { useCard } from '../parts/useCard';

/** Horizontal row with a +/− stepper — fast repeat adds (grocery, kirana). */
export default function ListRow({ product, index, context }: CardProps) {
  const card = useCard(product, index);
  const { items, updateQty } = useCart();
  const inCart = card.options ? 0 : items.find(i => i.productId === product.id && !i.variantInfo)?.quantity ?? 0;
  const max = product.stockQuantity ?? Infinity;

  return (
    <article className="flex h-full items-center gap-3 rounded-[var(--sf-radius-md)] p-2.5" style={{ border: '1px solid var(--sf-border)', background: 'var(--sf-surface)' }}>
      <button type="button" onClick={card.open} className="relative shrink-0" aria-label={`View ${product.title}`}>
        <ProductImage src={product.primaryImage} alt={product.title} width={200} eager={context.isFirst && index >= 0 && index < 4} className="h-20 w-20 rounded-[var(--sf-radius-sm)]" />
        {card.discount > 0 && !card.soldOut && <span className="sf-badge absolute -left-1 -top-1 scale-90">{card.badges.find(b => !b.neutral && !b.text.startsWith('#'))?.text}</span>}
      </button>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          <button type="button" onClick={card.open} className="text-left hover:underline">{product.title}</button>
        </h3>
        {card.style.productShowCategory && product.categoryName && <p className="text-[11px] sf-muted">{product.categoryName}</p>}
        {card.foodMark && <FoodMark product={card.foodMark} className="mt-1" />}
        <Price product={product} size="sm" className="mt-1" />
      </div>
      <div className="shrink-0">
        {card.soldOut ? (
          <span className="text-xs font-semibold sf-muted">Sold out</span>
        ) : inCart > 0 ? (
          <div className="inline-flex items-center rounded-[var(--sf-btn-radius)]" style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}>
            <button type="button" className="flex h-9 w-9 items-center justify-center" onClick={() => updateQty(product.id, inCart - 1)} aria-label={`Remove one ${product.title}`}><Minus className="h-4 w-4" aria-hidden /></button>
            <span className="min-w-6 text-center text-sm font-bold tabular-nums" aria-live="polite">{inCart}</span>
            <button type="button" className="flex h-9 w-9 items-center justify-center disabled:opacity-40" disabled={inCart >= max} onClick={() => updateQty(product.id, inCart + 1)} aria-label={`Add one more ${product.title}`}><Plus className="h-4 w-4" aria-hidden /></button>
          </div>
        ) : (
          <button type="button" onClick={card.add} className="sf-btn sf-btn-secondary sf-btn-sm" aria-label={card.options ? `Choose options for ${product.title}` : `Add ${product.title} to cart`}>
            {card.options ? 'Options' : <><Plus className="h-4 w-4" aria-hidden /> Add</>}
          </button>
        )}
      </div>
    </article>
  );
}
