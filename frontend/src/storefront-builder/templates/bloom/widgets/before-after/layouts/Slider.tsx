import { useId, useState } from 'react';
import { readImage } from '../../../../../core/smart';
import type { LayoutProps } from '../../../../../core/types';
import { CtaLink } from '../../../../../ui/CtaLink';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SmartImage } from '../../../../../ui/SmartImage';
import type { BeforeAfterSettings } from '../manifest';

/** The after photo over the before photo, revealed by a range slider (keyboard and touch friendly). */
export default function Slider({ settings, context }: LayoutProps<BeforeAfterSettings>) {
  const id = useId();
  const [pos, setPos] = useState(50);
  if (!readImage(settings.before) || !readImage(settings.after)) return <EditorHint context={context} text="Upload a before and an after photo." />;
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center gap-8 @3xl:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--sf-img-radius)] @3xl:aspect-[4/3]">
            <SmartImage value={settings.before} alt={settings.beforeLabel || 'Before'} rounded={false} fill />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
              <SmartImage value={settings.after} alt={settings.afterLabel || 'After'} rounded={false} fill />
            </div>
            <span aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5" style={{ left: `${pos}%`, background: 'var(--sf-surface)' }} />
            <span className="sf-badge absolute left-3 top-3">{settings.beforeLabel}</span>
            <span className="sf-badge absolute right-3 top-3">{settings.afterLabel}</span>
          </div>
          <label htmlFor={id} className="sr-only">Move to compare {settings.beforeLabel} and {settings.afterLabel}</label>
          <input id={id} type="range" min={0} max={100} value={pos} onChange={e => setPos(Number(e.target.value))} className="mt-3 w-full cursor-pointer" style={{ accentColor: 'var(--sf-button)' }} />
        </div>
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
          {settings.heading && <h2 className="sf-h2">{settings.heading}</h2>}
          {settings.text && <p className="mt-3 sf-muted">{settings.text}</p>}
          <CtaLink label={settings.buttonLabel} link={settings.buttonLink} className="mt-5" />
        </div>
      </div>
    </div>
  );
}
