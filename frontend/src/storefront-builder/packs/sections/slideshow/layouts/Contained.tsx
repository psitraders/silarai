import type { LayoutProps } from '../../../../core/types';
import type { SlideshowSettings } from '../manifest';
import { Slides } from '../Slides';

export default function Contained({ settings, blocks, context }: LayoutProps<SlideshowSettings>) {
  return (
    <div className="sf-container py-6 @3xl:py-10">
      <Slides settings={settings} blocks={blocks} context={context} contained />
    </div>
  );
}
