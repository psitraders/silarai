import { CalendarClock } from 'lucide-react';
import { useState } from 'react';
import type { LayoutProps } from '../../../../../core/types';
import { CtaLink } from '../../../../../ui/CtaLink';
import { EditorHint } from '../../../../../ui/EditorHint';
import type { PreOrderSettings } from '../manifest';

/** Heading, order-by date and a button in one band. */
export default function Banner({ settings, context }: LayoutProps<PreOrderSettings>) {
  const [now] = useState(() => Date.now());
  const end = settings.orderBy ? Date.parse(settings.orderBy) : NaN;
  const hasDate = !Number.isNaN(end);
  if (hasDate && end < now && settings.hideAfter !== false) {
    return context.mode === 'live' ? null : <EditorHint context={context} text="The order-by date has passed — set a new date to show this banner again." />;
  }
  return (
    <div className="sf-container py-10">
      <div className="flex flex-col items-start gap-5 @3xl:flex-row @3xl:items-center @3xl:justify-between">
        <div className="max-w-2xl">
          {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
          <h2 className="sf-h2">{settings.heading}</h2>
          {settings.text && <p className="mt-2 opacity-90">{settings.text}</p>}
          {hasDate && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="h-4 w-4" aria-hidden />
              Order by {new Date(end).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>
        <CtaLink label={settings.buttonLabel} link={settings.buttonLink} size="lg" className="shrink-0" />
      </div>
    </div>
  );
}
