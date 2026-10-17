import { blocksOf } from '../../../../core/blocks';
import { readImage } from '../../../../core/smart';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import { SmartImage } from '../../../../ui/SmartImage';
import { STEP_DEFAULTS, type TimelineSettings } from '../manifest';

/** A line down the page with a dot per step; text alternates sides on wide screens. */
export default function Vertical({ settings, blocks, context }: LayoutProps<TimelineSettings>) {
  const steps = blocksOf(blocks, 'step', STEP_DEFAULTS);
  if (!steps.length) return <EditorHint context={context} text="Add steps to this timeline." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align="center" />
      <ol className="relative mx-auto max-w-4xl">
        <span className="absolute bottom-0 left-4 top-0 w-0.5 @3xl:left-1/2 @3xl:-translate-x-1/2" style={{ background: 'var(--sf-border)' }} aria-hidden />
        {steps.map(({ id, settings: s }, i) => (
          <li key={id} className="relative grid gap-4 pb-10 pl-12 last:pb-0 @3xl:grid-cols-2 @3xl:gap-16 @3xl:pl-0">
            <span className="absolute left-4 top-1.5 h-4 w-4 -translate-x-1/2 rounded-full @3xl:left-1/2" style={{ background: 'var(--sf-button)', boxShadow: '0 0 0 4px var(--sf-bg)' }} aria-hidden />
            <div className={i % 2 ? '@3xl:order-2' : '@3xl:text-right'}>
              {s.label && <p className="sf-eyebrow mb-1">{s.label}</p>}
              <h3 className="sf-h3 font-bold">{s.title}</h3>
              {s.text && <p className="mt-2 whitespace-pre-line sf-muted">{s.text}</p>}
            </div>
            {readImage(s.image) ? <SmartImage value={s.image} alt="" className="aspect-[4/3]" sizes="(min-width: 768px) 40vw, 100vw" maxWidth={1200} /> : <span className="hidden @3xl:block" aria-hidden />}
          </li>
        ))}
      </ol>
    </div>
  );
}
