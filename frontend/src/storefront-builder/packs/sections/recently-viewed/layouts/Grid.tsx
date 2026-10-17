import type { LayoutProps } from '../../../../core/types';
import type { RecentlyViewedSettings } from '../manifest';
import { Recent } from '../Recent';

export default function Grid(props: LayoutProps<RecentlyViewedSettings>) {
  return <Recent {...props} layout="grid" />;
}
