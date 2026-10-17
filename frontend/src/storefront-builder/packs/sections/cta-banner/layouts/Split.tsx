import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import { Content } from '../Content';
import type { CtaBannerSettings } from '../manifest';

export default function Split({ settings, context }: LayoutProps<CtaBannerSettings>) {
  return (
    <div className="sf-container sf-section-pad">
      <div className="sf-card grid overflow-hidden @3xl:grid-cols-2">
        <SmartImage value={settings.image} alt="" rounded={false} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[16/10] @3xl:aspect-auto @3xl:min-h-[320px]" />
        <div className="flex items-center p-8 @3xl:p-12"><Content settings={settings} context={context} align="start" /></div>
      </div>
    </div>
  );
}
