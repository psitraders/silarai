import type { CardProps } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { AddIcon, Badges, CardImage, WishlistButton } from '../parts/Parts';
import { useCard } from '../parts/useCard';

/** Name, price and add button sit over the photo (on hover with a mouse, always on touch). */
export default function Overlay({ product, index, context }: CardProps) {
  const card = useCard(product, index);
  return (
    <article className="group relative h-full overflow-hidden sf-img">
      <CardImage product={product} card={card} eager={context.isFirst && index >= 0 && index < 2} className="aspect-[3/4]" />
      <Badges card={card} />
      <WishlistButton product={product} card={card} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-2 p-3 pt-12 text-white transition-opacity duration-(--sf-motion-base) [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" style={{ background: 'linear-gradient(to top, rgb(0 0 0 / 0.7), transparent)' }}>
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-bold leading-snug ${card.titleClamp}`}>{product.title}</h3>
          <div className="[&_.sf-price]:text-white [&_.sf-muted]:text-white/75"><Price product={product} size="sm" /></div>
        </div>
        <div className="pointer-events-auto"><AddIcon product={product} card={card} /></div>
      </div>
    </article>
  );
}
