import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { FieldDef, Settings } from '../../core/types';
import { FieldLabel, IconButton, INPUT } from '../ui/controls';
import { SchemaForm } from './SchemaForm';

/** A list of short texts (announcement messages, opening hours) or of small objects (`itemFields`). */
export function ListField({ field, value, onChange, scope }: { field: FieldDef; value: unknown; onChange: (v: unknown[]) => void; scope: string }) {
  const items = Array.isArray(value) ? value : [];
  const move = (i: number, d: number) => { const next = items.slice(); const [x] = next.splice(i, 1); next.splice(i + d, 0, x); onChange(next); };
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const update = (i: number, v: unknown) => onChange(items.map((x, j) => (j === i ? v : x)));
  const blank = field.itemFields ? Object.fromEntries(field.itemFields.map(f => [f.key, f.type === 'toggle' ? false : f.options?.[0]?.value ?? ''])) : '';

  return (
    <div>
      <FieldLabel helper={field.helper}>{field.label}</FieldLabel>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className={field.itemFields ? 'rounded-xl border border-slate-200 p-3' : 'flex items-center gap-1'}>
            {field.itemFields ? (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Item {i + 1}</span>
                  <div className="flex">
                    <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" aria-hidden /></IconButton>
                    <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" aria-hidden /></IconButton>
                    <IconButton label="Remove" tone="danger" onClick={() => remove(i)}><Trash2 className="h-4 w-4" aria-hidden /></IconButton>
                  </div>
                </div>
                <SchemaForm
                  scope={`${scope}.${i}`}
                  fields={field.itemFields}
                  values={(item ?? {}) as Settings}
                  onChange={(k, v) => update(i, { ...(item as Settings), [k]: v })}
                />
              </>
            ) : (
              <>
                <input aria-label={`${field.label} ${i + 1}`} value={typeof item === 'string' ? item : ''} onChange={e => update(i, e.target.value)} className={INPUT} />
                <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" aria-hidden /></IconButton>
                <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" aria-hidden /></IconButton>
                <IconButton label="Remove" tone="danger" onClick={() => remove(i)}><Trash2 className="h-4 w-4" aria-hidden /></IconButton>
              </>
            )}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...items, structuredClone(blank)])} className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-medium theme-text hover:bg-slate-50">
        <Plus className="h-4 w-4" aria-hidden /> Add
      </button>
    </div>
  );
}
