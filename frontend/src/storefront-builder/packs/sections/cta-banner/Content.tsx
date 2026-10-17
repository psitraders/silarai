import type { CSSProperties } from 'react';
import type { RenderContext } from '../../../core/types';
import { CtaLink } from '../../../ui/CtaLink';
import type { CtaBannerSettings } from './manifest';

const INHERIT: CSSProperties = { color: 'inherit', borderColor: 'color-mix(in srgb, currentColor 40%, transparent)' };

export function Content({ settings, context, align = 'center', onImage = false }: {
  settings: CtaBannerSettings;
  context: RenderContext;
  align?: 'center' | 'start';
  onImage?: boolean;
}) {
  const Heading = context.isFirst ? 'h1' : 'h2';
  return (
    <div className={`flex flex-col gap-4 ${align === 'center' ? 'items-center text-center' : ''}`}>
      {settings.eyebrow && <p className="sf-eyebrow" style={onImage ? { color: 'inherit' } : undefined}>{settings.eyebrow}</p>}
      <Heading className="sf-h2 max-w-2xl">{settings.heading}</Heading>
      {settings.text && <p className="max-w-xl opacity-85">{settings.text}</p>}
      <div className={`mt-2 flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
        <CtaLink label={settings.buttonLabel} link={settings.buttonLink} />
        <CtaLink label={settings.secondaryLabel} link={settings.secondaryLink} variant="secondary" style={INHERIT} />
      </div>
    </div>
  );
}
