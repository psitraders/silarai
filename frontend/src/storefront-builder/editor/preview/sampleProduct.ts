import { useQuery } from '@tanstack/react-query';
import { storefrontApi } from '../../core/data/api';
import type { StoreProduct } from '../../core/types';

/** Shown on the Product page template and in the popup preview when the store has no products yet. */
const SAMPLE = {
  id: '00000000-0000-0000-0000-000000000000',
  title: 'Sample product',
  description: 'This is how a product description looks. Add products in your catalogue to see them here.\n\nMaterial: Cotton\nCare: Machine wash',
  basePrice: 1499,
  discountedPrice: 1199,
  isFeatured: true,
  stockQuantity: 12,
  categoryName: 'Sample category',
  primaryImage: null,
  allImages: [],
  // No variants to load for the placeholder.
  variants: [],
  tags: [],
} as StoreProduct;

/** A real product to design the product page with (the first one with photos), or a placeholder. */
export function useSampleProduct(slug: string, enabled: boolean): StoreProduct {
  const { data } = useQuery({
    queryKey: ['sb-sample-product', slug],
    queryFn: async () => {
      const list = await storefrontApi.products(slug, { pageSize: 12 });
      return list.items.find(p => (p.allImages?.length ?? 0) > 1) ?? list.items.find(p => p.primaryImage) ?? list.items[0] ?? null;
    },
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000,
  });
  return data ?? SAMPLE;
}
