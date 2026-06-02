import apiClient from './client';

export interface ReviewDto {
  id: string;
  productId: string;
  productTitle: string;
  reviewerName: string;
  reviewerEmail?: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
}

export const reviewsApi = {
  getAll: (params?: { productId?: string; approved?: boolean }) =>
    apiClient.get<ReviewDto[]>('/reviews', { params }).then(r => r.data),
  approve: (id: string) => apiClient.put(`/reviews/${id}/approve`, {}),
  reject: (id: string) => apiClient.put(`/reviews/${id}/reject`, {}),
  delete: (id: string) => apiClient.delete(`/reviews/${id}`),
};
