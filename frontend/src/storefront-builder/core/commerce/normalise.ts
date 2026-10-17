import type { StoreProduct } from '../types';
import type { ProductDetail, ProductVariant } from './types';

export interface RawDetail extends Omit<StoreProduct, 'primaryImage' | 'allImages'> {
  images?: { url: string; isPrimary: boolean }[];
  variants?: (Omit<ProductVariant, 'priceAdjustment'> & { priceAdjustment?: number | null })[];
  tags?: string[];
}

/** The detail endpoint returns `images[]`; cards and blocks use `primaryImage` / `allImages`. */
export function normaliseDetail(raw: RawDetail): ProductDetail {
  const images = raw.images ?? [];
  return {
    ...raw,
    isFeatured: raw.isFeatured ?? false,
    primaryImage: images.find(i => i.isPrimary)?.url ?? images[0]?.url ?? null,
    allImages: images.map(i => i.url),
    variants: (raw.variants ?? []).map(v => ({ ...v, priceAdjustment: v.priceAdjustment ?? 0 })),
    tags: raw.tags ?? [],
  };
}
