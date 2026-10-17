import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import type { HeroSettings } from '../manifest';
import { HERO_HEIGHT } from '../heights';
import { HeroActions, HeroHighlights, HeroText } from '../parts';
import { useHeroText } from '../useHeroText';

/** Text beside a photo; stacks (photo first) on narrow screens. */
export function SplitHero({ settings, context, imageSide }: LayoutProps<HeroSettings> & { imageSide: 'left' | 'right' }) {
  const { heading, subheading } = useHeroText(settings);
  return (
    <div className="sf-gradient overflow-hidden">
      <div className={`sf-container grid items-center gap-8 py-10 @3xl:grid-cols-2 @3xl:gap-14 @3xl:py-16 ${HERO_HEIGHT[settings.height] ?? ''}`}>
        <div className={`flex flex-col gap-5 ${imageSide === 'left' ? '@3xl:order-2' : ''}`}>
          <HeroText settings={settings} heading={heading} subheading={subheading} isFirst={context.isFirst} />
          <HeroActions settings={settings} align="start" />
          {settings.showHighlights && <HeroHighlights align="start" />}
        </div>
        <SmartImage
          value={settings.image}
          alt=""
          eager={context.isFirst}
          sizes="(min-width: 768px) 50vw, 100vw"
          className={`aspect-[4/3] @3xl:aspect-[4/5] -order-1 @3xl:order-none ${imageSide === 'left' ? '@3xl:order-1' : ''}`}
        />
      </div>
    </div>
  );
}
