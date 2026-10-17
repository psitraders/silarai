import type { CardProps } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { AddButton, Badges, CardImage, Title, WishlistButton } from '../parts/Parts';
import { useCard } from '../parts/useCard';

/** A framed card with an inset photo and padding all round. */
export default function Bordered({ product, index, context }: CardProps) {
  const card = useCard(product, index);
  return (
    <article className="group flex h-full flex-col gap-3 rounded-[var(--sf-radius-md)] p-2.5 transition-colors hover:border-[var(--sf-text)]" style={{ border: '1px solid var(--sf-border)', background: 'var(--sf-surface)' }}>
      <div className="relative">
        <CardImage product={product} card={card} eager={context.isFirst && index >= 0 && index < 2} rounded="sf-img-sm" />
        <Badges card={card} />
        <WishlistButton product={product} card={card} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-1 pb-1">
        {card.style.productShowCategory && product.categoryName && <p className="text-[11px] sf-muted">{product.categoryName}</p>}
        <Title product={product} card={card} className="flex-1 text-sm" />
        <Price product={product} />
        <AddButton product={product} card={card} variant="secondary" />
      </div>
    </article>
  );
}
