import type { LayoutProps } from '../../../../core/types';
import { CtaLink } from '../../../../ui/CtaLink';
import { EditorHint } from '../../../../ui/EditorHint';
import { useCountdown } from '../../../../ui/useCountdown';
import type { CountdownSettings } from '../manifest';
import { Timer } from '../Timer';

export default function Banner({ settings, context }: LayoutProps<CountdownSettings>) {
  const parts = useCountdown(settings.endsAt);
  if (!parts.valid) return <EditorHint context={context} text="Set an end date and time for the countdown." />;
  if (parts.done && settings.hideWhenDone && context.mode === 'live') return null;
  return (
    <div className="sf-container py-8 @3xl:py-10">
      <div className="flex flex-col items-start gap-6 @3xl:flex-row @3xl:items-center @3xl:justify-between">
        <div className="flex flex-col gap-2">
          {settings.eyebrow && <p className="sf-eyebrow" style={{ color: 'inherit', opacity: 0.85 }}>{settings.eyebrow}</p>}
          <h2 className="sf-h2">{parts.done ? 'This offer has ended' : settings.heading}</h2>
          {settings.text && <p className="opacity-85">{settings.text}</p>}
        </div>
        <div className="flex flex-col items-start gap-4 @3xl:items-end">
          <Timer parts={parts} />
          {!parts.done && <CtaLink label={settings.buttonLabel} link={settings.buttonLink} />}
        </div>
      </div>
    </div>
  );
}
