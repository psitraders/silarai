import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from './toastStore';

/** One polite toast at a time, 5 s, never steals focus (design.md §9). */
export function ToastHost() {
  const { toast, hide } = useToast();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, 5000);
    return () => clearTimeout(t);
  }, [toast, hide]);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 md:bottom-6">
      {toast && (
        <div key={toast.id} className="pointer-events-auto flex max-w-md items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          {toast.tone === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" aria-hidden /> : <AlertCircle className="h-5 w-5 shrink-0 text-red-400" aria-hidden />}
          <span className="flex-1">{toast.text}</span>
          {toast.action && <a href={toast.action.href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">{toast.action.label}</a>}
          <button type="button" onClick={hide} aria-label="Dismiss" className="cursor-pointer rounded p-1 text-slate-400 hover:text-white"><X className="h-4 w-4" aria-hidden /></button>
        </div>
      )}
    </div>
  );
}
