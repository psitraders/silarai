import type { LayoutProps } from '../../../../core/types';
import type { HeroSettings } from '../manifest';
import { SplitHero } from './Split';

export default function SplitLeft(props: LayoutProps<HeroSettings>) {
  return <SplitHero {...props} imageSide="left" />;
}
