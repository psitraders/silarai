import { useReviewsSummary } from '../../../../core/data/hooks';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { Scroller } from '../../../../ui/Scroller';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { ReviewsSummarySettings } from '../manifest';
import { EMPTY_HINT, ReviewCard, Stars } from '../parts';

/** Swipeable row of recent reviews, with the average in the heading. */
export default function Carousel({ settings, context }: LayoutProps<ReviewsSummarySettings>) {
  const { data, isLoading } = useReviewsSummary(Math.max(Number(settings.limit) || 6, 1), Number(settings.minRating) || 1);
  if (isLoading) return <div className="sf-container sf-section-pad" aria-hidden><div className="h-56" /></div>;
  if (!data?.totalCount || !data.items.length) return <EditorHint context={context} text={EMPTY_HINT} />;
  return (
    <div className="sf-container sf-section-pad">
      <div>
        <SectionHeading
          eyebrow={settings.eyebrow}
          title={settings.heading}
          subtitle={settings.subtitle}
          action={
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Stars rating={data.averageRating} /> {data.averageRating.toFixed(1)} · {data.totalCount} review{data.totalCount === 1 ? '' : 's'}
            </p>
          }
        />
      </div>
      <Scroller
        label="Customer reviews"
        itemClassName="w-[82%] @2xl:w-[46%] @5xl:w-[31%]"
        items={data.items.map(r => <ReviewCard key={r.id} review={r} showProduct={settings.showProduct} />)}
      />
    </div>
  );
}
