import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '../../../../../utils/whatsappLink';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import type { FooterSettings } from '../manifest';
import { AccordionColumn, Brand, Copyright, Payments, Social } from '../parts/Parts';
import { useFooterColumns } from '../parts/useFooter';

/** A big "join our WhatsApp updates" band (opens WhatsApp — no email list needed) above the columns. */
export default function NewsletterBand({ settings }: LayoutProps<FooterSettings>) {
  const { store } = useStorefront();
  const columns = useFooterColumns(settings);
  return (
    <div>
      {store.whatsAppNumber && settings.newsletterHeading && (
        <div data-sf-scheme="brand" className="sf-scheme sf-gradient">
          <div className="sf-container flex flex-col items-start gap-5 py-10 @3xl:flex-row @3xl:items-center @3xl:justify-between">
            <div>
              <h2 className="sf-h2">{settings.newsletterHeading}</h2>
              {settings.newsletterText && <p className="mt-2 max-w-xl opacity-85">{settings.newsletterText}</p>}
            </div>
            <a href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}! Please add me to your updates.`)} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-primary sf-btn-lg shrink-0">
              <MessageCircle className="h-5 w-5" aria-hidden /> Join on WhatsApp
            </a>
          </div>
        </div>
      )}
      <div className="sf-container grid gap-8 py-10 @3xl:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-4"><Brand settings={settings} /><Social settings={settings} /></div>
        <div className="@3xl:grid @3xl:grid-cols-3 @3xl:gap-8">{columns.map(c => <AccordionColumn key={c.id} column={c} />)}</div>
      </div>
      <div className="sf-container flex flex-col items-center justify-between gap-3 py-4 @3xl:flex-row" style={{ borderTop: '1px solid var(--sf-border)' }}>
        <Copyright settings={settings} />
        <Payments settings={settings} />
      </div>
    </div>
  );
}
