import { blocksOf } from '../../../../core/blocks';
import { readImage } from '../../../../core/smart';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import { SmartImage } from '../../../../ui/SmartImage';
import { STEP_DEFAULTS, type TimelineSettings } from '../manifest';

/** Steps side by side along a line (swipeable on phones) — great for "how it works". */
export default function Horizontal({ settings, blocks, context }: LayoutProps<TimelineSettings>) {
  const steps = blocksOf(blocks, 'step', STEP_DEFAULTS);
  if (!steps.length) return <EditorHint context={context} text="Add steps to this timeline." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} />
      <ol className="sf-scroll-x -mx-4 flex snap-x gap-6 px-4 pb-2">
        {steps.map(({ id, settings: s }, i) => (
          <li key={id} className="relative w-[78%] shrink-0 snap-start @2xl:w-[42%] @4xl:w-[calc(25%-18px)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}>{i + 1}</span>
              <span className="h-0.5 flex-1" style={{ background: i === steps.length - 1 ? 'transparent' : 'var(--sf-border)' }} aria-hidden />
            </div>
            {readImage(s.image) && <SmartImage value={s.image} alt="" className="mb-4 aspect-[4/3]" sizes="(min-width: 768px) 25vw, 80vw" maxWidth={800} />}
            {s.label && <p className="sf-eyebrow mb-1">{s.label}</p>}
            <h3 className="font-bold">{s.title}</h3>
            {s.text && <p className="mt-1.5 whitespace-pre-line text-sm sf-muted">{s.text}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
