import { readImage } from '../../../../core/smart';
import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import { Content } from '../Content';
import type { CtaBannerSettings } from '../manifest';

export default function Image({ settings, context }: LayoutProps<CtaBannerSettings>) {
  const hasImage = !!readImage(settings.image);
  return (
    <div className="relative isolate overflow-hidden">
      <SmartImage value={settings.image} alt="" eager={context.isFirst} rounded={false} fill className="-z-10" />
      {hasImage && <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />}
      <div className={`sf-container py-20 @3xl:py-28 ${hasImage ? 'text-white' : ''}`}>
        <Content settings={settings} context={context} onImage={hasImage} />
      </div>
    </div>
  );
}
