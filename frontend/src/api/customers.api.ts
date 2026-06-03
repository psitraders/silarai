import apiClient from './client';

export interface CustomerDto {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  city?: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate?: string;
  createdAt: string;
}

export interface CustomerDetailDto {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  tags?: string;
  birthday?: string;     // "YYYY-MM-DD"
  anniversary?: string;  // "YYYY-MM-DD"
  totalOrders: number;
  totalSpend: number;
  lastOrderDate?: string;
  createdAt: string;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
  recentLeads: Array<{
    id: string;
    status: string;
    inquiryNote?: string;
    createdAt: string;
  }>;
}

export interface SaveCustomerDto {
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  tags?: string;
  birthday?: string;     // "YYYY-MM-DD" (year is ignored for recurrence)
  anniversary?: string;  // "YYYY-MM-DD"
}

export interface UpcomingBirthdayDto {
  id: string;
  name: string;
  phone?: string;
  type: 'Birthday' | 'Anniversary';
  date: string;
  daysUntil: number;
  totalOrders: number;
  totalSpend: number;
}

export interface DuplicateGroupDto {
  phoneNumber: string;
  customers: CustomerDto[];
}

export interface B2BCustomerDto {
  crmCustomerId: string;
  storefrontCustomerId: string;
  name: string;
  email?: string;
  phoneNumber: string;
  companyName?: string;
  gstNumber?: string;
  isB2BApproved: boolean;
  totalOrders: number;
  totalSpend: number;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const customersApi = {
  getAll: (params?: { page?: number; pageSize?: number; search?: string; tag?: string }) =>
    apiClient.get<PagedResult<CustomerDto>>('/customers', { params }).then(r => r.data),

  getById: (id: string) =>
    apiClient.get<CustomerDetailDto>(`/customers/${id}`).then(r => r.data),

  create: (data: SaveCustomerDto) =>
    apiClient.post<{ id: string }>('/customers', data).then(r => r.data),

  update: (id: string, data: SaveCustomerDto) =>
    apiClient.put(`/customers/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/customers/${id}`),

  merge: (targetId: string, sourceId: string) =>
    apiClient.post(`/customers/${targetId}/merge/${sourceId}`),

  getDuplicates: () =>
    apiClient.get<DuplicateGroupDto[]>('/customers/duplicates').then(r => r.data),

  smartMerge: () =>
    apiClient.post<{ groupsMerged: number; customersMerged: number }>('/customers/smart-merge').then(r => r.data),

  getB2BCustomers: () =>
    apiClient.get<B2BCustomerDto[]>('/customers/b2b').then(r => r.data),

  approveB2BCustomer: (crmCustomerId: string, approve = true) =>
    apiClient.post(`/customers/${crmCustomerId}/b2b/approve`, null, { params: { approve } }),

  exportCsv: () =>
    apiClient.get('/customers/export', { responseType: 'blob' }).then(r => r.data as Blob),

  importCsv: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post<{ created: number; updated: number; skipped: number }>(
      '/customers/import', form, { headers: { 'Content-Type': 'multipart/form-data' } }
    ).then(r => r.data);
  },

  getUpcomingBirthdays: (daysAhead = 30) =>
    apiClient.get<UpcomingBirthdayDto[]>('/customers/birthdays', { params: { daysAhead } }).then(r => r.data),
};
