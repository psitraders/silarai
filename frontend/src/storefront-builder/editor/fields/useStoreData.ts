import { useQuery } from '@tanstack/react-query';
import { storefrontApi } from '../../core/data/api';
import { useEditor } from '../state/store';

/** Categories of the merchant's store (public endpoint, same data shoppers see). */
export function useEditorCategories() {
  const slug = useEditor(s => s.slug);
  return useQuery({ queryKey: ['public-categories', slug], queryFn: () => storefrontApi.categories(slug), enabled: !!slug, staleTime: 5 * 60_000 });
}

export function useProductSearch(search: string) {
  const slug = useEditor(s => s.slug);
  return useQuery({
    queryKey: ['sb-product-search', slug, search],
    queryFn: () => storefrontApi.products(slug, { search: search || undefined, pageSize: 20 }),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useProductsByIds(ids: string[]) {
  const slug = useEditor(s => s.slug);
  return useQuery({
    queryKey: ['sb-products-by-id', slug, ids],
    queryFn: async () => {
      const results = await Promise.allSettled(ids.map(id => storefrontApi.product(slug, id)));
      return results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []));
    },
    enabled: !!slug && ids.length > 0,
    staleTime: 5 * 60_000,
  });
}
