import apiClient from './client';
import type { Order, OrderDetail, OrderStatus } from '../types/order.types';

export const ordersApi = {
  getOrders: (params?: { page?: number; pageSize?: number; status?: OrderStatus }) =>
    apiClient.get<{ items: Order[]; totalCount: number }>('/orders', { params }).then((r) => r.data),

  getOrder: (id: string) => apiClient.get<OrderDetail>(`/orders/${id}`).then((r) => r.data),

  createOrder: (data: Partial<OrderDetail>) =>
    apiClient.post<{ id: string }>('/orders', data).then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus, note?: string) =>
    apiClient.patch(`/orders/${id}/status`, { status, note }),

  recordPayment: (id: string, data: { amount: number; method: string; referenceNumber?: string }) =>
    apiClient.post(`/orders/${id}/payments`, data),

  cancelOrder: (id: string, reason?: string) =>
    apiClient.post(`/orders/${id}/cancel`, { reason }),
};
