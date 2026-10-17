import { useId } from 'react';
import { readCategories } from '../../core/smart';
import type { CategoryQuery, CategorySource, SmartCategories } from '../../core/types';
import { FieldLabel, INPUT } from '../ui/controls';
import { useEditorCategories } from './useStoreData';

export function CategoriesField({ label, helper, value, onChange }: { label: string; helper?: string; value: unknown; onChange: (v: SmartCategories) => void }) {
  const id = useId();
  const query: CategoryQuery = readCategories(value)?.$categories ?? { source: 'all', limit: 12 };
  const { data: categories = [] } = useEditorCategories();
  const set = (patch: Partial<CategoryQuery>) => {
    const next: CategoryQuery = { ...query, ...patch };
    if (next.source !== 'manual') delete next.categoryIds;
    onChange({ $categories: next });
  };
  const picked = query.categoryIds ?? [];
  return (
    <div className="space-y-3">
      <div>
        <FieldLabel htmlFor={id} helper={helper}>{label}</FieldLabel>
        <select id={id} value={query.source} onChange={e => { const source = e.target.value as CategorySource; set({ source, categoryIds: source === 'manual' ? picked : undefined }); }} className={INPUT}>
          <option value="all">All categories</option>
          <option value="featured">Featured categories</option>
          <option value="manual">Hand-picked</option>
        </select>
      </div>
      {query.source === 'manual' && (
        <fieldset className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          <legend className="sr-only">Categories to show</legend>
          {categories.length === 0 && <p className="p-2 text-sm text-slate-500">No categories yet.</p>}
          {categories.map(c => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--rc-primary)]"
                checked={picked.includes(c.id)}
                onChange={e => set({ categoryIds: e.target.checked ? [...picked, c.id] : picked.filter(x => x !== c.id) })}
              />
              {c.name}
            </label>
          ))}
        </fieldset>
      )}
      {query.source !== 'manual' && (
        <div>
          <FieldLabel htmlFor={`${id}-limit`}>Show up to</FieldLabel>
          <input id={`${id}-limit`} type="number" min={1} max={48} value={query.limit ?? 12} onChange={e => set({ limit: Math.max(1, Math.min(48, Number(e.target.value) || 1)) })} className={INPUT} />
        </div>
      )}
    </div>
  );
}
