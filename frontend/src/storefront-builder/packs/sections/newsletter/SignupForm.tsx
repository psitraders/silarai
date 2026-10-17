import { Check, Loader2 } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { useNewsletterSignup } from '../../../core/data/hooks';
import type { RenderContext } from '../../../core/types';
import type { NewsletterSettings } from './manifest';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Email (and optional name) form with inline validation, loading, success and retry states. */
export function SignupForm({ settings, context, stacked }: { settings: NewsletterSettings; context: RenderContext; stacked: boolean }) {
  const id = useId();
  const signup = useNewsletterSignup(context.mode === 'live');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (signup.isSuccess) {
    return (
      <p className="flex items-center gap-2 font-semibold" role="status">
        <Check className="h-5 w-5" style={{ color: 'var(--sf-success)' }} aria-hidden /> {settings.successText || 'Thank you for subscribing!'}
      </p>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL.test(value)) { setError('Enter an email address like name@example.com.'); return; }
    setError(null);
    signup.mutate({ email: value, name: settings.askName ? name.trim() || undefined : undefined });
  };

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className={`flex gap-2 ${stacked ? 'flex-col' : 'flex-col @xl:flex-row @xl:items-end'}`}>
        {settings.askName && (
          <label className="flex-1">
            <span className="mb-1 block text-xs font-semibold">Name</span>
            <input type="text" autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} className="sf-input w-full px-3.5 py-2.5 text-base" />
          </label>
        )}
        <label className="flex-[2]">
          <span className="mb-1 block text-xs font-semibold">Email</span>
          <input
            type="email" inputMode="email" autoComplete="email" required value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => { if (email.trim() && !EMAIL.test(email.trim())) setError('Enter an email address like name@example.com.'); }}
            aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
            placeholder="name@example.com"
            className="sf-input w-full px-3.5 py-2.5 text-base"
          />
        </label>
        <button type="submit" disabled={signup.isPending} className="sf-btn sf-btn-primary shrink-0">
          {signup.isPending && <Loader2 className="h-4 w-4 sf-spin" aria-hidden />} {settings.buttonLabel || 'Subscribe'}
        </button>
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm" style={{ color: 'var(--sf-danger)' }}>{error}</p>}
      {signup.isError && <p className="mt-1.5 text-sm" role="alert" style={{ color: 'var(--sf-danger)' }}>That didn’t go through. Please try again.</p>}
      {settings.note && <p className="mt-2 text-xs sf-muted">{settings.note}</p>}
    </form>
  );
}
