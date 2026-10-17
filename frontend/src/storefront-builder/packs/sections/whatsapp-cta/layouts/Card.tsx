import { CheckCircle, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '../../../../../utils/whatsappLink';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import type { WhatsAppCtaSettings } from '../manifest';

/** A centred card with a badge, ticks and a big WhatsApp button. */
export default function Card({ settings, context }: LayoutProps<WhatsAppCtaSettings>) {
  const { store } = useStorefront();
  if (!store.whatsAppNumber) return <EditorHint context={context} text="Add a WhatsApp number in Settings to show this section." />;
  const body = settings.body.trim() || `Chat directly with ${store.name} on WhatsApp.`;
  return (
    <div className="sf-container sf-section-pad">
      <div className="sf-card mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center @3xl:p-10">
        {settings.badge && <span className="sf-badge">{settings.badge}</span>}
        <h2 className="sf-h2">{settings.heading}</h2>
        <p className="sf-muted">{body}</p>
        {!!settings.points?.length && (
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {settings.points.filter(Boolean).map(p => (
              <li key={p} className="flex items-center gap-1.5 text-sm font-semibold">
                <CheckCircle className="h-4 w-4 sf-link" aria-hidden /> {p}
              </li>
            ))}
          </ul>
        )}
        <a href={generateWhatsAppLink(store.whatsAppNumber, settings.message || `Hi ${store.name}!`)} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-primary sf-btn-lg mt-2">
          <MessageCircle className="h-5 w-5" aria-hidden /> {settings.buttonLabel}
        </a>
      </div>
    </div>
  );
}
