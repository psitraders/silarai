import { useState } from 'react';
import { blocksOf } from '../../../../core/blocks';
import { useResolvedProducts } from '../../../../core/data/hooks';
import type { BlockInstance, SmartProducts, StoreProduct } from '../../../../core/types';
import { SPOT_DEFAULTS } from './manifest';

export interface Spot { id: string; x: number; y: number; product: StoreProduct }

const clamp = (n: unknown) => Math.min(Math.max(Number(n) || 0, 2), 98);

/**
 * Hotspots with their products. Published pages carry each product (server-filled `items`);
 * drafts resolve all picked ids in one go.
 */
export function useLook(blocks: BlockInstance[]) {
  const spots = blocksOf(blocks, 'spot', SPOT_DEFAULTS);
  const ids = spots.map(s => s.settings.product?.$products?.productIds?.[0]).filter((id): id is string => !!id);
  const serverItems = spots.map(s => s.settings.product?.items?.[0]).filter((p): p is StoreProduct => !!p);
  const all: SmartProducts = { $products: { source: 'manual', productIds: ids, limit: Math.max(ids.length, 1) }, ...(serverItems.length === ids.length && ids.length ? { items: serverItems } : {}) };
  const { items, isLoading } = useResolvedProducts(ids.length ? all : undefined);
  const byId = new Map(items.map(p => [p.id, p]));
  const resolved: Spot[] = spots.flatMap(s => {
    const id = s.settings.product?.$products?.productIds?.[0];
    const product = id ? byId.get(id) : undefined;
    return product ? [{ id: s.id, x: clamp(s.settings.x), y: clamp(s.settings.y), product }] : [];
  });
  const [active, setActive] = useState(0);
  return { spots: resolved, isLoading, active: Math.min(active, Math.max(resolved.length - 1, 0)), setActive };
}
