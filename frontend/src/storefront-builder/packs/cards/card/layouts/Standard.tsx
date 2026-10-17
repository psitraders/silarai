import type { CardProps } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { AddButton, Badges, CardImage, Title, WishlistButton } from '../parts/Parts';
import { useCard } from '../parts/useCard';

/** Image, category, title, price and an add button (the Starter card). */
export default function Standard({ product, index, context }: CardProps) {
  const card = useCard(product, index);
  return (
    <article className="sf-card sf-card-hover group flex h-full flex-col">
      <div className="relative">
        <CardImage product={product} card={card} eager={context.isFirst && index >= 0 && index < 2} />
        <Badges card={card} />
        <WishlistButton product={product} card={card} />
      </div>
      <div className="sf-card-pad flex flex-1 flex-col gap-1.5">
        {card.style.productShowCategory && product.categoryName && <p className="sf-eyebrow text-[10px]">{product.categoryName}</p>}
        <Title product={product} card={card} className="flex-1 text-sm" />
        <Price product={product} />
        <AddButton product={product} card={card} />
      </div>
    </article>
  );
}
