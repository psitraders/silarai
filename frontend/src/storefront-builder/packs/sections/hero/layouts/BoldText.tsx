import type { LayoutProps } from '../../../../core/types';
import type { HeroSettings } from '../manifest';
import { HERO_HEIGHT } from '../heights';
import { HeroActions, HeroHighlights, HeroText } from '../parts';
import { useHeroText } from '../useHeroText';

/** Typography-led hero: a very large headline, no image. */
export default function BoldText({ settings, context }: LayoutProps<HeroSettings>) {
  const { heading, subheading } = useHeroText(settings);
  return (
    <div className="sf-gradient sf-textured">
      <div className={`sf-container flex flex-col justify-center gap-6 py-14 ${HERO_HEIGHT[settings.height] ?? HERO_HEIGHT.regular}`}>
        <HeroText settings={settings} heading={heading} subheading={subheading} isFirst={context.isFirst} size="display" />
        <HeroActions settings={settings} align="start" />
        {settings.showHighlights && <HeroHighlights align="start" />}
      </div>
    </div>
  );
}
