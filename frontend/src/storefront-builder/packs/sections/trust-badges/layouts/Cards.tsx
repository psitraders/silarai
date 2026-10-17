import type { LayoutProps } from '../../../../core/types';
import { TrustIconView } from '../icons';
import type { TrustBadgesSettings } from '../manifest';
import { useTrustItems } from '../useTrustItems';

export default function Cards({ settings }: LayoutProps<TrustBadgesSettings>) {
  const items = useTrustItems(settings);
  if (!items.length) return null;
  return (
    <div className="sf-container sf-section-pad">
      <ul className="grid grid-cols-2 gap-3 @3xl:grid-cols-4 @5xl:grid-cols-5">
        {items.map((item, i) => (
          <li key={`${item.icon}-${i}`} className="sf-card flex items-center gap-3 p-4">
            <span
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full sf-link"
              style={{ background: 'color-mix(in srgb, var(--sf-link) 12%, transparent)' }}
            >
              <TrustIconView icon={item.icon} className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
