import { CheckCircle2, Loader2 } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { useInquiry } from '../../../../../core/commerce/useInquiry';
import { useStorefront } from '../../../../../core/storefront-context';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SmartImage } from '../../../../../ui/SmartImage';
import type { CustomCakeSettings } from '../manifest';

/** Photo beside the request form; the details are sent above the shopper's message. */
export default function Split({ settings, context }: LayoutProps<CustomCakeSettings>) {
  const { store } = useStorefront();
  const id = useId();
  const [occasion, setOccasion] = useState('');
  const [date, setDate] = useState('');
  const [size, setSize] = useState('');
  const [flavour, setFlavour] = useState('');
  const details = [
    'Custom cake request',
    occasion && `Occasion: ${occasion}`,
    date && `Needed on: ${date}`,
    size && `Size: ${size}`,
    settings.askFlavour && flavour.trim() && `Flavour: ${flavour.trim()}`,
  ].filter(Boolean).join('\n');
  const form = useInquiry({ details, defaultMessage: 'No extra notes.', preview: context.mode !== 'live' });

  if (store.allowPublicInquiries === false) {
    return <EditorHint context={context} text="Turn on public inquiries in Storefront settings to accept custom cake requests." />;
  }

  const occasions = (settings.occasions ?? []).filter(o => o.trim());
  const sizes = (settings.sizes ?? []).filter(s => s.trim());
  const submit = (e: FormEvent) => { e.preventDefault(); form.submit(); };
  const field = 'sf-input w-full px-3.5 py-2.5 text-base';
  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-start gap-8 @3xl:grid-cols-2 @3xl:gap-12">
        <SmartImage value={settings.image} alt="" className="aspect-[4/5] @3xl:sticky @3xl:top-[calc(var(--sf-header-h,64px)+1rem)]" sizes="(min-width: 768px) 45vw, 90vw" />
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
          <h2 className="sf-h2">{settings.heading}</h2>
          {settings.text && <p className="mt-2 sf-muted">{settings.text}</p>}
          {form.sent ? (
            <p className="mt-6 flex items-center gap-2 font-semibold" role="status">
              <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--sf-success)' }} aria-hidden /> {settings.successText}
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 grid gap-3 @xl:grid-cols-2">
              <label className="@xl:col-span-2">
                <span className="mb-1 block text-xs font-semibold">Your name *</span>
                <input required autoComplete="name" value={form.fields.name} onChange={e => form.set('name', e.target.value)} className={field} />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold">Phone (WhatsApp)</span>
                <input type="tel" autoComplete="tel" inputMode="tel" value={form.fields.phone} onChange={e => form.set('phone', e.target.value)} className={field} />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold">Email</span>
                <input type="email" autoComplete="email" value={form.fields.email} onChange={e => form.set('email', e.target.value)} className={field} />
              </label>
              {occasions.length > 0 && (
                <label>
                  <span className="mb-1 block text-xs font-semibold">Occasion</span>
                  <select value={occasion} onChange={e => setOccasion(e.target.value)} className={`${field} cursor-pointer`}>
                    <option value="">Choose…</option>
                    {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              )}
              <label>
                <span className="mb-1 block text-xs font-semibold">Date needed</span>
                <input type="date" min={minDate} value={date} onChange={e => setDate(e.target.value)} className={field} />
              </label>
              {sizes.length > 0 && (
                <label>
                  <span className="mb-1 block text-xs font-semibold">Size</span>
                  <select value={size} onChange={e => setSize(e.target.value)} className={`${field} cursor-pointer`}>
                    <option value="">Choose…</option>
                    {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              )}
              {settings.askFlavour && (
                <label>
                  <span className="mb-1 block text-xs font-semibold">Flavour</span>
                  <input value={flavour} onChange={e => setFlavour(e.target.value)} placeholder="e.g. Chocolate truffle" className={field} />
                </label>
              )}
              <label className="@xl:col-span-2">
                <span className="mb-1 block text-xs font-semibold">Design ideas and message</span>
                <textarea id={`${id}-msg`} rows={4} value={form.fields.message} onChange={e => form.set('message', e.target.value)} placeholder="Theme, colours, message on the cake…" className={field} />
              </label>
              {form.error && <p className="text-sm @xl:col-span-2" role="alert" style={{ color: 'var(--sf-danger)' }}>{form.error}</p>}
              <div className="@xl:col-span-2">
                <button type="submit" disabled={form.busy} className="sf-btn sf-btn-primary">
                  {form.busy && <Loader2 className="h-4 w-4 sf-spin" aria-hidden />} {settings.buttonLabel || 'Send request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
