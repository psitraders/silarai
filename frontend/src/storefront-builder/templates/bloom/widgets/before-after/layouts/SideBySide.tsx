import { readImage } from '../../../../../core/smart';
import type { LayoutProps } from '../../../../../core/types';
import { CtaLink } from '../../../../../ui/CtaLink';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { SmartImage } from '../../../../../ui/SmartImage';
import type { BeforeAfterSettings } from '../manifest';

/** The two photos next to each other, labelled. */
export default function SideBySide({ settings, context }: LayoutProps<BeforeAfterSettings>) {
  if (!readImage(settings.before) || !readImage(settings.after)) return <EditorHint context={context} text="Upload a before and an after photo." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.text} align="center" />
      <div className="grid grid-cols-2 gap-2 @3xl:gap-4">
        {([['before', settings.beforeLabel], ['after', settings.afterLabel]] as const).map(([key, label]) => (
          <figure key={key}>
            <SmartImage value={settings[key]} alt={label} className="aspect-[4/5]" sizes="(min-width: 768px) 45vw, 50vw" />
            <figcaption className="mt-2 text-center text-sm font-semibold">{label}</figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-6 flex justify-center"><CtaLink label={settings.buttonLabel} link={settings.buttonLink} /></div>
    </div>
  );
}
