import apiClient from './client';

export interface StorefrontPage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  isPublished: boolean;
  showInNav: boolean;
  showInFooter: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UpsertPageRequest {
  title: string;
  slug?: string;
  content?: string;
  isPublished?: boolean;
  showInNav?: boolean;
  showInFooter?: boolean;
  sortOrder?: number;
}

export const pagesApi = {
  getAll: () => apiClient.get<StorefrontPage[]>('/pages').then(r => r.data),
  getById: (id: string) => apiClient.get<StorefrontPage>(`/pages/${id}`).then(r => r.data),
  create: (req: UpsertPageRequest) => apiClient.post<{ id: string; slug: string }>('/pages', req).then(r => r.data),
  update: (id: string, req: UpsertPageRequest) => apiClient.put(`/pages/${id}`, req),
  delete: (id: string) => apiClient.delete(`/pages/${id}`),
};
