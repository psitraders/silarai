import type { LayoutProps } from '../../../../core/types';
import type { DividerSettings } from '../manifest';
import { SPACE } from '../sizes';

/** A wave in the section's text colour at low opacity, so it suits every scheme. */
export default function Wave({ settings }: LayoutProps<DividerSettings>) {
  return (
    <div aria-hidden className={`relative overflow-hidden ${SPACE[settings.size] ?? SPACE.md}`}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 top-1/2 h-10 w-full -translate-y-1/2" style={{ color: 'var(--sf-link)' }}>
        <path d="M0 40 C 240 0 480 80 720 40 S 1200 0 1440 40" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
