import { CheckCircle2, Send } from 'lucide-react';
import { useId } from 'react';
import { useInquiry } from '../../../core/commerce/useInquiry';
import type { RenderContext } from '../../../core/types';
import type { EnquiryFormSettings } from './manifest';

/** The form itself (name, phone, optional email, message) — posts to the store's public inquiry endpoint. */
export function EnquiryForm({ settings, context }: { settings: EnquiryFormSettings; context: RenderContext }) {
  const form = useInquiry({ preview: context.mode !== 'live' });
  const id = useId();
  if (form.sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center" role="status">
        <CheckCircle2 className="h-10 w-10" style={{ color: 'var(--sf-success)' }} aria-hidden />
        <p className="font-semibold">{settings.successText}</p>
        <button type="button" className="sf-link text-sm font-semibold" onClick={form.reset}>Send another message</button>
      </div>
    );
  }
  return (
    <form className="grid gap-3 @xl:grid-cols-2" onSubmit={e => { e.preventDefault(); form.submit(); }} noValidate>
      <label className="block" htmlFor={`${id}-name`}>
        <span className="mb-1 block text-sm font-semibold">Name *</span>
        <input id={`${id}-name`} className="sf-input" autoComplete="name" value={form.fields.name} onChange={e => form.set('name', e.target.value)} required />
      </label>
      <label className="block" htmlFor={`${id}-phone`}>
        <span className="mb-1 block text-sm font-semibold">Phone / WhatsApp</span>
        <input id={`${id}-phone`} className="sf-input" type="tel" autoComplete="tel" value={form.fields.phone} onChange={e => form.set('phone', e.target.value)} />
      </label>
      {settings.askEmail && (
        <label className="block @xl:col-span-2" htmlFor={`${id}-email`}>
          <span className="mb-1 block text-sm font-semibold">Email</span>
          <input id={`${id}-email`} className="sf-input" type="email" autoComplete="email" value={form.fields.email} onChange={e => form.set('email', e.target.value)} />
        </label>
      )}
      <label className="block @xl:col-span-2" htmlFor={`${id}-msg`}>
        <span className="mb-1 block text-sm font-semibold">Message</span>
        <textarea id={`${id}-msg`} className="sf-input resize-y" rows={4} placeholder={settings.messagePlaceholder} value={form.fields.message} onChange={e => form.set('message', e.target.value)} />
      </label>
      {form.error && <p className="text-sm @xl:col-span-2" style={{ color: 'var(--sf-danger)' }} role="alert">{form.error}</p>}
      <div className="@xl:col-span-2">
        <button type="submit" className="sf-btn sf-btn-primary" disabled={form.busy}>
          <Send className="h-4 w-4" aria-hidden /> {form.busy ? 'Sending…' : settings.buttonLabel || 'Send message'}
        </button>
      </div>
    </form>
  );
}
