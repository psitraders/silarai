import apiClient from './client';

export interface CampaignDto {
  id: string;
  title: string;
  type: 'WhatsApp' | 'Email' | 'Instagram';
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Failed';
  recipientCount: number;
  sentCount: number;
  openedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface CampaignDetail extends CampaignDto {
  message?: string;
  subject?: string;
  recipients: RecipientDto[];
}

export interface RecipientDto {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isSent: boolean;
  sentAt?: string;
}

export interface SocialPostResult {
  caption: string;
  hashtags: string;
  callToAction: string;
}

export interface ActivityItem {
  type: 'order' | 'lead' | 'customer';
  title: string;
  subtitle: string;
  occurredAt: string;
  entityId?: string;
}

export interface ReminderItem {
  leadId: string;
  customerName: string;
  phone?: string;
  status: string;
  lastActivity: string;
  daysSinceActivity: number;
}

export const marketingApi = {
  getCampaigns: (page = 1, pageSize = 20) =>
    apiClient.get<CampaignDto[]>('/marketing/campaigns', { params: { page, pageSize } }).then(r => r.data),

  getCampaign: (id: string) =>
    apiClient.get<CampaignDetail>(`/marketing/campaigns/${id}`).then(r => r.data),

  createCampaign: (data: {
    title: string;
    type: number;
    message?: string;
    subject?: string;
    recipients: { name: string; phone?: string; email?: string }[];
  }) => apiClient.post<{ id: string }>('/marketing/campaigns', data).then(r => r.data),

  sendCampaign: (id: string) =>
    apiClient.post(`/marketing/campaigns/${id}/send`).then(r => r.data),

  generateSocialPost: (data: {
    productName: string;
    productDescription?: string;
    platform: string;
    tone: string;
    businessName?: string;
    language?: string;
  }) => apiClient.post<SocialPostResult>('/marketing/social-post', data).then(r => r.data),

  generateProductDescription: (data: {
    productName: string;
    category?: string;
    features?: string;
    tone: string;
    businessName?: string;
    language?: string;
  }) => apiClient.post<{ whatsAppDesc: string; instagramDesc: string; tags: string }>('/marketing/product-description', data).then(r => r.data),

  generateReelScript: (data: {
    productName: string;
    productDescription?: string;
    durationSeconds: number;
    tone: string;
    businessName?: string;
  }) => apiClient.post<{ script: string }>('/marketing/reel-script', data).then(r => r.data),

  generatePoster: (data: {
    productName: string;
    productDescription?: string;
    platform: string;
    tone: string;
    businessName?: string;
  }) => apiClient.post<{ imageUrl: string | null; error?: string }>('/marketing/generate-poster', data).then(r => r.data),

  generateMarketingMessage: (data: {
    goal: string;
    tone: string;
    extraContext?: string;
  }) => apiClient.post<{ message: string }>('/marketing/generate-message', data).then(r => r.data),

  getActivityFeed: (count = 15) =>
    apiClient.get<ActivityItem[]>('/activity/feed', { params: { count } }).then(r => r.data),

  getReminders: (staleAfterDays = 2) =>
    apiClient.get<ReminderItem[]>('/activity/reminders', { params: { staleAfterDays } }).then(r => r.data),
};
