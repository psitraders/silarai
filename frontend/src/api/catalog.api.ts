import apiClient from './client';
import type { Category, PagedList, Product, ProductDetail } from '../types/catalog.types';

export const catalogApi = {
  getProducts: (params?: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    search?: string;
    status?: string;
  }) => apiClient.get<PagedList<Product>>('/products', { params }).then((r) => r.data),

  getProduct: (id: string) =>
    apiClient.get<ProductDetail>(`/products/${id}`).then((r) => r.data),

  createProduct: (data: Partial<Product>) =>
    apiClient.post<{ id: string }>('/products', data).then((r) => r.data),

  updateProduct: (id: string, data: Partial<Product>) =>
    apiClient.put(`/products/${id}`, data).then((r) => r.data),

  deleteProduct: (id: string) => apiClient.delete(`/products/${id}`),

  cloneProduct: (id: string) =>
    apiClient.post<{ id: string }>(`/products/${id}/clone`).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/products/${id}/status`, { status }),

  uploadImage: (productId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post(`/products/${productId}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getCategories: () => apiClient.get<Category[]>('/categories').then((r) => r.data),

  createCategory: (data: Partial<Category>) =>
    apiClient.post<{ id: string }>('/categories', data).then((r) => r.data),

  updateCategory: (id: string, data: Partial<Category>) =>
    apiClient.put(`/categories/${id}`, data).then((r) => r.data),

  deleteCategory: (id: string) => apiClient.delete(`/categories/${id}`),
};
