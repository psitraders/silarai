import { useCallback, useEffect, useState } from 'react';
import type { StoreProduct } from '../../core/types';

export interface CompareItem { id: string; title: string; image?: string | null }

export const COMPARE_MAX = 4;

const keyFor = (slug: string) => `compare_${slug}`;

function read(slug: string): CompareItem[] {
  try {
    const raw = sessionStorage.getItem(keyFor(slug));
    const list = raw ? (JSON.parse(raw) as CompareItem[]) : [];
    return Array.isArray(list) ? list.filter(i => i && typeof i.id === 'string').slice(0, COMPARE_MAX) : [];
  } catch {
    return [];
  }
}

/**
 * Compare tray state, per store and per browser tab (sessionStorage, like the cart it never
 * crosses tenants). Only ids, titles and photos are kept — prices are fetched live to compare.
 */
export function useCompare(slug: string) {
  const [items, setItems] = useState<CompareItem[]>(() => read(slug));
  useEffect(() => {
    try { sessionStorage.setItem(keyFor(slug), JSON.stringify(items)); } catch { /* storage unavailable */ }
  }, [slug, items]);

  const toggle = useCallback((p: StoreProduct) => {
    setItems(list => list.some(i => i.id === p.id)
      ? list.filter(i => i.id !== p.id)
      : list.length >= COMPARE_MAX ? list : [...list, { id: p.id, title: p.title, image: p.primaryImage }]);
  }, []);
  const remove = useCallback((id: string) => setItems(list => list.filter(i => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  return { items, toggle, remove, clear };
}
