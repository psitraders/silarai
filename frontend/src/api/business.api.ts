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
  country: string;
  language: string;
  welcomeText?: string;
  deliveryInfo?: string;
  isOnboardingComplete: boolean;
}

export interface StorefrontSettingsDto {
  id: string;
  slug: string;
  themeColor: string;       // primary brand colour
  secondaryColor: string;   // secondary / gradient-end colour
  accentColor?: string;     // optional 3rd accent colour
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  returnPolicy?: string;
  whatsAppCtaLabel: string;
  instagramCtaLabel: string;
  facebookCtaLabel: string;
  showOutOfStockProducts: boolean;
  allowPublicInquiries: boolean;
  subCategoriesEnabled?: boolean;
  announcementText?: string;
  logoUrl?: string;
  bannerUrl?: string;
  // Google Analytics 4
  gA4MeasurementId?: string;
  gA4PropertyId?: string;
  hasGA4ServiceAccount?: boolean;
  hasGA4OAuthToken?: boolean;
  // Branding / UX
  faviconUrl?: string;
  loaderEnabled?: boolean;
}

export interface IntegrationSettingsDto {
  // WhatsApp (Meta Cloud API — per-tenant, via Embedded Signup)
  whatsAppConfigured: boolean;
  whatsAppNumber?: string;        // human-readable display number
  whatsAppPhoneNumberId?: string; // masked Meta ID
  whatsAppWabaId?: string;        // masked WABA ID
  // Instagram
  instagramAccountId?: string;
  instagramAccessToken?: string;  // masked
  instagramConfigured: boolean;
  // Facebook
  facebookPageId?: string;
  facebookPageAccessToken?: string; // masked
  facebookConfigured: boolean;
  // Razorpay
  razorpayKeyId?: string;
  razorpayConfigured: boolean;
  // Stripe
  stripeSecretKey?: string; // masked
  stripeConfigured: boolean;
  // PayPal
  payPalClientId?: string;
  payPalClientSecret?: string; // masked
  payPalConfigured: boolean;
  payPalSandbox: boolean;
  // Active gateway
  paymentGateway: string;
  // Theme
  themeColor: string;
  storefrontSlug: string;
}

// ── WhatsApp Templates ────────────────────────────────────────────────────────

