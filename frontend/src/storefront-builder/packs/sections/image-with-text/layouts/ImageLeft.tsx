import type { LayoutProps } from '../../../../core/types';
import type { ImageWithTextSettings } from '../manifest';
import { Split } from './Split';

export default function ImageLeft(props: LayoutProps<ImageWithTextSettings>) {
  return <Split {...props} side="left" />;
}
