import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { useId, useState } from 'react';
import { readProducts } from '../../core/smart';
import type { ProductQuery, ProductSource, SmartProducts } from '../../core/types';
import { FieldLabel, IconButton, INPUT } from '../ui/controls';
import { useEditorCategories, useProductSearch, useProductsByIds } from './useStoreData';

const SOURCES: { value: ProductSource; label: string }[] = [
  { value: 'featured', label: 'Featured products' },
  { value: 'newest', label: 'Newest first' },
  { value: 'sale', label: 'On sale' },
  { value: 'category', label: 'From a category' },
  { value: 'manual', label: 'Hand-picked' },
  { value: 'all', label: 'All products' },
];

/**
 * A `$products` rule (SB-R1): which products to show, never their prices or images —
 * those always come live from the catalogue.
 */
export function ProductsField({ label, helper, value, onChange, max = 24 }: { label: string; helper?: string; value: unknown; onChange: (v: SmartProducts) => void; max?: number }) {
  const id = useId();
  const query: ProductQuery = readProducts(value)?.$products ?? { source: 'featured', limit: Math.min(8, max) };
  const { data: categories = [] } = useEditorCategories();
  const set = (patch: Partial<ProductQuery>) => {
    const next: ProductQuery = { ...query, ...patch };
    if (next.source !== 'category') delete next.categoryId;
    if (next.source !== 'manual') delete next.productIds;
    onChange({ $products: next });
  };
  const allCategories = categories.flatMap(c => [{ id: c.id, name: c.name }, ...(c.subCategories ?? []).map(s => ({ id: s.id, name: `${c.name} › ${s.name}` }))]);

  return (
    <div className="space-y-3">
      <div>
        <FieldLabel htmlFor={id} helper={helper}>{label}</FieldLabel>
        <select
          id={id}
          value={query.source}
          onChange={e => {
            const source = e.target.value as ProductSource;
            set({ source, categoryId: source === 'category' ? query.categoryId ?? allCategories[0]?.id : undefined, productIds: source === 'manual' ? query.productIds ?? [] : undefined });
          }}
          className={INPUT}
        >
          {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      {query.source === 'category' && (
        <select aria-label="Category" value={query.categoryId ?? ''} onChange={e => set({ categoryId: e.target.value })} className={INPUT}>
          {!allCategories.length && <option value="">No categories yet</option>}
          {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      {query.source === 'manual' && <ManualPicker ids={query.productIds ?? []} max={max} onChange={productIds => set({ productIds })} />}
      {max > 1 && query.source !== 'manual' && (
        <div>
          <FieldLabel htmlFor={`${id}-limit`}>How many</FieldLabel>
          <input id={`${id}-limit`} type="number" min={1} max={max} value={query.limit ?? 8} onChange={e => set({ limit: Math.max(1, Math.min(max, Number(e.target.value) || 1)) })} className={INPUT} />
        </div>
      )}
    </div>
  );
}

/** Searchable, ordered product picker (also used to assign products to a product design). */
export function ManualPicker({ ids, max, onChange }: { ids: string[]; max: number; onChange: (ids: string[]) => void }) {
  const [search, setSearch] = useState('');
  const { data: results } = useProductSearch(search);
  const { data: picked = [] } = useProductsByIds(ids);
  const title = (id: string) => picked.find(p => p.id === id)?.title ?? 'Loading…';
  const move = (i: number, d: number) => { const next = ids.slice(); const [x] = next.splice(i, 1); next.splice(i + d, 0, x); onChange(next); };

  return (
    <div className="space-y-2">
      {ids.length > 0 && (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {ids.map((id, i) => (
            <li key={id} className="flex items-center gap-1 py-1 pl-3 pr-1 text-sm">
              <span className="min-w-0 flex-1 truncate">{title(id)}</span>
              <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" aria-hidden /></IconButton>
              <IconButton label="Move down" disabled={i === ids.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" aria-hidden /></IconButton>
              <IconButton label="Remove" tone="danger" onClick={() => onChange(ids.filter(x => x !== id))}><X className="h-4 w-4" aria-hidden /></IconButton>
            </li>
          ))}
        </ul>
      )}
      {ids.length < max && (
        <>
          <input type="search" aria-label="Search products to add" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products to add…" className={INPUT} />
          <ul className="max-h-48 overflow-y-auto rounded-xl border border-slate-100">
            {(results?.items ?? []).filter(p => !ids.includes(p.id)).map(p => (
              <li key={p.id}>
                <button type="button" onClick={() => onChange([...ids, p.id].slice(0, max))} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50">
                  <Plus className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <span className="truncate">{p.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
