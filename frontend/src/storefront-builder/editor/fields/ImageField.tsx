import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { businessApi } from '../../../api/business.api';
import { optimizeImage } from '../../../utils/imageUrl';
import { readImage } from '../../core/smart';
import type { SmartImage } from '../../core/types';
import { apiErrorMessage } from '../api';
import { FieldLabel } from '../ui/controls';

const MAX_BYTES = 5 * 1024 * 1024;

/** Upload-only image picker: images must live on our uploads / Cloudinary (SB-R4). */
export function ImageField({ label, helper, value, onChange }: { label: string; helper?: string; value: unknown; onChange: (v: SmartImage) => void }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const src = readImage(value);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BYTES) { setError('Choose an image under 5 MB.'); return; }
    setBusy(true);
    setError(null);
    try {
      const url = await businessApi.uploadStoreImage(file, 'section');
      onChange({ $image: url });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div>
      <FieldLabel htmlFor={id} helper={helper}>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {src ? <img src={optimizeImage(src, 200)} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-slate-300" aria-hidden />}
          {busy && <div className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 className="h-5 w-5 animate-spin text-slate-500" aria-hidden /></div>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="min-h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            {src ? 'Replace' : 'Upload'}
          </button>
          {src && (
            <button type="button" onClick={() => onChange({ $image: '' })} className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-lg px-2 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" aria-hidden /> Remove
            </button>
          )}
        </div>
        <input id={id} ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="sr-only" onChange={e => { void upload(e.target.files?.[0]); }} />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
