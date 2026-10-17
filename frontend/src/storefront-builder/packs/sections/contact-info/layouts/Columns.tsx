import { generateWhatsAppLink } from '../../../../../utils/whatsappLink';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import { SectionHeading } from '../../../../ui/SectionHeading';
import { mapsHref, telHref } from '../contact';
import type { ContactInfoSettings } from '../manifest';

/** Three plain columns: contact · hours · address. */
export default function Columns({ settings }: LayoutProps<ContactInfoSettings>) {
  const { store } = useStorefront();
  const hours = (settings.hours ?? []).filter(h => h.trim());
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.text} />
      <div className="grid gap-8 @3xl:grid-cols-3">
        <div>
          <h3 className="sf-h3 mb-2">Contact</h3>
          <ul className="space-y-1 sf-muted">
            {settings.phone.trim() && <li><a className="sf-link" href={telHref(settings.phone)}>{settings.phone}</a></li>}
            {settings.email.trim() && <li><a className="sf-link" href={`mailto:${settings.email.trim()}`}>{settings.email}</a></li>}
            {settings.showWhatsApp && store.whatsAppNumber && <li><a className="sf-link" href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}!`)} target="_blank" rel="noopener noreferrer">WhatsApp us</a></li>}
          </ul>
        </div>
        {!!hours.length && (
          <div>
            <h3 className="sf-h3 mb-2">Opening hours</h3>
            <ul className="space-y-1 sf-muted">{hours.map(h => <li key={h}>{h}</li>)}</ul>
          </div>
        )}
        {settings.address.trim() && (
          <div>
            <h3 className="sf-h3 mb-2">Address</h3>
            <p className="whitespace-pre-line sf-muted">{settings.address}</p>
            {settings.showDirections && <a className="sf-link mt-2 inline-block text-sm font-semibold" href={mapsHref(settings.address)} target="_blank" rel="noopener noreferrer">Get directions →</a>}
          </div>
        )}
      </div>
    </div>
  );
}
