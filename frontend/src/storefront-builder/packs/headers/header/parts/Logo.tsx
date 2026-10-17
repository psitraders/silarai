import { useStorefront } from '../../../../core/storefront-context';
import { SmartLinkAnchor } from '../../../../ui/SmartLinkAnchor';
import type { HeaderSettings } from '../manifest';

const IMG = { small: 'h-7 max-w-[110px]', medium: 'h-9 max-w-[150px]', large: 'h-12 max-w-[200px]' } as const;
const MARK = { small: 'h-8 w-8 text-xs', medium: 'h-9 w-9 text-sm', large: 'h-11 w-11 text-base' } as const;

/** Store logo, or an initials mark + name when there is no logo. */
export function Logo({ settings, showName = 'wide', className = '' }: { settings: HeaderSettings; showName?: 'always' | 'wide' | 'never'; className?: string }) {
  const { store, links } = useStorefront();
  const size = settings.logoSize ?? 'medium';
  return (
    <SmartLinkAnchor href={links.home()} className={`flex shrink-0 items-center gap-2 ${className}`} ariaLabel={`${store.name} home`}>
      {store.logoUrl ? (
        <img src={store.logoUrl} alt={store.name} className={`w-auto object-contain ${IMG[size]}`} />
      ) : (
        <>
          <span aria-hidden className={`flex items-center justify-center rounded-[var(--sf-radius-md)] font-bold ${MARK[size]}`} style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}>
            {store.name.slice(0, 2).toUpperCase()}
          </span>
          {showName !== 'never' && (
            <span className={`text-base font-bold ${showName === 'wide' ? 'hidden @2xl:block' : ''}`} style={{ fontFamily: 'var(--sf-font-heading)' }}>{store.name}</span>
          )}
        </>
      )}
    </SmartLinkAnchor>
  );
}
