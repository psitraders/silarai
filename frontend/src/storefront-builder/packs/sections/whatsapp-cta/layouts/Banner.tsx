import { CheckCircle, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '../../../../../utils/whatsappLink';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import type { WhatsAppCtaSettings } from '../manifest';

export default function Banner({ settings, context }: LayoutProps<WhatsAppCtaSettings>) {
  const { store } = useStorefront();
  if (!store.whatsAppNumber) {
    return context.mode === 'live' ? null : <div className="sf-container py-6 text-center text-sm sf-muted">Add a WhatsApp number in Settings to show this section.</div>;
  }
  const body = settings.body.trim() || `Chat directly with ${store.name} on WhatsApp — get recommendations, check availability and order instantly.`;

  return (
    <div className="sf-container sf-section-pad">
      <div
        data-sf-scheme="brand"
        className="relative overflow-hidden rounded-[var(--sf-radius-lg)] p-8 @3xl:p-10"
        style={{ background: 'linear-gradient(135deg, var(--sf-bg) 0%, var(--sf-gradient-to) 100%)', color: 'var(--sf-text)' }}
      >
        <div aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full" style={{ background: 'color-mix(in srgb, var(--sf-text) 10%, transparent)' }} />
        <div className="relative flex flex-col items-center gap-8 @3xl:flex-row">
          <div className="flex-1 text-center @3xl:text-left">
            {settings.badge && (
              <p className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: 'color-mix(in srgb, var(--sf-text) 16%, transparent)' }}>
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" aria-hidden /> {settings.badge}
              </p>
            )}
            <h2 className="sf-h2 mb-3">{settings.heading}</h2>
            <p className="max-w-md opacity-85">{body}</p>
            {!!settings.points?.length && (
              <ul className="mt-5 flex flex-wrap justify-center gap-4 @3xl:justify-start">
                {settings.points.filter(Boolean).map(p => (
                  <li key={p} className="flex items-center gap-1.5 text-sm font-semibold opacity-90">
                    <CheckCircle className="h-4 w-4" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <a
            href={generateWhatsAppLink(store.whatsAppNumber, settings.message || `Hi ${store.name}!`)}
            target="_blank"
            rel="noopener noreferrer"
            className="sf-btn sf-btn-primary shrink-0 px-8 py-4 text-base"
          >
            <MessageCircle className="h-5 w-5" aria-hidden /> {settings.buttonLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
