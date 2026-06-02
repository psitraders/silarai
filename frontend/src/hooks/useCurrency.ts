import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export function useCurrency(): string {
  const { data } = useQuery({
    queryKey: ['business'],
    queryFn: () => apiClient.get('/business').then(r => r.data),
    staleTime: 10 * 60 * 1000,
  });
  return data?.currency ?? 'INR';
}
