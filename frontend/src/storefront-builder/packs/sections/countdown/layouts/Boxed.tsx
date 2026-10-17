import type { LayoutProps } from '../../../../core/types';
import { CtaLink } from '../../../../ui/CtaLink';
import { EditorHint } from '../../../../ui/EditorHint';
import { useCountdown } from '../../../../ui/useCountdown';
import type { CountdownSettings } from '../manifest';
import { Timer } from '../Timer';

export default function Boxed({ settings, context }: LayoutProps<CountdownSettings>) {
  const parts = useCountdown(settings.endsAt);
  if (!parts.valid) return <EditorHint context={context} text="Set an end date and time for the countdown." />;
  if (parts.done && settings.hideWhenDone && context.mode === 'live') return null;
  return (
    <div className="sf-container sf-section-pad">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        {settings.eyebrow && <span className="sf-badge">{settings.eyebrow}</span>}
        <h2 className="sf-h2">{parts.done ? 'This offer has ended' : settings.heading}</h2>
        {settings.text && <p className="sf-muted">{settings.text}</p>}
        <Timer parts={parts} size="lg" />
        {!parts.done && <CtaLink label={settings.buttonLabel} link={settings.buttonLink} size="lg" />}
      </div>
    </div>
  );
}
