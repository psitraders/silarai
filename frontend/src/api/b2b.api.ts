import apiClient from './client';

export interface WholesaleTier {
  id: string;
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  label?: string;
}

export interface QuoteDto {
  id: string;
  contactName: string;
  contactEmail: string;
  companyName?: string;
  status: string;
  itemsJson: string;
  notes?: string;
  merchantReply?: string;
  createdAt: string;
}

export const b2bApi = {
  getWholesaleTiers: (productId: string) =>
    apiClient.get<WholesaleTier[]>(`/b2b/products/${productId}/wholesale-tiers`).then(r => r.data),

  saveWholesaleTiers: (productId: string, tiers: Omit<WholesaleTier, 'id'>[]) =>
    apiClient.put(`/b2b/products/${productId}/wholesale-tiers`, tiers).then(r => r.data),

  getQuotes: (page = 1) =>
    apiClient.get<QuoteDto[]>('/b2b/quotes', { params: { page, pageSize: 20 } }).then(r => r.data),

  replyToQuote: (quoteId: string, reply: string, status = 'Replied') =>
    apiClient.put(`/b2b/quotes/${quoteId}/reply`, { reply, status }).then(r => r.data),
};
