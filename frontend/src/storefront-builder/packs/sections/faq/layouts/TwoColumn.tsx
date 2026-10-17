import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { FaqSettings } from '../manifest';
import { Questions } from '../Questions';

export default function TwoColumn({ settings, blocks, context }: LayoutProps<FaqSettings>) {
  if (!blocks.length) return <EditorHint context={context} text="Add questions to this FAQ." />;
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid gap-8 @3xl:grid-cols-[2fr_3fr] @3xl:gap-16">
        <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} />
        <Questions blocks={blocks} />
      </div>
    </div>
  );
}
