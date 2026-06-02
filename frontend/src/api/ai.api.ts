import apiClient from './client';

export interface AiSuggestionResult {
  suggestionId: string;
  reply: string;
  provider: string;
}

export interface AiTemplateDto {
  id: string;
  name: string;
  content: string;
  category: string;
  toneMode: string;
  isActive: boolean;
  createdAt: string;
}

export const aiApi = {
  getSuggestion: (data: {
    leadId?: string;
    customerQuestion: string;
    productId?: string;
    channel?: string;
    toneMode?: string;
  }) => apiClient.post<AiSuggestionResult>('/ai/suggest', data).then((r) => r.data),

  getTemplates: (category?: string) =>
    apiClient.get<AiTemplateDto[]>('/ai/templates', { params: { category } }).then((r) => r.data),

  createTemplate: (data: { name: string; content: string; category: string; toneMode: string }) =>
    apiClient.post<{ id: string }>('/ai/templates', data).then((r) => r.data),

  updateTemplate: (id: string, data: { name: string; content: string; category: string; toneMode: string; isActive: boolean }) =>
    apiClient.put(`/ai/templates/${id}`, data),

  deleteTemplate: (id: string) => apiClient.delete(`/ai/templates/${id}`),
};
