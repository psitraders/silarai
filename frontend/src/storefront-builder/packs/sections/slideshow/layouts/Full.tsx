import type { LayoutProps } from '../../../../core/types';
import type { SlideshowSettings } from '../manifest';
import { Slides } from '../Slides';

export default function Full({ settings, blocks, context }: LayoutProps<SlideshowSettings>) {
  return <Slides settings={settings} blocks={blocks} context={context} contained={false} />;
}
