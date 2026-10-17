import type { CardProps } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { Badges, CardImage, WishlistButton } from '../parts/Parts';
import { useCard } from '../parts/useCard';

/** Tall portrait photo, name in the heading font, no button — for fashion and jewellery. */
export default function Editorial({ product, index, context }: CardProps) {
  const card = useCard(product, index);
  return (
    <article className="group flex h-full flex-col gap-3">
      <div className="relative sf-img">
        <CardImage product={product} card={card} eager={context.isFirst && index >= 0 && index < 2} className="aspect-[2/3]" width={600} />
        <Badges card={card} />
        <WishlistButton product={product} card={card} />
      </div>
      <div className="flex flex-col gap-1 text-center">
        {card.style.productShowCategory && product.categoryName && <p className="text-[10px] font-semibold uppercase tracking-[0.2em] sf-muted">{product.categoryName}</p>}
        <h3 className={`text-lg leading-snug ${card.titleClamp}`} style={{ fontFamily: 'var(--sf-font-heading)' }}>
          <button type="button" onClick={card.open} className="hover:underline">{product.title}</button>
        </h3>
        <div className="flex justify-center"><Price product={product} size="sm" /></div>
      </div>
    </article>
  );
}
