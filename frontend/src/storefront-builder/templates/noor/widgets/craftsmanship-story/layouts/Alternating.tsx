import { blocksOf } from '../../../../../core/blocks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { SmartImage } from '../../../../../ui/SmartImage';
import { CRAFT_STEP_DEFAULTS, type CraftsmanshipSettings } from '../manifest';

/** One row per step: photo and text, swapping sides each row. */
export default function Alternating({ settings, blocks, context }: LayoutProps<CraftsmanshipSettings>) {
  const steps = blocksOf(blocks, 'step', CRAFT_STEP_DEFAULTS);
  if (!steps.length) return <EditorHint context={context} text="Add the steps of how your pieces are made." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align="center" />
      <ol className="space-y-12 @3xl:space-y-16">
        {steps.map(({ id, settings: s }, i) => (
          <li key={id} className="grid items-center gap-6 @3xl:grid-cols-2 @3xl:gap-12">
            <SmartImage value={s.image} alt="" className={`aspect-[4/3] ${i % 2 ? '@3xl:order-2' : ''}`} sizes="(min-width: 768px) 45vw, 90vw" />
            <div>
              <p className="sf-eyebrow mb-2">Step {i + 1}</p>
              <h3 className="sf-h2">{s.title}</h3>
              {s.text && <p className="mt-3 max-w-prose leading-relaxed sf-muted">{s.text}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
