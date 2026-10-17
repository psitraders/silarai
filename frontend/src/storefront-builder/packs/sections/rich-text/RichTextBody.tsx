import { readRichText } from '../../../core/smart';
import type { RenderContext } from '../../../core/types';
import { RichText } from '../../../ui/RichText';
import type { RichTextSettings } from './manifest';

export function RichTextBody({ settings, context, wide }: { settings: RichTextSettings; context: RenderContext; wide: boolean }) {
  const html = readRichText(settings.content);
  const center = settings.align === 'center';
  const Heading = context.isFirst ? 'h1' : 'h2';
  if (!html && !settings.heading) {
    return context.mode === 'live' ? null : <p className="text-center sf-muted">Add some text to this section.</p>;
  }
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} ${wide ? '' : 'max-w-3xl'}`}>
      {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
      {settings.heading && <Heading className="sf-h2 mb-5">{settings.heading}</Heading>}
      <RichText html={html} wide={wide} className={center ? 'mx-auto' : ''} />
    </div>
  );
}
