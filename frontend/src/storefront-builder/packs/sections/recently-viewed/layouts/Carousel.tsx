import type { LayoutProps } from '../../../../core/types';
import type { RecentlyViewedSettings } from '../manifest';
import { Recent } from '../Recent';

export default function Carousel(props: LayoutProps<RecentlyViewedSettings>) {
  return <Recent {...props} layout="carousel" />;
}
