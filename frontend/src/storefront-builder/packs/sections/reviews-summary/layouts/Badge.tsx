import { useReviewsSummary } from '../../../../core/data/hooks';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import type { ReviewsSummarySettings } from '../manifest';
import { EMPTY_HINT, Stars } from '../parts';

/** Slim trust band: average rating and review count. */
export default function Badge({ settings, context }: LayoutProps<ReviewsSummarySettings>) {
  const { data, isLoading } = useReviewsSummary(0, 1);
  if (isLoading) return <div className="sf-container h-14" aria-hidden />;
  if (!data?.totalCount) return <EditorHint context={context} text={EMPTY_HINT} />;
  return (
    <div className="sf-container py-5">
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm">
        {settings.heading && <span className="font-bold">{settings.heading}</span>}
        <Stars rating={data.averageRating} />
        <span><span className="font-bold tabular-nums">{data.averageRating.toFixed(1)}</span><span className="sf-muted"> / 5 from {data.totalCount} review{data.totalCount === 1 ? '' : 's'}</span></span>
      </p>
    </div>
  );
}
