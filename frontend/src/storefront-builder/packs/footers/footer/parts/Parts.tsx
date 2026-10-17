import { ChevronDown, Clock, Lock, Mail, MapPin, Phone, RotateCcw, Truck } from 'lucide-react';
import type { JSX, ReactNode } from 'react';
import { generateWhatsAppLink } from '../../../../../utils/whatsappLink';
import { useStorefront } from '../../../../core/storefront-context';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '../../../../ui/brand-icons';
import { SmartLinkAnchor } from '../../../../ui/SmartLinkAnchor';
import type { FooterSettings } from '../manifest';
import type { FooterColumn, FooterLink } from './useFooter';
import { useAbout } from './useFooter';

export function Brand({ settings, size = 'md' }: { settings: FooterSettings; size?: 'md' | 'lg' }) {
  const { store } = useStorefront();
  const about = useAbout(settings);
  return (
    <div>
      {store.logoUrl ? (
        <img src={store.logoUrl} alt={store.name} className={`mb-3 w-auto object-contain ${size === 'lg' ? 'h-12 max-w-[200px]' : 'h-10 max-w-[160px]'}`} />
      ) : (
        <p className={`mb-2 font-bold ${size === 'lg' ? 'text-2xl' : 'text-lg'}`} style={{ fontFamily: 'var(--sf-font-heading)' }}>{store.name}</p>
      )}
      {about && <p className="max-w-sm text-sm leading-relaxed sf-muted">{about}</p>}
      {settings.madeIn && <p className="mt-3 text-xs font-semibold">{settings.madeIn}</p>}
    </div>
  );
}

export function LinkItem({ link, className = 'sf-muted hover:underline' }: { link: FooterLink; className?: string }) {
  if (link.onClick) return <button type="button" onClick={link.onClick} className={`text-left ${className}`}>{link.label}</button>;
  return <SmartLinkAnchor href={link.href ?? '#'} className={className}>{link.label}</SmartLinkAnchor>;
}

export function Column({ column }: { column: FooterColumn }) {
  return (
    <nav aria-label={column.title}>
      <h2 className="mb-3 text-sm font-semibold">{column.title}</h2>
      <ul className="space-y-2 text-sm">
        {column.links.map(l => <li key={l.id}><LinkItem link={l} /></li>)}
      </ul>
    </nav>
  );
}

/** Columns on wide screens; tap-to-open accordions on phones (native <details>). */
export function AccordionColumn({ column, alwaysAccordion = false }: { column: FooterColumn; alwaysAccordion?: boolean }) {
  return (
    <>
      <details className={`group ${alwaysAccordion ? '' : '@3xl:hidden'}`} style={{ borderBottom: '1px solid var(--sf-border)' }}>
        <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          {column.title}
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <ul className="space-y-2 pb-4 text-sm">{column.links.map(l => <li key={l.id}><LinkItem link={l} /></li>)}</ul>
      </details>
      {!alwaysAccordion && <div className="hidden @3xl:block"><Column column={column} /></div>}
    </>
  );
}

export function Social({ settings, className = '' }: { settings: FooterSettings; className?: string }) {
  const { store } = useStorefront();
  if (!settings.showSocial) return null;
  const items = [
    store.whatsAppNumber && { label: 'WhatsApp', href: generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}!`), Icon: WhatsAppIcon },
    store.instagramHandle && { label: 'Instagram', href: `https://instagram.com/${store.instagramHandle.replace('@', '')}`, Icon: InstagramIcon },
    store.facebookPageUrl && { label: 'Facebook', href: store.facebookPageUrl, Icon: FacebookIcon },
  ].filter(Boolean) as { label: string; href: string; Icon: (p: { className?: string }) => JSX.Element }[];
  if (!items.length) return null;
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {items.map(({ label, href, Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="sf-icon-btn" style={{ border: '1px solid var(--sf-border)' }}>
            <Icon className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Payment methods as text chips (no third-party logos). */
export function Payments({ settings, className = '' }: { settings: FooterSettings; className?: string }) {
  const { store } = useStorefront();
  if (!settings.showPayments) return null;
  const methods = ['UPI', ...(store.razorpayEnabled ? ['Cards', 'Net banking'] : []), 'Cash on delivery'];
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Payment methods">
      {methods.map(m => (
        <li key={m} className="rounded-[var(--sf-radius-sm)] px-2 py-1 text-[11px] font-semibold sf-muted" style={{ border: '1px solid var(--sf-border)' }}>{m}</li>
      ))}
    </ul>
  );
}

export function TrustStrip({ settings }: { settings: FooterSettings }) {
  const { store } = useStorefront();
  if (!settings.showTrustStrip) return null;
  const trust = [
    { Icon: Truck, text: 'Fast delivery' },
    { Icon: Lock, text: 'Secure checkout' },
    { Icon: RotateCcw, text: 'Easy returns' },
    ...(store.whatsAppNumber ? [{ Icon: WhatsAppIcon, text: 'WhatsApp support' }] : []),
  ];
  return (
    <div className="py-6" style={{ borderBottom: '1px solid var(--sf-border)' }}>
      <ul className="sf-container grid grid-cols-2 gap-4 @3xl:grid-cols-4">
        {trust.map(({ Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5 text-xs font-semibold sf-muted">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--sf-radius-sm)] sf-link" style={{ background: 'color-mix(in srgb, var(--sf-link) 14%, transparent)' }}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Contact({ settings }: { settings: FooterSettings }) {
  const { store } = useStorefront();
  const hours = settings.contactHours.filter(h => h.trim());
  const rows = [
    settings.contactAddress.trim() && { Icon: MapPin, content: <span className="whitespace-pre-line">{settings.contactAddress}</span> },
    settings.contactPhone.trim() && { Icon: Phone, content: <a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`} className="hover:underline">{settings.contactPhone}</a> },
    settings.contactEmail.trim() && { Icon: Mail, content: <a href={`mailto:${settings.contactEmail.trim()}`} className="hover:underline">{settings.contactEmail}</a> },
    store.whatsAppNumber && { Icon: WhatsAppIcon, content: <a href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}!`)} target="_blank" rel="noopener noreferrer" className="hover:underline">{store.whatsAppNumber}</a> },
    hours.length > 0 && { Icon: Clock, content: <span>{hours.map(h => <span key={h} className="block">{h}</span>)}</span> },
  ].filter(Boolean) as { Icon: (p: { className?: string }) => ReactNode; content: ReactNode }[];
  if (!rows.length) return null;
  return (
    <ul className="space-y-3 text-sm sf-muted">
      {rows.map(({ Icon, content }, i) => (
        <li key={i} className="flex gap-2.5"><Icon className="mt-0.5 h-4 w-4 shrink-0" />{content}</li>
      ))}
    </ul>
  );
}

export function Copyright({ settings, className = '' }: { settings: FooterSettings; className?: string }) {
  const { store } = useStorefront();
  const year = new Date().getFullYear();
  return (
    <p className={`text-xs sf-muted ${className}`}>
      {settings.copyright.trim() || `© ${year} ${store.name}.`}
      {!store.allowsCustomBranding && <> Powered by <span className="font-semibold">Silarai</span></>}
    </p>
  );
}
