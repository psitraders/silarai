import type { LayoutProps } from '../../../../core/types';
import type { ImageWithTextSettings } from '../manifest';
import { Split } from './Split';

export default function ImageRight(props: LayoutProps<ImageWithTextSettings>) {
  return <Split {...props} side="right" />;
}
