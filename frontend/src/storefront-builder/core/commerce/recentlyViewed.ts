/**
 * Recently viewed products, kept per store in this browser only (ids, never
 * prices — products are re-read live, SB-R1). The shell records every product
 * a shopper opens; the "Recently viewed" section reads the list.
 */
import { useSyncExternalStore } from 'react';

const MAX = 12;
const EMPTY: string[] = [];
const key = (slug: string) => `sf-recent:${slug}`;
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; ids: string[] }>();

function read(slug: string): string[] {
  let raw: string | null = null;
  try { raw = localStorage.getItem(key(slug)); } catch { /* storage blocked */ }
  const hit = cache.get(slug);
  if (hit && hit.raw === raw) return hit.ids;
  let ids: string[];
  try { ids = raw ? (JSON.parse(raw) as unknown[]).filter((x): x is string => typeof x === 'string') : []; } catch { ids = []; }
  cache.set(slug, { raw, ids });
  return ids;
}

export function recordRecentlyViewed(slug: string, productId: string) {
  const next = [productId, ...read(slug).filter(id => id !== productId)].slice(0, MAX);
  try { localStorage.setItem(key(slug), JSON.stringify(next)); } catch { /* storage full or blocked */ }
  listeners.forEach(l => l());
}

export function useRecentlyViewed(slug: string): string[] {
  return useSyncExternalStore(
    cb => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => read(slug),
    () => EMPTY,
  );
}
