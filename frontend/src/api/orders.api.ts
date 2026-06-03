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

  openInvoice: async (id: string) => {
    const res = await apiClient.get(`/orders/${id}/invoice`, { responseType: 'text' });
    const blob = new Blob([res.data], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    // Revoke after the window has loaded so the blob stays available for print
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return win;
  },

  createPaymentLink: (id: string) =>
    apiClient.post<{ url: string }>(`/orders/${id}/payment-link`).then((r) => r.data),
};
