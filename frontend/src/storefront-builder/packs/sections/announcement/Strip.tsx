import type { ReactNode } from 'react';
import { SmartLinkAnchor } from '../../../ui/SmartLinkAnchor';
import type { AnnouncementSettings } from './manifest';
import { useLinkReader } from '../../../core/storefront-context';

export function Strip({ settings, children }: { settings: AnnouncementSettings; children: ReactNode }) {
  const readStoreLink = useLinkReader();
  const href = readStoreLink(settings.link);
  const cls = `block text-center font-semibold ${settings.size === 'small' ? 'py-1.5 text-xs' : 'py-2.5 text-sm'}`;
  return (
    <div role="note" className="overflow-hidden">
      {href ? <SmartLinkAnchor href={href} className={`${cls} hover:underline`}>{children}</SmartLinkAnchor> : <div className={cls}>{children}</div>}
    </div>
  );
}
