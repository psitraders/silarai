import { useResolvedProducts } from '../../../../../core/data/hooks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { ProductRow } from '../../../../../ui/ProductRow';
import type { DealOfTheDaySettings } from '../manifest';
import { Timer } from '../Timer';
import { useDealCountdown } from '../useDeal';

/** Heading and timer, then the deals in a swipeable row. */
export default function Strip({ settings, context }: LayoutProps<DealOfTheDaySettings>) {
  const timer = useDealCountdown(settings);
  const { items, isLoading } = useResolvedProducts(settings.products);
  if (timer.hidden) return context.mode === 'live' ? null : <EditorHint context={context} text="This deal has ended — set a new end time to show it again." />;
  if (!isLoading && !items.length) return <EditorHint context={context} text="Pick the deal products (or add a sale price to some products)." />;
  return (
    <div className="sf-container sf-section-pad">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-1">{settings.eyebrow}</p>}
          <h2 className="sf-h2">{settings.heading}</h2>
        </div>
        {timer.valid && <Timer parts={timer} label={timer.daily ? 'Resets at midnight' : 'Ends in'} />}
      </div>
      <ProductRow products={items} isLoading={isLoading} layout="carousel" context={context} label={settings.heading || 'Deals'} />
    </div>
  );
}
