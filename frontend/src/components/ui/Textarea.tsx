import { clsx } from 'clsx';
import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        ref={ref}
        className={clsx(
          'block w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
          error ? 'border-red-400' : 'border-slate-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
