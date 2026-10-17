import { Video } from 'lucide-react';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import type { ConciergeSettings } from '../manifest';
import { NO_NUMBER_HINT, useConciergeLink } from '../useConcierge';

/** A slim band with the invitation and a WhatsApp booking button. */
export default function Banner({ settings, context }: LayoutProps<ConciergeSettings>) {
  const href = useConciergeLink(settings);
  if (!href) return <EditorHint context={context} text={NO_NUMBER_HINT} />;
  return (
    <div className="sf-container py-10">
      <div className="flex flex-col items-start gap-5 @3xl:flex-row @3xl:items-center @3xl:justify-between">
        <div className="max-w-2xl">
          {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
          <h2 className="sf-h2">{settings.heading}</h2>
          {(settings.text || settings.hours) && <p className="mt-2 sf-muted">{[settings.text, settings.hours].filter(Boolean).join(' · ')}</p>}
        </div>
        <a href={href} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-primary shrink-0">
          <Video className="h-4 w-4" aria-hidden /> {settings.buttonLabel || 'Book a video call'}
        </a>
      </div>
    </div>
  );
}
