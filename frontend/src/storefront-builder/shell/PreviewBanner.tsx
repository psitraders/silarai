import { Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clearPreviewToken } from '../core/data/preview';
import { useStorefront } from '../core/storefront-context';

/**
 * Shown over the store while a preview link is open (SB-R22): the shopper sees the merchant's
 * unpublished draft. Neutral styling on purpose — it is not part of the store's design.
 */
export function PreviewBanner({ expired }: { expired: boolean }) {
  const { slug } = useStorefront();
  const [hidden, setHidden] = useState(false);

  // Drafts must never be indexed.
  useEffect(() => {
    if (expired) return;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [expired]);

  if (hidden) return null;

  const exit = () => {
    clearPreviewToken(slug);
    const url = new URL(window.location.href);
    url.searchParams.delete('preview');
    window.location.replace(url.toString());
  };

  return (
    <div role="status" className="fixed inset-x-3 bottom-20 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-900/95 px-4 py-3 text-sm text-white shadow-xl sm:bottom-4">
      <Eye className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">
        {expired ? 'This preview link has been turned off — you’re seeing the live store.' : 'Preview of unpublished changes. Shoppers don’t see this yet.'}
      </span>
      {!expired && (
        <button type="button" onClick={exit} className="shrink-0 cursor-pointer rounded-lg px-2 py-1 font-semibold underline hover:bg-white/10">Exit</button>
      )}
      <button type="button" onClick={() => setHidden(true)} aria-label="Hide this message" className="shrink-0 cursor-pointer rounded-lg p-1 hover:bg-white/10">
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
