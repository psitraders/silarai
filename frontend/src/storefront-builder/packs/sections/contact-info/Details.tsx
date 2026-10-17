import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { generateWhatsAppLink } from '../../../../utils/whatsappLink';
import { useStorefront } from '../../../core/storefront-context';
import { mapsHref, telHref } from './contact';
import type { ContactInfoSettings } from './manifest';

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full sf-link" style={{ background: 'color-mix(in srgb, var(--sf-link) 12%, transparent)' }}>{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide sf-muted">{label}</p>
        <div className="mt-0.5 break-words">{children}</div>
      </div>
    </div>
  );
}

export function ContactRows({ settings }: { settings: ContactInfoSettings }) {
  const hours = (settings.hours ?? []).filter(h => h.trim());
  return (
    <div className="flex flex-col gap-5">
      {settings.address.trim() && <Row icon={<MapPin className="h-4 w-4" />} label="Address"><p className="whitespace-pre-line">{settings.address}</p></Row>}
      {settings.phone.trim() && <Row icon={<Phone className="h-4 w-4" />} label="Phone"><a href={telHref(settings.phone)} className="sf-link">{settings.phone}</a></Row>}
      {settings.email.trim() && <Row icon={<Mail className="h-4 w-4" />} label="Email"><a href={`mailto:${settings.email.trim()}`} className="sf-link">{settings.email}</a></Row>}
      {!!hours.length && (
        <Row icon={<Clock className="h-4 w-4" />} label="Opening hours">
          <ul>{hours.map(h => <li key={h}>{h}</li>)}</ul>
        </Row>
      )}
    </div>
  );
}

export function ContactActions({ settings }: { settings: ContactInfoSettings }) {
  const { store } = useStorefront();
  return (
    <div className="flex flex-wrap gap-3">
      {settings.showWhatsApp && store.whatsAppNumber && (
        <a href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}!`)} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-primary">
          <MessageCircle className="h-4 w-4" aria-hidden /> Chat on WhatsApp
        </a>
      )}
      {settings.showDirections && settings.address.trim() && (
        <a href={mapsHref(settings.address)} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-secondary">
          <Navigation className="h-4 w-4" aria-hidden /> Get directions
        </a>
      )}
    </div>
  );
}
