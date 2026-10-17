import type { LayoutProps } from '../../../../core/types';
import type { DividerSettings } from '../manifest';
import { SPACE } from '../sizes';

export default function Space({ settings }: LayoutProps<DividerSettings>) {
  return <div aria-hidden className={SPACE[settings.size] ?? SPACE.md} />;
}
