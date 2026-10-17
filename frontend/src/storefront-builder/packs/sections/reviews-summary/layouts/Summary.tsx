import { useReviewsSummary } from '../../../../core/data/hooks';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { ReviewsSummarySettings } from '../manifest';
import { EMPTY_HINT, RatingSummary, ReviewCard } from '../parts';

/** Average rating and star breakdown on the left, the latest review cards beside it. */
export default function Summary({ settings, context }: LayoutProps<ReviewsSummarySettings>) {
  const { data, isLoading } = useReviewsSummary(Number(settings.limit) || 0, Number(settings.minRating) || 1);
  if (isLoading) return <div className="sf-container sf-section-pad" aria-hidden><div className="h-64" /></div>;
  if (!data?.totalCount) return <EditorHint context={context} text={EMPTY_HINT} />;
  return (
    <div className="sf-container sf-section-pad">
      <div><SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} /></div>
      <div className="grid gap-8 @3xl:grid-cols-[260px_1fr]">
        <RatingSummary data={data} showDistribution={settings.showDistribution} />
        {data.items.length > 0 && (
          <ul className="sf-gap grid @xl:grid-cols-2 @5xl:grid-cols-3">
            {data.items.map(r => <li key={r.id}><ReviewCard review={r} showProduct={settings.showProduct} /></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
