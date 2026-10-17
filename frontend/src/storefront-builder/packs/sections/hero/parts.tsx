import { MessageCircle, RotateCcw, ShieldCheck, ShoppingBag } from 'lucide-react';
import { generateWhatsAppLink } from '../../../../utils/whatsappLink';
import { useLinkReader, useStorefront } from '../../../core/storefront-context';
import { CtaLink } from '../../../ui/CtaLink';
import { SmartLinkAnchor } from '../../../ui/SmartLinkAnchor';
import type { HeroSettings } from './manifest';

export function HeroActions({ settings, align = 'center' }: { settings: HeroSettings; align?: 'center' | 'start' }) {
  const readStoreLink = useLinkReader();
  const { store } = useStorefront();
  const href = readStoreLink(settings.primaryLink);
  return (
    <div className={`flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
      {href && settings.primaryLabel && (
        <SmartLinkAnchor href={href} className="sf-btn sf-btn-primary">
          <ShoppingBag className="h-4 w-4" aria-hidden /> {settings.primaryLabel}
        </SmartLinkAnchor>
      )}
      <CtaLink label={settings.secondaryLabel} link={settings.secondaryLink} variant="secondary" style={{ color: 'inherit', borderColor: 'color-mix(in srgb, currentColor 40%, transparent)' }} />
      {settings.showWhatsApp && store.whatsAppNumber && (
        <a
          href={generateWhatsAppLink(store.whatsAppNumber, `Hi! I'm visiting ${store.name}'s store.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="sf-btn sf-btn-secondary"
          style={{ color: 'inherit', borderColor: 'color-mix(in srgb, currentColor 40%, transparent)' }}
        >
          <MessageCircle className="h-4 w-4" aria-hidden /> Chat with us
        </a>
      )}
    </div>
  );
}

export function HeroHighlights({ align = 'center' }: { align?: 'center' | 'start' }) {
  const { store } = useStorefront();
  const items = [
    { Icon: ShieldCheck, text: 'Secure checkout' },
    ...(store.whatsAppNumber ? [{ Icon: MessageCircle, text: 'Quick replies on WhatsApp' }] : []),
    { Icon: RotateCcw, text: 'Easy returns' },
  ];
  return (
    <ul className={`flex flex-wrap gap-2 ${align === 'center' ? 'justify-center' : ''}`}>
      {items.map(({ Icon, text }) => (
        <li
          key={text}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: 'color-mix(in srgb, currentColor 10%, transparent)', border: '1px solid color-mix(in srgb, currentColor 22%, transparent)' }}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden /> {text}
        </li>
      ))}
    </ul>
  );
}

/** Eyebrow + heading (h1 only in the first section) + text — shared by all hero layouts. */
export function HeroText({ settings, heading, subheading, isFirst, align = 'start', size = 'h1' }: {
  settings: HeroSettings;
  heading: string;
  subheading: string;
  isFirst: boolean;
  align?: 'center' | 'start';
  size?: 'h1' | 'display';
}) {
  const Heading = isFirst ? 'h1' : 'h2';
  return (
    <>
      {settings.eyebrow && <p className="sf-eyebrow" style={{ color: 'inherit', opacity: 0.85 }}>{settings.eyebrow}</p>}
      <Heading
        className={`sf-h1 ${align === 'center' ? 'mx-auto' : ''} ${size === 'display' ? 'max-w-5xl' : 'max-w-3xl'}`}
        style={size === 'display' ? { fontSize: 'clamp(2.5rem, 9cqi, 6.5rem)', lineHeight: 1 } : undefined}
      >
        {heading}
      </Heading>
      {subheading && <p className={`max-w-xl text-base opacity-80 @3xl:text-lg ${align === 'center' ? 'mx-auto' : ''}`}>{subheading}</p>}
    </>
  );
}
