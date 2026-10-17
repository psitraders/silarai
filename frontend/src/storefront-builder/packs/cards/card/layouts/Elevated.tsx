import type { CardProps } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { AddButton, Badges, CardImage, Title, WishlistButton } from '../parts/Parts';
import { useCard } from '../parts/useCard';

/** A soft shadow card that lifts on hover. */
export default function Elevated({ product, index, context }: CardProps) {
  const card = useCard(product, index);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--sf-radius-lg)] shadow-md transition-[transform,box-shadow] duration-(--sf-motion-base) hover:-translate-y-1 hover:shadow-xl" style={{ background: 'var(--sf-surface)' }}>
      <div className="relative">
        <CardImage product={product} card={card} eager={context.isFirst && index >= 0 && index < 2} />
        <Badges card={card} />
        <WishlistButton product={product} card={card} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {card.style.productShowCategory && product.categoryName && <p className="sf-eyebrow text-[10px]">{product.categoryName}</p>}
        <Title product={product} card={card} className="flex-1" />
        <Price product={product} />
        <AddButton product={product} card={card} />
      </div>
    </article>
  );
}
