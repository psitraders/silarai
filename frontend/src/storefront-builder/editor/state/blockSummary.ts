import type { BlockDef } from '../../core/types';

/** One-line summary of a block for the list (its first text-like value). */
export function blockSummary(def: BlockDef | undefined, settings: Record<string, unknown> | undefined): string {
  const merged = { ...(def?.defaults ?? {}), ...(settings ?? {}) };
  for (const f of def?.fields ?? []) {
    const v = merged[f.key];
    if ((f.type === 'text' || f.type === 'textarea') && typeof v === 'string' && v.trim()) return v.trim();
  }
  return def?.name ?? 'Item';
}
