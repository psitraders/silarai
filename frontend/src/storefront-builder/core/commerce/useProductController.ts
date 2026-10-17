/**
 * One typed controller per open product (popup or page): full detail with
 * variants, selection, price maths, B2B wholesale tiers, quantity and add-to-cart.
 * Product blocks read it through `useProductCtl()`; they never fetch or price on
 * their own (design.md §13 rules 4 and 16).
 */
import { useQuery } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useStorefrontAuth } from '../../../context/StorefrontAuthContext';
import { storefrontApi } from '../data/api';
import { useShell } from '../shell-context';
import { useStorefront } from '../storefront-context';
import type { StoreProduct } from '../types';
import { commerceApi } from './api';
import type { ProductDetail, ProductVariant, WholesaleTier } from './types';

const FIVE_MIN = 5 * 60 * 1000;

export interface ProductController {
  product: ProductDetail;
  /** True until variants have loaded (variant pickers show a skeleton). */
  detailLoading: boolean;
  images: string[];
  variantGroups: [string, ProductVariant[]][];
  selected: Record<string, string>;
  select: (group: string, value: string) => void;
  allSelected: boolean;
  /** First group without a choice (for the "Please choose a size" hint). */
  missingGroup?: string;
  /** e.g. "Size: M, Colour: Red" — sent with orders and cart lines. */
  variantInfo?: string;
  /** Retail unit price incl. the selected variants' adjustments. */
  unitPrice: number;
  /** Original price (struck through) when the product is on sale. */
  compareAt?: number;
  discountPercent: number;
  outOfStock: boolean;
  stock: number | null;
  quantity: number;
  setQuantity: (q: number) => void;
  maxQuantity: number;
  /** Approved B2B buyer on a B2B-enabled store. */
  isWholesale: boolean;
  /** Registered B2B customer (may still be awaiting approval) — can request quotes. */
  isB2BCustomer: boolean;
  tiers: WholesaleTier[];
  /** Unit price for `qty` units — wholesale tier when it applies, never above retail. */
  unitFor: (qty: number) => number;
  /** Adds the current selection to the cart. Returns false when a variant is missing. */
  addToCart: (qty?: number) => boolean;
  /** Editor / gallery preview: orders, inquiries and reviews are not sent (data is still read). */
  preview: boolean;
}

function groupVariants(variants: ProductVariant[]): [string, ProductVariant[]][] {
  const groups = new Map<string, ProductVariant[]>();
  for (const v of variants) {
    const list = groups.get(v.name) ?? [];
    if (!list.some(x => x.value === v.value)) list.push(v);
    groups.set(v.name, list);
  }
  return [...groups.entries()];
}

function asDetail(p: StoreProduct): ProductDetail {
  return { variants: [], tags: [], ...p } as ProductDetail;
}

