/** Small dashboard-styled controls for the editor panels (design.md §8 sizes, --rc-* brand). */
import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

export function FieldLabel({ htmlFor, children, helper }: { htmlFor?: string; children: ReactNode; helper?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">{children}</label>
      {helper && <p className="mt-0.5 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

export const INPUT = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 placeholder-slate-400 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)] sm:text-sm';

export function Segmented<T extends string | number>({ value, options, onChange, label, size = 'md' }: {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (value: T) => void;
  label: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex w-full rounded-xl bg-slate-100 p-1">
      {options.map(o => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg px-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] ${size === 'sm' ? 'min-h-8 text-xs' : 'min-h-9 text-sm'} ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ checked, onChange, label, helper }: { checked: boolean; onChange: (v: boolean) => void; label: string; helper?: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-slate-700">{label}</label>
        {helper && <p className="mt-0.5 text-xs text-slate-500">{helper}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] focus-visible:ring-offset-2 ${checked ? 'theme-btn' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

/** Collapsible group of controls. */
export function Group({ title, children, defaultOpen = true, aside }: { title: string; children: ReactNode; defaultOpen?: boolean; aside?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="border-b border-slate-100 last:border-b-0">
      <div className="flex items-center">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)} className="flex flex-1 cursor-pointer items-center justify-between gap-2 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900">
          {title}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        {aside && <div className="pr-3">{aside}</div>}
      </div>
      {open && <div id={id} className="space-y-4 px-4 pb-4">{children}</div>}
    </section>
  );
}

export function IconButton({ label, onClick, children, disabled, tone = 'default', className = '' }: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] disabled:cursor-not-allowed disabled:opacity-30 ${tone === 'danger' ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-slate-100 hover:text-slate-900'} ${className}`}
    >
      {children}
    </button>
  );
}
