import type { StoreProduct } from '../core/types';

/** Price shown on cards: lowest variant price, else sale price, else base price. */
export function displayPrice(p: StoreProduct): { amount: number; compareAt?: number; from: boolean } {
  if (p.minVariantPrice != null) return { amount: p.minVariantPrice, from: true };
  if (p.discountedPrice != null && p.discountedPrice < p.basePrice) return { amount: p.discountedPrice, compareAt: p.basePrice, from: false };
  return { amount: p.basePrice, from: false };
}

export function discountPercent(p: StoreProduct): number {
  if (p.minVariantPrice != null || p.discountedPrice == null || p.discountedPrice >= p.basePrice || p.basePrice <= 0) return 0;
  return Math.round((1 - p.discountedPrice / p.basePrice) * 100);
}

export function isOutOfStock(p: StoreProduct): boolean {
  return p.isOutOfStock === true || (p.stockQuantity != null && p.stockQuantity <= 0);
}

export function productImages(p: StoreProduct): string[] {
  if (p.allImages?.length) return p.allImages;
  return p.primaryImage ? [p.primaryImage] : [];
}

/** Products with variants must be opened to choose options before adding to the cart. */
export function needsOptions(p: StoreProduct): boolean {
  const variants = (p as { variants?: unknown[] }).variants;
  return Array.isArray(variants) ? variants.length > 0 : p.minVariantPrice != null;
}

/** Food marks read from merchant tags: "veg" / "non-veg" (Indian square-and-dot mark) and "eggless". */
export function foodMarks(product: StoreProduct): { diet: 'veg' | 'non-veg' | null; eggless: boolean } {
  const tags = (product.tags ?? []).map(t => t.trim().toLowerCase().replace(/[\s_]+/g, '-'));
  const diet = tags.includes('non-veg') || tags.includes('nonveg') ? 'non-veg' : tags.includes('veg') || tags.includes('vegetarian') ? 'veg' : null;
  return { diet, eggless: tags.includes('eggless') };
}
