import type { LayoutProps } from '../../../../core/types';
import { TrustIconView } from '../icons';
import type { TrustBadgesSettings } from '../manifest';
import { useTrustItems } from '../useTrustItems';

export default function Ribbon({ settings }: LayoutProps<TrustBadgesSettings>) {
  const items = useTrustItems(settings);
  if (!items.length) return null;
  return (
    <div style={{ borderBottom: '1px solid var(--sf-border)' }}>
      <ul className="sf-container flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-4 @3xl:gap-x-9">
        {items.map((item, i) => (
          <li key={`${item.icon}-${i}`} className="flex items-center gap-1.5 text-xs font-semibold sf-muted">
            <span className="sf-link inline-flex"><TrustIconView icon={item.icon} className="h-4 w-4 shrink-0" /></span>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
