import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { FaqSettings } from '../manifest';
import { Questions } from '../Questions';

export default function Accordion({ settings, blocks, context }: LayoutProps<FaqSettings>) {
  if (!blocks.length) return <EditorHint context={context} text="Add questions to this FAQ." />;
  return (
    <div className="sf-container sf-section-pad">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align="center" />
        <Questions blocks={blocks} />
      </div>
    </div>
  );
}