export interface WaTemplateDto {
  id: string;
  name: string;
  displayName: string;
  category: string;
  language: string;
  body: string;
  headerText?: string;
  footerText?: string;
  variablesJson?: string;
  isActive: boolean;
  isDefault: boolean;
  metaTemplateId?: string;
  metaStatus: string; // LOCAL | PENDING | APPROVED | REJECTED | PAUSED | DISABLED
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWaTemplateRequest {
  name: string;
  displayName?: string;
  category?: string;
  language?: string;
  body: string;
  headerText?: string;
  footerText?: string;
  variablesJson?: string;
}

export interface SendWaCampaignRequest {
  phoneNumbers?: string[];
  templateParams?: string[];
  mediaUrl?: string;
}

export interface SendWaCampaignResult {
  sent: number;
  failed: number;
  message: string;
}

export interface SyncCatalogResult {
  synced: number;
  skipped: number;
  message: string;
}

export interface CatalogImportPreviewItem {
  retailerId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  inStock: boolean;
  alreadyExists: boolean;
}

export interface CatalogImportPreview {
  totalInCatalog: number;
  alreadyExists: number;
  willImport: number;
  items: CatalogImportPreviewItem[];
}

export interface ImportCatalogResult {
  imported: number;
  skipped: number;
  message: string;
}

export interface WebhookInfoDto {
  webhookUrl: string;
  verifyToken: string;
  instructions: string[];
}

export interface AiSettingsDto {
  autoReplyEnabled: boolean;
  autoReplyTone: string;
  aiStoreContext?: string;
  autoCampaignEnabled: boolean;
}

export interface ConversationSessionDto {
  id: string;
  externalCustomerId: string;
  channel: string;
  state: string;
  collectedName?: string;
  collectedPhone?: string;
  collectedEmail?: string;
  collectedAddress?: string;
  cartJson: string;
  messagesJson: string;
  isActive: boolean;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface ConversationSessionsResult {
  items: ConversationSessionDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AutoCampaignDto {
  id: string;
  productId: string;
  productName: string;
  generatedCaption: string;
  generatedHashtags: string;
  generatedCta: string;
  generatedImageUrl?: string;
  postedToInstagram: boolean;
  instagramPostId?: string;
  postedToFacebook: boolean;
  facebookPostId?: string;
  sentViaWhatsAppBroadcast: boolean;
  whatsAppRecipientsCount: number;
  status: string;
  errorLog?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AutoCampaignsResult {
  items: AutoCampaignDto[];
  total: number;
  page: number;
  pageSize: number;
}

export const businessApi = {
  getBusiness: () => apiClient.get<BusinessDto>('/business').then(r => r.data),
  updateBusiness: (data: Partial<BusinessDto>) => apiClient.put('/business', data),
  getStorefrontSettings: () => apiClient.get<StorefrontSettingsDto>('/business/storefront').then(r => r.data),
  updateStorefrontSettings: (data: Partial<StorefrontSettingsDto>) => apiClient.put('/business/storefront', data),
  getIntegrationSettings: () => apiClient.get<IntegrationSettingsDto>('/integrations').then(r => r.data),
  saveIntegrationSettings: (data: Partial<IntegrationSettingsDto>) => apiClient.put('/integrations', data),
  // WhatsApp (Meta Cloud API — Embedded Signup)
  getWhatsAppEmbeddedSignupConfig: () =>
    apiClient.get<{ appId: string; configId?: string }>('/integrations/whatsapp/embedded-signup-config').then(r => r.data),
  connectWhatsApp: (accessToken: string, phoneNumberId: string, wabaId?: string) =>
    apiClient.post<{ message: string; phoneNumber?: string; phoneNumberId: string }>(
      '/integrations/whatsapp/connect',
      { accessToken, phoneNumberId, wabaId }
    ).then(r => r.data),
  disconnectWhatsApp: () => apiClient.delete('/integrations/whatsapp/disconnect'),
  getWhatsAppWebhookInfo: () => apiClient.get<WebhookInfoDto>('/integrations/whatsapp/webhook-info').then(r => r.data),
  testWhatsApp: (toPhone: string) => apiClient.post('/integrations/whatsapp/test', { toId: toPhone }),
  syncWhatsAppCatalog: () => apiClient.post<SyncCatalogResult>('/integrations/whatsapp/sync-catalog').then(r => r.data),
  // Instagram
  getInstagramWebhookInfo: () => apiClient.get<WebhookInfoDto>('/integrations/instagram/webhook-info').then(r => r.data),
  testInstagram: (toIgScopedId: string) => apiClient.post('/integrations/instagram/test', { toId: toIgScopedId }),
  // Facebook
  getFacebookWebhookInfo: () => apiClient.get<WebhookInfoDto>('/integrations/facebook/webhook-info').then(r => r.data),
  testFacebook: (toPageScopedId: string) => apiClient.post('/integrations/facebook/test', { toId: toPageScopedId }),
  /** @deprecated use getWhatsAppWebhookInfo */
  getWebhookInfo: () => apiClient.get<WebhookInfoDto>('/integrations/whatsapp/webhook-info').then(r => r.data),

  // ── Autonomous AI ──────────────────────────────────────────────────────────
  getAiSettings: () =>
    apiClient.get<AiSettingsDto>('/business/ai-settings').then(r => r.data),
  updateAiSettings: (data: AiSettingsDto) =>
    apiClient.put('/business/ai-settings', data),

  getConversations: (params?: { page?: number; pageSize?: number; activeOnly?: boolean }) =>
    apiClient.get<ConversationSessionsResult>('/business/conversations', { params }).then(r => r.data),

  getAutoCampaigns: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get<AutoCampaignsResult>('/business/auto-campaigns', { params }).then(r => r.data),

  // ── Catalog import (Meta → Silarai) ──────────────────────────────────────
  /** Fetch preview of products in the Meta Catalog — no data written */
  previewCatalogImport: () =>
    apiClient.get<CatalogImportPreview>('/business/catalog/import-preview').then(r => r.data),
  /** Import selected products (or all new ones if retailerIds is empty) */
  confirmCatalogImport: (retailerIds: string[]) =>
    apiClient.post<ImportCatalogResult>('/business/catalog/import', { retailerIds }).then(r => r.data),

  // ── WhatsApp Templates ──────────────────────────────────────────────────────
  getWaTemplates: () =>
    apiClient.get<WaTemplateDto[]>('/wa-templates').then(r => r.data),
  syncWaTemplates: () =>
    apiClient.post<{ synced: number; message: string }>('/wa-templates/sync').then(r => r.data),
  getWaTemplate: (id: string) =>
    apiClient.get<WaTemplateDto>(`/wa-templates/${id}`).then(r => r.data),
  createWaTemplate: (data: CreateWaTemplateRequest) =>
    apiClient.post<{ id: string }>('/wa-templates', data).then(r => r.data),
  updateWaTemplate: (id: string, data: Partial<CreateWaTemplateRequest> & { isActive?: boolean }) =>
    apiClient.put(`/wa-templates/${id}`, data),
  deleteWaTemplate: (id: string) =>
    apiClient.delete(`/wa-templates/${id}`),
  sendWaCampaign: (id: string, data: SendWaCampaignRequest) =>
    apiClient.post<SendWaCampaignResult>(`/wa-templates/${id}/send`, data).then(r => r.data),

  /** Upload logo, banner, or favicon; returns { url } */
  uploadStoreImage: (file: File, type: 'logo' | 'banner' | 'favicon') => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<{ url: string }>(`/business/upload?type=${type}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data.url);
  },
};