export function useProductController(product: StoreProduct, preview = false): ProductController {
  const { slug, store } = useStorefront();
  const shell = useShell();
  const { customer } = useStorefrontAuth();
  const b2bOn = store.b2bEnabled !== false;
  const isWholesale = b2bOn && !!customer?.isB2BApproved;
  const given = product as Partial<ProductDetail>;
  const hasDetail = Array.isArray(given.variants);

  const detailQuery = useQuery({
    queryKey: ['public-product', slug, product.id],
    queryFn: () => storefrontApi.product(slug, product.id),
    enabled: !hasDetail,
    staleTime: FIVE_MIN,
  });
  // List fields (isFeatured, categoryId, minVariantPrice) survive; detail adds variants and tags.
  const detail = useMemo<ProductDetail>(
    () => (detailQuery.data ? { ...asDetail(product), ...detailQuery.data, allImages: detailQuery.data.allImages?.length ? detailQuery.data.allImages : product.allImages } : asDetail(product)),
    [product, detailQuery.data],
  );

  const tiersQuery = useQuery({
    queryKey: ['public-tiers', slug, product.id],
    queryFn: () => commerceApi.wholesaleTiers(slug, product.id),
    enabled: isWholesale && !preview,
    staleTime: FIVE_MIN,
  });
  const tiers = useMemo(() => tiersQuery.data ?? [], [tiersQuery.data]);

  const variantGroups = useMemo(() => groupVariants(detail.variants), [detail.variants]);
  // The first value of each group is pre-selected; the shopper's picks override it.
  const [picked, setPicked] = useState<Record<string, string>>({});
  const selected = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [name, values] of variantGroups) {
      const pick = picked[name];
      out[name] = pick && values.some(v => v.value === pick) ? pick : values[0]?.value;
    }
    return out;
  }, [variantGroups, picked]);
  const select = useCallback((group: string, value: string) => setPicked(p => ({ ...p, [group]: value })), []);

  const missingGroup = variantGroups.find(([name]) => !selected[name])?.[0];
  const allSelected = !missingGroup;
  const adjustment = variantGroups.reduce((sum, [name, values]) => sum + (values.find(v => v.value === selected[name])?.priceAdjustment ?? 0), 0);
  const variantInfo = variantGroups.map(([name]) => `${name}: ${selected[name]}`).join(', ') || undefined;

  const onSale = detail.discountedPrice != null && detail.discountedPrice < detail.basePrice;
  const retail = (onSale ? detail.discountedPrice! : detail.basePrice) + adjustment;
  const compareAt = onSale ? detail.basePrice + adjustment : undefined;
  const discountPercent = onSale && detail.basePrice > 0 ? Math.round((1 - detail.discountedPrice! / detail.basePrice) * 100) : 0;

  const stock = detail.stockQuantity ?? null;
  const outOfStock = detail.isOutOfStock === true || (stock != null && stock <= 0);
  const maxQuantity = stock != null ? Math.max(1, stock) : 999;
  const [quantity, setQty] = useState(1);
  const setQuantity = useCallback((q: number) => setQty(Math.min(maxQuantity, Math.max(1, Math.floor(q) || 1))), [maxQuantity]);

  const unitFor = useCallback((qty: number) => {
    if (!isWholesale) return retail;
    const tier = tiers
      .filter(t => qty >= t.minQuantity && (t.maxQuantity == null || qty <= t.maxQuantity))
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];
    // Tier replaces the base price, variant adjustment on top, never above retail (matches the server).
    return tier ? Math.min(retail, tier.pricePerUnit + adjustment) : retail;
  }, [isWholesale, tiers, retail, adjustment]);

  const addToCart = useCallback((qty = quantity) => {
    if (!allSelected || outOfStock) return false;
    // The cart applies wholesale tiers itself, so lines carry the retail unit price.
    shell.addToCart(detail, qty, { unitPrice: retail, variantInfo });
    return true;
  }, [allSelected, outOfStock, shell, detail, quantity, retail, variantInfo]);

  const images = detail.allImages?.length ? detail.allImages : detail.primaryImage ? [detail.primaryImage] : [];

  return {
    product: detail,
    detailLoading: !hasDetail && detailQuery.isLoading,
    images,
    variantGroups,
    selected,
    select,
    allSelected,
    missingGroup,
    variantInfo,
    unitPrice: retail,
    compareAt,
    discountPercent,
    outOfStock,
    stock,
    quantity,
    setQuantity,
    maxQuantity,
    isWholesale,
    isB2BCustomer: b2bOn && !!customer?.isB2BCustomer,
    tiers,
    unitFor,
    addToCart,
    preview,
  };
}

/** Where the product is shown — popups can close themselves and link to the full page. */
export interface ProductSurface {
  kind: 'popup' | 'page';
  close?: () => void;
  /** "View full details" (popup in "both" mode): closes the popup and opens the product page. */
  openFullPage?: () => void;
}

export const ProductControllerContext = createContext<ProductController | null>(null);
export const ProductSurfaceContext = createContext<ProductSurface>({ kind: 'page' });

export function useProductCtl(): ProductController {
  const ctl = useContext(ProductControllerContext);
  if (!ctl) throw new Error('Product blocks must be rendered inside <ProductScope>');
  return ctl;
}

export const useProductSurface = () => useContext(ProductSurfaceContext);
