import { useQuery } from '@tanstack/react-query';
import { businessApi } from '../api/business.api';

/**
 * Returns the store owner's country from the cached business query.
 * Used to format dates in the store's local timezone.
 * Returns undefined while loading (callers fall back to browser timezone).
 */
export function useStoreCountry(): string | undefined {
  const { data } = useQuery({
    queryKey: ['business'],
    queryFn: businessApi.getBusiness,
    staleTime: 10 * 60 * 1000,
  });
  return data?.country;
}
