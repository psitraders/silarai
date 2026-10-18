import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Link2, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { apiErrorMessage, builderApi } from '../api';
import { useEditor } from '../state/store';
import { INPUT } from '../ui/controls';
import { useToast } from '../ui/toastStore';

const KEY = ['sb-preview-link'] as const;

/**
 * "Share preview" (SB-R22): one link per store that shows the saved draft, read-only, to anyone
 * who has it — until it is turned off or replaced. Pending edits are saved before the link is shown.
 */
export function PreviewLinkDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const show = useToast(s => s.show);
  const slug = useEditor(s => s.slug);
  const [copied, setCopied] = useState(false);
  const link = useQuery({ queryKey: KEY, queryFn: builderApi.getPreviewLink });
  const token = link.data?.token ?? null;
  const url = token ? `${window.location.origin}/${slug}?preview=${token}` : '';

  const create = useMutation({
    mutationFn: async () => {
      if (!(await useEditor.getState().flush())) throw new Error('Your latest changes couldn’t be saved. Try again.');
      return builderApi.createPreviewLink();
    },
    onSuccess: data => { qc.setQueryData(KEY, data); setCopied(false); },
    onError: err => show('error', apiErrorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: builderApi.deletePreviewLink,
    onSuccess: () => { qc.setQueryData(KEY, { token: null }); show('success', 'Preview link turned off.'); },
    onError: err => show('error', apiErrorMessage(err)),
  });

  const copy = async () => {
    await useEditor.getState().flush();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      show('error', 'Couldn’t copy — select the link and copy it.');
    }
  };

  return (
    <Modal open onClose={onClose} title="Share a preview" size="md">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Anyone with the link can see your saved draft — including changes you haven’t published — but can’t edit it.
          It keeps working until you turn it off or make a new one.
        </p>
        {link.isLoading ? (
          <div className="flex justify-center py-4" role="status"><Loader2 className="h-5 w-5 animate-spin text-slate-400 motion-reduce:animate-none" aria-hidden /><span className="sr-only">Loading…</span></div>
        ) : token ? (
          <>
            <div className="flex gap-2">
              <input readOnly value={url} aria-label="Preview link" onFocus={e => e.currentTarget.select()} className={`${INPUT} font-mono text-xs`} />
              <button type="button" onClick={() => { void copy(); }} className="theme-btn inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-4 text-sm font-semibold">
                {copied ? <><Check className="h-4 w-4" aria-hidden /> Copied</> : <><Copy className="h-4 w-4" aria-hidden /> Copy</>}
              </button>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4">
              <button type="button" disabled={create.isPending} onClick={() => create.mutate()} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60" title="The current link stops working">
                <RefreshCw className="h-4 w-4" aria-hidden /> Make a new link
              </button>
              <button type="button" disabled={remove.isPending} onClick={() => remove.mutate()} className="min-h-10 cursor-pointer rounded-xl px-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
                Turn off link
              </button>
            </div>
          </>
        ) : (
          <button type="button" disabled={create.isPending} onClick={() => create.mutate()} className="theme-btn inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-60">
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />} Create preview link
          </button>
        )}
        {link.isError && <p className="text-sm text-red-600" role="alert">Couldn’t load the preview link.</p>}
      </div>
    </Modal>
  );
}
