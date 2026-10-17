import { Navigation } from 'lucide-react';
import type { LayoutProps } from '../../../../core/types';
import type { FooterSettings } from '../manifest';
import { Brand, Column, Contact, Copyright, Payments, Social } from '../parts/Parts';
import { useFooterColumns } from '../parts/useFooter';

/** A contact card (address, hours, phone, directions) beside the link columns. */
export default function ContactCard({ settings }: LayoutProps<FooterSettings>) {
  const columns = useFooterColumns(settings);
  const address = settings.contactAddress.trim();
  return (
    <div>
      <div className="sf-container grid gap-8 py-12 @3xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @3xl:gap-14">
        <div className="sf-card flex flex-col gap-5 p-6">
          <Brand settings={settings} />
          <Contact settings={settings} />
          {address && (
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-primary self-start">
              <Navigation className="h-4 w-4" aria-hidden /> Get directions
            </a>
          )}
        </div>
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-8">{columns.map(c => <Column key={c.id} column={c} />)}</div>
          <Social settings={settings} />
        </div>
      </div>
      <div className="sf-container flex flex-col items-center justify-between gap-3 py-4 @3xl:flex-row" style={{ borderTop: '1px solid var(--sf-border)' }}>
        <Copyright settings={settings} />
        <Payments settings={settings} />
      </div>
    </div>
  );
}
