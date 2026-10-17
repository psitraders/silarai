import { readRichText } from '../../../../core/smart';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { RichText } from '../../../../ui/RichText';
import type { RichTextSettings } from '../manifest';

/** Heading on the left, text on the right (stacks on phones). */
export default function TwoColumn({ settings, context }: LayoutProps<RichTextSettings>) {
  const html = readRichText(settings.content);
  const Heading = context.isFirst ? 'h1' : 'h2';
  if (!html && !settings.heading) return <EditorHint context={context} text="Add a heading and some text to this section." />;
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid gap-6 @3xl:grid-cols-[2fr_3fr] @3xl:gap-16">
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
          {settings.heading && <Heading className="sf-h2">{settings.heading}</Heading>}
        </div>
        <RichText html={html} />
      </div>
    </div>
  );
}
