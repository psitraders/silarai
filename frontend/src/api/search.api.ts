import apiClient from './client';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

export interface SearchResults {
  products:  SearchResultItem[];
  customers: SearchResultItem[];
  orders:    SearchResultItem[];
  leads:     SearchResultItem[];
}

export const searchApi = {
  search: (q: string) =>
    apiClient.get<SearchResults>('/search', { params: { q } }).then(r => r.data),
};
