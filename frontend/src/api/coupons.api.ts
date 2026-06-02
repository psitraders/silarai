import apiClient from './client';

export interface CouponDto {
  id: string;
  code: string;
  type: 'Percentage' | 'Flat' | 'BuyXGetY';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  buyQuantity?: number;
  getQuantity?: number;
  createdAt: string;
}

export interface SaveCouponDto {
  code: string;
  type: 'Percentage' | 'Flat' | 'BuyXGetY';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  buyQuantity?: number;
  getQuantity?: number;
}

export const couponsApi = {
  getAll: () => apiClient.get<CouponDto[]>('/coupons').then(r => r.data),
  create: (data: SaveCouponDto) => apiClient.post<{ id: string }>('/coupons', data).then(r => r.data),
  update: (id: string, data: SaveCouponDto) => apiClient.put(`/coupons/${id}`, data),
  delete: (id: string) => apiClient.delete(`/coupons/${id}`),
};
