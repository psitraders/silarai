import type { CardProps } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { AddButton, Badges, CardImage } from '../parts/Parts';
import { useCard } from '../parts/useCard';

/** Arch-topped photo with centred text — warm and friendly (bakeries, gifts). */
export default function RoundedCenter({ product, index, context }: CardProps) {
  const card = useCard(product, index);
  return (
    <article className="group flex h-full flex-col items-center gap-3 text-center">
      <div className="relative w-full">
        <CardImage product={product} card={card} eager={context.isFirst && index >= 0 && index < 2} className="aspect-[4/5]" rounded="rounded-t-full rounded-b-[var(--sf-radius-lg)]" />
        <Badges card={card} />
      </div>
      <h3 className={`font-bold leading-snug ${card.titleClamp}`}>
        <button type="button" onClick={card.open} className="hover:underline">{product.title}</button>
      </h3>
      <Price product={product} />
      <div className="mt-auto w-full max-w-[12rem]"><AddButton product={product} card={card} /></div>
    </article>
  );
}
