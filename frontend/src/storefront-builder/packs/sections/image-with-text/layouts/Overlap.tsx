import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import { Body } from '../Body';
import type { ImageWithTextSettings } from '../manifest';

/** A text card that overlaps the photo on wide screens (stacked on phones). */
export default function Overlap({ settings, context }: LayoutProps<ImageWithTextSettings>) {
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center @3xl:grid-cols-12">
        <SmartImage value={settings.image} alt="" eager={context.isFirst} sizes="(min-width: 768px) 60vw, 100vw" className="aspect-[4/3] @3xl:col-span-8 @3xl:col-start-1 @3xl:row-start-1" />
        <div className="sf-card relative -mt-10 mx-4 p-6 @3xl:col-span-6 @3xl:col-start-7 @3xl:row-start-1 @3xl:m-0 @3xl:p-10">
          <Body settings={settings} context={context} />
        </div>
      </div>
    </div>
  );
}
