import { blocksOf } from '../../../../../core/blocks';
import { readImage } from '../../../../../core/smart';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { SmartImage } from '../../../../../ui/SmartImage';
import { CRAFT_STEP_DEFAULTS, type CraftsmanshipSettings } from '../manifest';

/** Numbered steps in a row joined by a fine rule; a vertical list on phones. */
export default function Steps({ settings, blocks, context }: LayoutProps<CraftsmanshipSettings>) {
  const steps = blocksOf(blocks, 'step', CRAFT_STEP_DEFAULTS);
  if (!steps.length) return <EditorHint context={context} text="Add the steps of how your pieces are made." />;
  const cols = steps.length >= 4 ? '@4xl:grid-cols-4' : steps.length === 3 ? '@4xl:grid-cols-3' : '@4xl:grid-cols-2';
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align="center" />
      <ol className={`grid gap-8 @xl:grid-cols-2 ${cols}`}>
        {steps.map(({ id, settings: s }, i) => (
          <li key={id} className="flex flex-col gap-3">
            {readImage(s.image) && <SmartImage value={s.image} alt="" className="aspect-[4/3]" sizes="(min-width: 1024px) 25vw, 90vw" />}
            <div className="flex items-center gap-3">
              <span className="sf-h3 tabular-nums" style={{ color: 'var(--sf-link)' }}>{String(i + 1).padStart(2, '0')}</span>
              <span aria-hidden className="h-px flex-1" style={{ background: 'var(--sf-border)' }} />
            </div>
            <h3 className="sf-h3">{s.title}</h3>
            {s.text && <p className="text-sm leading-relaxed sf-muted">{s.text}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
