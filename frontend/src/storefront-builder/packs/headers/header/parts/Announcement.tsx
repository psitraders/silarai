import { useEffect, useState, type ReactNode } from 'react';
import { SmartLinkAnchor } from '../../../../ui/SmartLinkAnchor';
import type { HeaderSettings } from '../manifest';
import { useLinkReader } from '../../../../core/storefront-context';

/** Strip above the header: static, rotating (paused for reduced motion) or moving. Uses the contrast scheme. */
export function Announcement({ settings }: { settings: HeaderSettings }) {
  const readStoreLink = useLinkReader();
  const messages = (settings.announcements ?? []).map(m => m.trim()).filter(Boolean);
  const [i, setI] = useState(0);
  const rotating = settings.announcementStyle === 'rotating' && messages.length > 1;
  useEffect(() => {
    if (!rotating || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI(n => n + 1), 4000);
    return () => clearInterval(t);
  }, [rotating]);
  if (!messages.length) return null;

  const href = readStoreLink(settings.announcementLink);
  const wrap = (content: ReactNode) =>
    href ? <SmartLinkAnchor href={href} className="block hover:underline">{content}</SmartLinkAnchor> : content;

  return (
    <div data-sf-scheme="contrast" className="sf-scheme overflow-hidden py-2 text-center text-xs font-semibold" role="note">
      {settings.announcementStyle === 'marquee' ? (
        wrap(
          <>
            <span className="sr-only">{messages.join('. ')}</span>
            <span className="sf-marquee" aria-hidden>
              {Array.from({ length: 4 }, (_, k) => <span key={k} className="mx-10">✦ {messages.join('   ✦   ')}</span>)}
            </span>
          </>,
        )
      ) : (
        <div className="sf-container" aria-live={rotating ? 'polite' : undefined}>
          {wrap(<span key={i} className={rotating ? 'sf-reveal inline-block' : ''}>{messages[rotating ? i % messages.length : 0]}</span>)}
        </div>
      )}
    </div>
  );
}
