import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { b2bApi } from '../../api/b2b.api';

interface Props {
  productId: string;
}

interface TierDraft {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  label: string;
}

export function WholesaleTiersEditor({ productId }: Props) {
  const qc = useQueryClient();

  const tiersQ = useQuery({
    queryKey: ['wholesale-tiers', productId],
    queryFn: () => b2bApi.getWholesaleTiers(productId),
    retry: 1,
  });

  const [drafts, setDrafts]     = useState<TierDraft[]>([]);
  const [dirty, setDirty]       = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState('');

  // Sync server data → local drafts (only when NOT dirty to avoid overwriting user edits)
  useEffect(() => {
    if (tiersQ.data && !dirty) {
      setDrafts(tiersQ.data.map(t => ({
        minQuantity:  t.minQuantity,
        maxQuantity:  t.maxQuantity,
        pricePerUnit: t.pricePerUnit,
        label:        t.label ?? '',
      })));
    }
  }, [tiersQ.data]);   // intentionally omit `dirty` — only reset when fresh data arrives

  const saveMutation = useMutation({
    mutationFn: () => b2bApi.saveWholesaleTiers(productId, drafts),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wholesale-tiers', productId] });
      setDirty(false);
      setSaveError('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.title ??
        err?.message ??
        'Save failed. Check console for details.';
      setSaveError(msg);
      console.error('[WholesaleTiers] save error:', err?.response ?? err);
    },
  });

  const update = (i: number, patch: Partial<TierDraft>) => {
    setDrafts(prev => prev.map((d, idx) => idx === i ? { ...d, ...patch } : d));
    setDirty(true);
    setSaved(false);
    setSaveError('');
  };

  const addTier = () => {
    const last = drafts[drafts.length - 1];
    setDrafts(prev => [...prev, {
      minQuantity:  last ? (last.maxQuantity ? last.maxQuantity + 1 : last.minQuantity + 10) : 10,
      pricePerUnit: 0,
      label:        '',
    }]);
    setDirty(true);
    setSaved(false);
  };

  const removeTier = (i: number) => {
    setDrafts(prev => prev.filter((_, idx) => idx !== i));
    setDirty(true);
    setSaved(false);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-700 text-sm">Wholesale Pricing Tiers</p>
          <p className="text-xs text-slate-500">Quantity-break pricing for B2B buyers</p>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          {(dirty || drafts.length > 0) && (
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !dirty}
              className="flex items-center gap-1.5 bg-teal-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-40"
            >
              {saveMutation.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Save className="w-3.5 h-3.5" />}
              {saveMutation.isPending ? 'Saving…' : 'Save Tiers'}
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {saveError && (
        <div className="flex items-start gap-2 bg-red-50 border-b border-red-100 px-4 py-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span><strong>Save failed:</strong> {saveError}</span>
        </div>
      )}

      {tiersQ.isError && (
        <div className="flex items-start gap-2 bg-amber-50 border-b border-amber-100 px-4 py-2.5 text-xs text-amber-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Could not load tiers. The database table may not exist yet — run Script 2 from the SQL setup.</span>
        </div>
      )}

      {/* Body */}
      <div className="p-4 space-y-2">
        {tiersQ.isLoading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <>
            {drafts.length > 0 && (
              <div className="grid grid-cols-4 gap-2 text-xs font-medium text-slate-500 px-1 mb-1">
                <span>Min Qty</span>
                <span>Max Qty</span>
                <span>Price / unit (₹)</span>
                <span>Label</span>
              </div>
            )}

            {drafts.map((tier, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 items-center">
                <input
                  type="number" min={1} value={tier.minQuantity}
                  onChange={e => update(i, { minQuantity: +e.target.value })}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="number" min={tier.minQuantity + 1} placeholder="∞"
                  value={tier.maxQuantity ?? ''}
                  onChange={e => update(i, { maxQuantity: e.target.value ? +e.target.value : undefined })}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="number" min={0} step={0.01} value={tier.pricePerUnit}
                  onChange={e => update(i, { pricePerUnit: +e.target.value })}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <div className="flex gap-1">
                  <input
                    type="text" placeholder="e.g. 10-49 units"
                    value={tier.label}
                    onChange={e => update(i, { label: e.target.value })}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button type="button" onClick={() => removeTier(i)}
                    className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {drafts.length === 0 && !tiersQ.isLoading && !tiersQ.isError && (
              <p className="text-xs text-slate-400 py-1">
                No tiers yet. Click "+ Add tier" to set wholesale prices.
              </p>
            )}

            <button type="button" onClick={addTier}
              className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 mt-2 font-medium">
              <Plus className="w-4 h-4" />
              Add tier
            </button>
          </>
        )}
      </div>
    </div>
  );
}
