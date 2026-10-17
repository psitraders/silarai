import { readRichText } from '../../../core/smart';
import type { RenderContext } from '../../../core/types';
import { CtaLink } from '../../../ui/CtaLink';
import { RichText } from '../../../ui/RichText';
import type { ImageWithTextSettings } from './manifest';

export function Body({ settings, context, inverted = false }: { settings: ImageWithTextSettings; context: RenderContext; inverted?: boolean }) {
  const Heading = context.isFirst ? 'h1' : 'h2';
  return (
    <div className="flex flex-col gap-4">
      {settings.eyebrow && <p className="sf-eyebrow" style={inverted ? { color: 'inherit' } : undefined}>{settings.eyebrow}</p>}
      {settings.heading && <Heading className="sf-h2">{settings.heading}</Heading>}
      <RichText html={readRichText(settings.body)} className={inverted ? 'opacity-90' : ''} />
      <div><CtaLink label={settings.buttonLabel} link={settings.buttonLink} /></div>
    </div>
  );
}
