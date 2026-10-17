import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import { Body } from '../Body';
import { RATIO } from '../ratio';
import type { ImageWithTextSettings } from '../manifest';

export function Split({ settings, context, side }: LayoutProps<ImageWithTextSettings> & { side: 'left' | 'right' }) {
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-16">
        <SmartImage value={settings.image} alt="" eager={context.isFirst} sizes="(min-width: 768px) 50vw, 100vw" className={`${RATIO[settings.imageRatio] ?? RATIO.portrait} ${side === 'right' ? '@3xl:order-2' : ''}`} />
        <Body settings={settings} context={context} />
      </div>
    </div>
  );
}
