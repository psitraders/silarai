import type { CardProps } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { Badges, CardImage, Title, WishlistButton } from '../parts/Parts';
import { useCard } from '../parts/useCard';

/** Image, title and price only — no frame, no button. */
export default function Minimal({ product, index, context }: CardProps) {
  const card = useCard(product, index);
  return (
    <article className="group flex h-full flex-col gap-2.5">
      <div className="relative sf-img">
        <CardImage product={product} card={card} eager={context.isFirst && index >= 0 && index < 2} />
        <Badges card={card} />
        <WishlistButton product={product} card={card} />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <Title product={product} card={card} className="text-sm font-semibold" />
        <Price product={product} size="sm" />
      </div>
    </article>
  );
}
