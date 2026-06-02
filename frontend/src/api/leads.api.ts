import apiClient from './client';
import type { Lead, LeadDetail } from '../types/lead.types';
import type { LeadStatus, SocialPlatform } from '../types/lead.types';

export interface PagedLeads {
  items: Lead[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const leadsApi = {
  getLeads: (params?: {
    page?: number;
    pageSize?: number;
    status?: LeadStatus;
    channel?: SocialPlatform;
    search?: string;
  }) => apiClient.get<PagedLeads>('/leads', { params }).then(r => r.data),

  getLead: (id: string) => apiClient.get<LeadDetail>(`/leads/${id}`).then(r => r.data),

  createLead: (data: {
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    sourceChannel: SocialPlatform;
    interestedProductId?: string;
    inquiryNote?: string;
    followUpDate?: string;
    priority?: number;
  }) => apiClient.post<{ id: string }>('/leads', data).then(r => r.data),

  updateStatus: (id: string, status: LeadStatus, followUpDate?: string) =>
    apiClient.patch(`/leads/${id}/status`, { status, followUpDate }),

  addNote: (id: string, content: string) =>
    apiClient.post(`/leads/${id}/notes`, { content }),

  convertToOrder: (id: string, items: { productId: string; productTitle: string; quantity: number; unitPrice: number }[], notes?: string) =>
    apiClient.post<{ id: string }>(`/leads/${id}/convert`, { items, notes }).then(r => r.data),
};
