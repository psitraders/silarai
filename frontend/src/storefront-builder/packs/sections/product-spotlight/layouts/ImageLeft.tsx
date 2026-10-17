import type { LayoutProps } from '../../../../core/types';
import type { ProductSpotlightSettings } from '../manifest';
import { Spotlight } from './Spotlight';

export default function ImageLeft(props: LayoutProps<ProductSpotlightSettings>) {
  return <Spotlight {...props} side="left" />;
}
