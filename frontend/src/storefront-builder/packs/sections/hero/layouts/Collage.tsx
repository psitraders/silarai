import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import type { HeroSettings } from '../manifest';
import { HeroActions, HeroHighlights, HeroText } from '../parts';
import { useHeroText } from '../useHeroText';

/** Text with a three-photo collage (one tall, two stacked). */
export default function Collage({ settings, context }: LayoutProps<HeroSettings>) {
  const { heading, subheading } = useHeroText(settings);
  return (
    <div className="sf-gradient">
      <div className="sf-container grid items-center gap-8 py-10 @3xl:grid-cols-[5fr_6fr] @3xl:gap-12 @3xl:py-16">
        <div className="flex flex-col gap-5">
          <HeroText settings={settings} heading={heading} subheading={subheading} isFirst={context.isFirst} />
          <HeroActions settings={settings} align="start" />
          {settings.showHighlights && <HeroHighlights align="start" />}
        </div>
        <div className="grid grid-cols-[3fr_2fr] grid-rows-2 gap-3 @3xl:gap-4">
          <SmartImage value={settings.image} alt="" eager={context.isFirst} sizes="(min-width: 768px) 30vw, 60vw" className="row-span-2 aspect-[3/4] h-full" />
          <SmartImage value={settings.image2} alt="" sizes="(min-width: 768px) 20vw, 40vw" className="aspect-square h-full" />
          <SmartImage value={settings.image3} alt="" sizes="(min-width: 768px) 20vw, 40vw" className="aspect-square h-full" />
        </div>
      </div>
    </div>
  );
}
