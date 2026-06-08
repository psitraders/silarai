import axios from 'axios';
import apiClient from './client';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://silarai-fbahb2bsg4cng3hq.southindia-01.azurewebsites.net/api/v1';

export interface SubmitLeadDto {
  name: string;
  email: string;
  phone?: string;
  businessType?: string;
  productCount?: string;
  message?: string;
  source?: 'chatbot' | 'form';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface PlatformLeadDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessType?: string;
  productCount?: string;
  message?: string;
  source: string;
  status: string;
  adminNotes?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
}

export interface PlatformLeadsResult {
  items: PlatformLeadDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PlatformLeadsSummary {
  total: number;
  newLeads: number;
  contacted: number;
  converted: number;
}

export interface ChatbotOnboardRequest {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  country: string;
  businessType?: string;
}

export interface ChatbotOnboardResult {
  slug: string;
  storeUrl: string;
  loginUrl: string;
  tempPassword: string;
  message: string;
}

// Public — no auth
export const submitPlatformLead = (data: SubmitLeadDto) =>
  axios.post(`${BASE_URL}/platform-leads`, data).then(r => r.data);

export const chatbotOnboard = (data: ChatbotOnboardRequest): Promise<ChatbotOnboardResult> =>
  axios.post(`${BASE_URL}/chatbot/onboard`, data).then(r => r.data);

// Admin — requires SuperAdmin auth
export const platformLeadsApi = {
  getAll: (params?: { page?: number; pageSize?: number; status?: string; search?: string }) =>
    apiClient.get<PlatformLeadsResult>('/admin/platform-leads', { params }).then(r => r.data),
  update: (id: string, status: string, adminNotes?: string) =>
    apiClient.patch(`/admin/platform-leads/${id}`, { status, adminNotes }),
  delete: (id: string) =>
    apiClient.delete(`/admin/platform-leads/${id}`),
  getSummary: () =>
    apiClient.get<PlatformLeadsSummary>('/admin/platform-leads/summary').then(r => r.data),
};
