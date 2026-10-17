import type { LayoutProps } from '../../../../core/types';
import type { DividerSettings } from '../manifest';
import { SPACE } from '../sizes';

export default function Dots({ settings }: LayoutProps<DividerSettings>) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-3 ${SPACE[settings.size] ?? SPACE.md}`}>
      {[0, 1, 2].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--sf-link)' }} />)}
    </div>
  );
}
