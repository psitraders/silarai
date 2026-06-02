import apiClient from './client';

export interface AbandonedCartDto {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  cartTotal: number;
  itemCount: number;
  cartItems: CartItemSnapshot[];
  isRecovered: boolean;
  lastReminderSentAt?: string;
  createdAt: string;
}

export interface CartItemSnapshot {
  productTitle: string;
  unitPrice: number;
  quantity: number;
  variantInfo?: string;
}

export const abandonedCartsApi = {
  getAll: (params?: { recovered?: boolean; page?: number; pageSize?: number }) =>
    apiClient.get<{ items: AbandonedCartDto[]; totalCount: number; totalPages: number }>('/abandoned-carts', { params }).then(r => r.data),
  markRecovered: (id: string) => apiClient.put(`/abandoned-carts/${id}/mark-recovered`, {}),
  markReminderSent: (id: string) => apiClient.put(`/abandoned-carts/${id}/reminder-sent`, {}),
  delete: (id: string) => apiClient.delete(`/abandoned-carts/${id}`),
};
