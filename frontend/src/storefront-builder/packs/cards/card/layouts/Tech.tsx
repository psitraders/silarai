import type { CardProps } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { parseSpecs } from '../../../../ui/product/blockTypes';
import { AddButton, Badges, CardImage, Title, WishlistButton } from '../parts/Parts';
import { useCard } from '../parts/useCard';

/** Image, name, 2–3 spec chips (from "Label: value" description lines) and price. */
export default function Tech({ product, index, context }: CardProps) {
  const card = useCard(product, index);
  const specs = parseSpecs(product.description).slice(0, 3);
  return (
    <article className="sf-card sf-card-hover group flex h-full flex-col">
      <div className="relative p-3" style={{ background: 'color-mix(in srgb, var(--sf-text) 3%, var(--sf-surface))' }}>
        <CardImage product={product} card={card} eager={context.isFirst && index >= 0 && index < 2} className="aspect-square" />
        <Badges card={card} />
        <WishlistButton product={product} card={card} />
      </div>
      <div className="sf-card-pad flex flex-1 flex-col gap-2">
        <Title product={product} card={card} className="text-sm" />
        {specs.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {specs.map(s => <li key={s.label} className="rounded-[var(--sf-radius-sm)] px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: 'color-mix(in srgb, var(--sf-text) 7%, transparent)' }} title={s.label}>{s.value}</li>)}
          </ul>
        )}
        <div className="mt-auto"><Price product={product} /></div>
        <AddButton product={product} card={card} />
      </div>
    </article>
  );
}
