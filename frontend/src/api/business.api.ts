import apiClient from './client';

export interface BusinessDto {
  id: string;
  name: string;
  category: string;
  description?: string;
  logoUrl?: string;
  whatsAppNumber?: string;
  instagramHandle?: string;
  facebookPageUrl?: string;
  currency: string;
  welcomeText?: string;
  deliveryInfo?: string;
  isOnboardingComplete: boolean;
}

export interface StorefrontSettingsDto {
  id: string;
  slug: string;
  themeColor: string;
  seoTitle?: string;
  seoDescription?: string;
  whatsAppCtaLabel: string;
  instagramCtaLabel: string;
  facebookCtaLabel: string;
  showOutOfStockProducts: boolean;
  allowPublicInquiries: boolean;
  announcementText?: string;
}

export interface IntegrationSettingsDto {
  // WhatsApp
  whatsAppPhoneNumberId?: string;
  whatsAppAccessToken?: string;  // masked — shows •••••• + last 6 chars
  whatsAppNumber?: string;
  whatsAppConfigured: boolean;
  // Instagram
  instagramAccountId?: string;
  instagramAccessToken?: string; // masked
  instagramConfigured: boolean;
  // Facebook
  facebookPageId?: string;
  facebookPageAccessToken?: string; // masked
  facebookConfigured: boolean;
  // Theme
  themeColor: string;
  storefrontSlug: string;
}

export interface WebhookInfoDto {
  webhookUrl: string;
  verifyToken: string;
  instructions: string[];
}

export const businessApi = {
  getBusiness: () => apiClient.get<BusinessDto>('/business').then(r => r.data),
  updateBusiness: (data: Partial<BusinessDto>) => apiClient.put('/business', data),
  getStorefrontSettings: () => apiClient.get<StorefrontSettingsDto>('/business/storefront').then(r => r.data),
  updateStorefrontSettings: (data: Partial<StorefrontSettingsDto>) => apiClient.put('/business/storefront', data),
  getIntegrationSettings: () => apiClient.get<IntegrationSettingsDto>('/integrations').then(r => r.data),
  saveIntegrationSettings: (data: Partial<IntegrationSettingsDto>) => apiClient.put('/integrations', data),
  // WhatsApp
  getWhatsAppWebhookInfo: () => apiClient.get<WebhookInfoDto>('/integrations/whatsapp/webhook-info').then(r => r.data),
  testWhatsApp: (toPhone: string) => apiClient.post('/integrations/whatsapp/test', { toId: toPhone }),
  // Instagram
  getInstagramWebhookInfo: () => apiClient.get<WebhookInfoDto>('/integrations/instagram/webhook-info').then(r => r.data),
  testInstagram: (toIgScopedId: string) => apiClient.post('/integrations/instagram/test', { toId: toIgScopedId }),
  // Facebook
  getFacebookWebhookInfo: () => apiClient.get<WebhookInfoDto>('/integrations/facebook/webhook-info').then(r => r.data),
  testFacebook: (toPageScopedId: string) => apiClient.post('/integrations/facebook/test', { toId: toPageScopedId }),
  /** @deprecated use getWhatsAppWebhookInfo */
  getWebhookInfo: () => apiClient.get<WebhookInfoDto>('/integrations/whatsapp/webhook-info').then(r => r.data),
};
