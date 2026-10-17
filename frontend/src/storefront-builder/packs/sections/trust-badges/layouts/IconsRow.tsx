import type { LayoutProps } from '../../../../core/types';
import { TrustIconView } from '../icons';
import type { TrustBadgesSettings } from '../manifest';
import { useTrustItems } from '../useTrustItems';

/** Big centred icons with a label underneath. */
export default function IconsRow({ settings }: LayoutProps<TrustBadgesSettings>) {
  const items = useTrustItems(settings);
  if (!items.length) return null;
  return (
    <div className="sf-container sf-section-pad">
      <ul className="sf-gap grid grid-cols-2 text-center @3xl:grid-cols-4 @5xl:grid-cols-5">
        {items.map((item, i) => (
          <li key={`${item.icon}-${i}`} className="flex flex-col items-center gap-3">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}>
              <TrustIconView icon={item.icon} className="h-7 w-7" />
            </span>
            <span className="text-sm font-bold">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
