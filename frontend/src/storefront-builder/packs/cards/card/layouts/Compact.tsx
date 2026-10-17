import type { CardProps } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { AddIcon, Badges, CardImage } from '../parts/Parts';
import { useCard } from '../parts/useCard';

/** Small, dense tile for 3-column phone grids (grocery, FMCG). */
export default function Compact({ product, index, context }: CardProps) {
  const card = useCard(product, index);
  return (
    <article className="group flex h-full flex-col gap-1.5">
      <div className="relative sf-img-sm">
        <CardImage product={product} card={card} eager={context.isFirst && index >= 0 && index < 3} className="aspect-square" width={300} />
        <Badges card={card} className="scale-90" />
        <AddIcon product={product} card={card} className="absolute bottom-1.5 right-1.5" />
      </div>
      <h3 className="line-clamp-2 text-xs font-semibold leading-snug">
        <button type="button" onClick={card.open} className="text-left">{product.title}</button>
      </h3>
      <Price product={product} size="sm" />
    </article>
  );
}
