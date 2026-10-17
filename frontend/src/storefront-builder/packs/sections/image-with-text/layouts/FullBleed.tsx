import { readImage } from '../../../../core/smart';
import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import { Body } from '../Body';
import type { ImageWithTextSettings } from '../manifest';

/** Text over a wide photo with a readable gradient. */
export default function FullBleed({ settings, context }: LayoutProps<ImageWithTextSettings>) {
  const hasImage = !!readImage(settings.image);
  return (
    <div className="relative isolate overflow-hidden">
      <SmartImage value={settings.image} alt="" eager={context.isFirst} rounded={false} fill className="-z-10" />
      {hasImage && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(to right, rgb(0 0 0 / 0.7), rgb(0 0 0 / 0.15))' }} />}
      <div className={`sf-container flex min-h-[420px] items-center py-14 ${hasImage ? 'text-white' : ''}`}>
        <div className="max-w-lg"><Body settings={settings} context={context} inverted={hasImage} /></div>
      </div>
    </div>
  );
}
