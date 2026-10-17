import { Clock, Video } from 'lucide-react';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SmartImage } from '../../../../../ui/SmartImage';
import type { ConciergeSettings } from '../manifest';
import { NO_NUMBER_HINT, useConciergeLink } from '../useConcierge';

/** A photo beside the invitation, with a WhatsApp booking button. */
export default function Card({ settings, context }: LayoutProps<ConciergeSettings>) {
  const href = useConciergeLink(settings);
  if (!href) return <EditorHint context={context} text={NO_NUMBER_HINT} />;
  return (
    <div className="sf-container sf-section-pad">
      <div className="sf-card grid overflow-hidden @3xl:grid-cols-2">
        <SmartImage value={settings.image} alt="" rounded={false} className="aspect-[4/3] @3xl:aspect-auto @3xl:min-h-full" sizes="(min-width: 768px) 45vw, 100vw" />
        <div className="flex flex-col justify-center gap-4 p-6 @3xl:p-12">
          {settings.eyebrow && <p className="sf-eyebrow">{settings.eyebrow}</p>}
          <h2 className="sf-h2">{settings.heading}</h2>
          {settings.text && <p className="sf-muted leading-relaxed">{settings.text}</p>}
          {settings.hours && <p className="flex items-center gap-2 text-sm font-medium"><Clock className="h-4 w-4 sf-link" aria-hidden /> {settings.hours}</p>}
          <div className="pt-2">
            <a href={href} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-primary">
              <Video className="h-4 w-4" aria-hidden /> {settings.buttonLabel || 'Book a video call'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
