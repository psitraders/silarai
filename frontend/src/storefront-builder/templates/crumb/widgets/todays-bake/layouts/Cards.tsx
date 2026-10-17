import { Clock } from 'lucide-react';
import { useState } from 'react';
import { useResolvedProducts } from '../../../../../core/data/hooks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { ProductRow } from '../../../../../ui/ProductRow';
import { useCountdown } from '../../../../../ui/useCountdown';
import type { TodaysBakeSettings } from '../manifest';

/** Today's cut-off as an ISO time (null when the setting isn't "HH:MM"). */
function todayAt(hhmm: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null;
  const d = new Date();
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d.toISOString();
}

const label = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
};

/** A cut-off bar ("Order in 2 h 14 min for today") over the day's product cards. */
export default function Cards({ settings, context }: LayoutProps<TodaysBakeSettings>) {
  const { items, isLoading } = useResolvedProducts(settings.products);
  const [cutoff] = useState(() => todayAt(settings.cutoff ?? ''));
  const left = useCountdown(cutoff ?? undefined);
  if (!isLoading && !items.length) return <EditorHint context={context} text="Pick today’s products (or mark some as featured)." />;
  return (
    <div className="sf-container sf-section-pad">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-1">{settings.eyebrow}</p>}
          <h2 className="sf-h2">{settings.heading}</h2>
        </div>
        {cutoff && left.valid && (
          <p className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)' }}>
            <Clock className="h-4 w-4 sf-link" aria-hidden />
            {left.done
              ? settings.afterCutoff
              : `Order within ${left.hours ? `${left.hours} h ` : ''}${left.minutes} min for today (before ${label(settings.cutoff)})`}
          </p>
        )}
      </div>
      <ProductRow products={items} isLoading={isLoading} layout="grid" context={context} label={settings.heading || 'Today’s bake'} />
    </div>
  );
}
