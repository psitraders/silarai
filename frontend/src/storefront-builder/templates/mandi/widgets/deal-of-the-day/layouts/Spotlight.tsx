import { useResolvedProducts } from '../../../../../core/data/hooks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { CardSkeleton, ProductCard } from '../../../../../ui/ProductCard';
import type { DealOfTheDaySettings } from '../manifest';
import { Timer } from '../Timer';
import { useDealCountdown } from '../useDeal';

/** The first deal big with the timer; the other deals as compact rows beside it. */
export default function Spotlight({ settings, context }: LayoutProps<DealOfTheDaySettings>) {
  const timer = useDealCountdown(settings);
  const { items, isLoading } = useResolvedProducts(settings.products);
  if (timer.hidden) return context.mode === 'live' ? null : <EditorHint context={context} text="This deal has ended — set a new end time to show it again." />;
  if (!isLoading && !items.length) return <EditorHint context={context} text="Pick the deal products (or add a sale price to some products)." />;
  const [first, ...rest] = items;
  return (
    <div className="sf-container sf-section-pad">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-1">{settings.eyebrow}</p>}
          <h2 className="sf-h2">{settings.heading}</h2>
        </div>
        {timer.valid && <Timer parts={timer} label={timer.daily ? 'Resets at midnight' : 'Ends in'} />}
      </div>
      <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="mx-auto w-full max-w-sm @3xl:max-w-none">{isLoading ? <CardSkeleton /> : first && <ProductCard product={first} index={-1} context={context} cardStyle="elevated" />}</div>
        {(isLoading || rest.length > 0) && (
          <ul className="grid content-start gap-3" aria-label="More deals">
            {(isLoading ? [null, null, null] : rest).map((p, i) => (
              <li key={p?.id ?? i}>{p ? <ProductCard product={p} index={-1} context={context} cardStyle="list-row" /> : <CardSkeleton />}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
