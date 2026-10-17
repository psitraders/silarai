import type { LayoutProps } from '../../../../core/types';
import type { DividerSettings } from '../manifest';
import { SPACE } from '../sizes';

export default function Line({ settings }: LayoutProps<DividerSettings>) {
  return (
    <div className={`sf-container flex items-center ${SPACE[settings.size] ?? SPACE.md}`}>
      <hr className="w-full border-0" style={{ borderTop: '1px solid var(--sf-border)' }} />
    </div>
  );
}
