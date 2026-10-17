import { readImage } from '../../../../core/smart';
import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import type { HeroSettings } from '../manifest';
import { HERO_HEIGHT } from '../heights';
import { HeroActions, HeroHighlights, HeroText } from '../parts';
import { useHeroText } from '../useHeroText';

/** Photo hero with a dark gradient for readable text. Falls back to the scheme colour without a photo. */
export default function FullBleed({ settings, context }: LayoutProps<HeroSettings>) {
  const { heading, subheading } = useHeroText(settings);
  const hasImage = !!readImage(settings.image);

  return (
    <div className="relative isolate overflow-hidden">
      {hasImage && <SmartImage value={settings.image} alt="" eager={context.isFirst} rounded={false} fill className="-z-10" />}
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: hasImage ? 'linear-gradient(to top, rgb(0 0 0 / 0.7), rgb(0 0 0 / 0.25) 55%, rgb(0 0 0 / 0.1))' : 'var(--sf-bg)' }} />
      <div className={`sf-container flex flex-col justify-end gap-4 py-12 ${HERO_HEIGHT[settings.height] ?? HERO_HEIGHT.regular} ${hasImage ? 'text-white' : ''}`}>
        <HeroText settings={settings} heading={heading} subheading={subheading} isFirst={context.isFirst} />
        <HeroActions settings={settings} align="start" />
        {settings.showHighlights && <HeroHighlights align="start" />}
      </div>
    </div>
  );
}
